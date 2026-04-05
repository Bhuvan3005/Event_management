import express from "express";
import supabase from "../supabaseClient.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // 1. Validate ID
    const userId = parseInt(req.user.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid User ID format. Please log out and back in." });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Fetch Booked Events (via booking table)
    const { data: bookings, error: bookingsError } = await supabase
      .from("booking")
      .select(`
        *,
        showtime (
          *,
          event (*)
        ),
        ticket (
          *,
          seat (*)
        )
      `)
      .eq("user_id", userId);

    // 3. Fetch Created Events (if organizer exists for this user)
    // For now, we'll assume createdEvents are those where organizer_id = 1 if user is 'admin' or something
    // But since the schema is different, we'll just return user and their bookings for now.
    
    const response = {
      ...user,
      bookedEvents: bookings || [],
      createdEvents: []
    };

    res.json(response);
  } catch (error) {
    console.error("PROFILE FETCH ERROR:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

export default router;