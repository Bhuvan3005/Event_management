import express from "express";
import supabase from "../supabaseClient.js";

const router = express.Router();

// ✅ CREATE BOOKING
router.post("/", async (req, res) => {
  try {
    const { userId, eventId, showtimeId, totalAmount, quantity, couponId } = req.body;

    const parsedUserId = parseInt(userId);
    const parsedShowtimeId = parseInt(showtimeId) || 1;
    const requestedQty = parseInt(quantity) || 1;

    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: "Invalid User ID format. Please log out and back in." });
    }

    // 1. Find Venue for this Showtime
    const { data: showtime, error: showErr } = await supabase
      .from("showtime")
      .select("venue_id")
      .eq("showtime_id", parsedShowtimeId)
      .single();
    if (showErr || !showtime) throw new Error("Showtime not found");

    // 2. Fetch all seats for venue and all booked seats
    const { data: allSeats } = await supabase.from("seat").select("*").eq("venue_id", showtime.venue_id);
    const { data: existingBookings } = await supabase.from("booking").select("booking_id").eq("showtime_id", parsedShowtimeId);
    
    let bookedSeatIds = [];
    if (existingBookings && existingBookings.length > 0) {
      const bIds = existingBookings.map(b => b.booking_id);
      const { data: tickets } = await supabase.from("ticket").select("seat_id").in("booking_id", bIds);
      bookedSeatIds = tickets ? tickets.map(t => t.seat_id) : [];
    }

    const availableSeats = allSeats.filter(s => !bookedSeatIds.includes(s.seat_id));
    if (availableSeats.length < requestedQty) {
      return res.status(400).json({ error: "Not enough seats available at this venue" });
    }

    const seatsToBook = availableSeats.slice(0, requestedQty);

    // 3. Create Booking
    const { data: booking, error: bookingErr } = await supabase
      .from("booking")
      .insert([
        {
          user_id: parsedUserId,
          showtime_id: parsedShowtimeId,
          total_amount: totalAmount,
          status: "confirmed"
        },
      ])
      .select()
      .single();
    if (bookingErr) throw bookingErr;

    // 4. Create Tickets
    const ticketInserts = seatsToBook.map(seat => ({
      booking_id: booking.booking_id,
      seat_id: seat.seat_id,
      price: totalAmount / requestedQty // distribute total price evenly
    }));
    await supabase.from("ticket").insert(ticketInserts);

    // 5. Link Coupon if provided
    if (couponId) {
      await supabase.from("booking_coupon").insert([{
        booking_id: booking.booking_id,
        coupon_id: couponId
      }]);
    }

    res.status(201).json({
      message: "Booking confirmed and seats assigned!",
      booking,
      assignedSeats: seatsToBook
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ error: error.message || "Failed to book" });
  }
});

// GET USER BOOKINGS
router.get("/user/:userId", async (req, res) => {
  try {
    const parsedUserId = parseInt(req.params.userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: "Invalid User ID format. Please log out and back in." });
    }

    const { data: bookings, error } = await supabase
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
      .eq("user_id", parsedUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(bookings);
  } catch (error) {
    console.error("FETCH USER BOOKINGS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE BOOKING (CANCEL)
router.delete("/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("booking")
      .delete()
      .eq("booking_id", req.params.id);

    if (error) throw error;
    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("DELETE BOOKING ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;