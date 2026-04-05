import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import supabase from "../supabaseClient.js";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password_hash: hashedPassword,
          role: role || 'user'
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // 🚀 If role is organizer, create organizer record
    if (role === "organizer") {
      const { error: orgError } = await supabase
        .from("organizer")
        .insert([{ 
          organizer_id: newUser.user_id, // Link to user_id
          organization_name: `${name}'s Org`, 
          email: email 
        }]);
      
      if (orgError) {
        console.error("ORGANIZER INSERT ERROR:", orgError);
        // We continue anyway, but log it
      }
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user || fetchError) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user.user_id },
      process.env.JWT_SECRET || "your_jwt_secret_here",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login Successfully",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
