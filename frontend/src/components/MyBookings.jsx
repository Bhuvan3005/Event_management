import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  if (!userId) {
  return <h2>Please login first</h2>;
}
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/bookings/user/${userId}`
        );

        const data = await res.json();
        setBookings(data);

      } catch (error) {
        console.error(error);
      }
    };

    fetchBookings();
  }, [userId]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Booking cancelled ✅");
        setBookings(bookings.filter((b) => b.booking_id !== bookingId));
      } else {
        alert("Failed to cancel booking");
      }
    } catch (error) {
      console.error(error);
      alert("Error cancelling booking");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>🎟️ My Bookings</h2>

      {bookings.length === 0 ? (
        <p>No bookings yet 😢</p>
      ) : (
        bookings.map((b, index) => (
          <div key={index} style={{
            border: "1px solid #ccc",
            padding: "15px",
            margin: "15px 0",
            borderRadius: "12px",
            backgroundColor: "#fefefe",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            position: "relative"
          }}>
            <h3>{b.showtime?.event?.title || "Unknown Event"}</h3>
            <p>Status: <strong style={{ color: b.status === "confirmed" ? "green" : "orange" }}>{b.status}</strong></p>
            <p>Total: ₹{b.total_amount}</p>
            <p>Booking Date: {new Date(b.created_at).toLocaleString()}</p>
            
            <button 
              onClick={() => handleCancelBooking(b.booking_id)}
              style={{
                backgroundColor: "#ff4d4d",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "10px"
              }}
            >
              Cancel Booking
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;