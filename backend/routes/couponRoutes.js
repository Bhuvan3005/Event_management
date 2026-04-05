import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// Validate Coupon
router.post("/validate", async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Coupon code is required" });
    }

    const { data: coupon, error } = await supabase
      .from("coupon")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error || !coupon) {
      return res.status(404).json({ error: "Invalid coupon code" });
    }

    if (totalAmount < coupon.min_amount) {
      return res.status(400).json({ error: `Minimum amount of Rs. ${coupon.min_amount} required` });
    }

    // Calculate discount
    let discountValue = 0;
    if (coupon.discount_type === "percentage") {
      discountValue = totalAmount * (coupon.discount_value / 100);
    } else if (coupon.discount_type === "fixed") {
      discountValue = coupon.discount_value;
    }

    // Ensure we don't discount more than the total
    discountValue = Math.min(discountValue, totalAmount);
    const newTotal = totalAmount - discountValue;

    res.json({
      message: "Coupon applied successfully!",
      couponId: coupon.coupon_id,
      discountValue,
      newTotal
    });

  } catch (error) {
    console.error("COUPON VALIDATE ERROR:", error);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
});

export default router;
