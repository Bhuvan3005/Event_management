import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// Get Reviews for an Event
router.get("/:eventId", async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from("review")
      .select(`
        *,
        users (name)
      `)
      .eq("event_id", parseInt(req.params.eventId))
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(reviews);
  } catch (error) {
    console.error("FETCH REVIEWS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create a Review
router.post("/", async (req, res) => {
  try {
    const { event_id, user_id, rating, review_text } = req.body;

    const parsedUserId = parseInt(user_id);
    const parsedEventId = parseInt(event_id);

    if (isNaN(parsedUserId) || isNaN(parsedEventId)) {
      return res.status(400).json({ error: "Invalid User or Event ID" });
    }

    const { data: review, error } = await supabase
      .from("review")
      .insert([
        {
          event_id: parsedEventId,
          user_id: parsedUserId,
          rating,
          review_text
        }
      ])
      .select(`
        *,
        users (name)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Review posted", review });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    res.status(500).json({ error: "Failed to post review" });
  }
});

export default router;
