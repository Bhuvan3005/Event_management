import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// Create Event
router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      category, // will try to map to category_id
      language,
      duration_minutes,
      organizer_id,
      image_url,
      price
    } = req.body;

    // Mapping category name to ID for the new schema
    const categoryMap = { Technology: 1, Tech: 1, Music: 2, Art: 3 };
    const category_id = categoryMap[category] || 1;

    const { data: event, error } = await supabase
      .from("event")
      .insert([
        {
          title,
          description,
          category_id,
          language: language || "English",
          duration_minutes: duration_minutes || 120,
          organizer_id: organizer_id || 1,
          image_url: image_url,
          price: price || 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // 🚀 Automatically create a default showtime so it shows up in dashboard joins
    const { error: showError } = await supabase
      .from("showtime")
      .insert([{
        event_id: event.event_id,
        venue_id: 1, // Default to first venue
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7200000).toISOString() // +2 hours
      }]);

    if (showError) console.error("SHOWTIME ERROR:", showError);

    return res.status(201).json({
      message: "Event created successfully",
      event,
    });
  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Get All Events
router.get("/", async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from("event")
      .select(`
        *,
        category (name),
        organizer (organization_name),
        showtime (
          *,
          venue (*)
        )
      `);

    if (error) throw error;

    // Flatten data for frontend compatibility
    const formattedEvents = events.map(e => ({
      ...e,
      category: e.category?.name,
      location: e.showtime?.[0]?.venue?.name || "Online",
      date: e.showtime?.[0]?.start_time ? new Date(e.showtime[0].start_time).toLocaleDateString() : "TBA",
      time: e.showtime?.[0]?.start_time ? new Date(e.showtime[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBA",
      price: e.price || 0,
      url: e.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1170&auto=format&fit=crop"
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error("FETCH EVENTS ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Delete Event
router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("event")
      .delete()
      .eq("event_id", req.params.id);

    if (error) throw error;
    res.json({ message: "Event Deleted" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Update Event
router.put("/:id", async (req, res) => {
  try {
    const { data: updatedEvent, error } = await supabase
      .from("event")
      .update(req.body)
      .eq("event_id", req.params.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({ message: "Event not found" });
      }
      throw error;
    }

    res.json({
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Single Event
router.get("/:id", async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from("event")
      .select(`
        *,
        category (name),
        organizer (organization_name),
        showtime (
          *,
          venue (*)
        )
      `)
      .eq("event_id", req.params.id)
      .single();

    if (error || !event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const formattedEvent = {
       ...event,
       category: event.category?.name,
       location: event.showtime?.[0]?.venue?.name || "Online",
       date: event.showtime?.[0]?.start_time ? new Date(event.showtime[0].start_time).toLocaleDateString() : "TBA",
       time: event.showtime?.[0]?.start_time ? new Date(event.showtime[0].start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBA",
       price: event.price || 0,
       url: event.image_url || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1170&auto=format&fit=crop"
    };

    return res.json(formattedEvent);
  } catch (err) {
    console.error("FETCH ONE EVENT ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;