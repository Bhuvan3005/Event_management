import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config.js";

const Profile = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(res.data);
    };

    fetchProfile();
  }, []);

  if (!user) return <h2>Loading...</h2>;

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      <div className="profile-info">
        <h3>Name: {user.name}</h3>
        <h3>Email: {user.email}</h3>
      </div>

      <div>
        <h2>Created Events</h2>
        {user.createdEvents.length === 0 ? (
          <p>No events created</p>
        ) : (
          user.createdEvents?.map((event) => (
            <div key={event.event_id || event.id}>
              <h4>{event.title}</h4>
              <p>{event.date || event.created_at}</p>
            </div>
          ))
        )}
      </div>

      <div>
        <h2>Booked Events</h2>
        {user.bookedEvents.length === 0 ? (
          <p>No bookings yet</p>
        ) : (
          user.bookedEvents.map((booking) => (
            <div key={booking.booking_id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}>
              <h4>{booking.showtime?.event?.title || "Unknown Event"}</h4>
              <p><strong>Date:</strong> {booking.showtime ? new Date(booking.showtime.start_time).toLocaleDateString() : "-"}</p>
              <div style={{ marginTop: '10px' }}>
                <h5>Assigned Seats:</h5>
                {booking.ticket && booking.ticket.length > 0 ? (
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {booking.ticket.map(t => (
                      <li key={t.ticket_id} style={{ display: 'inline-block', background: '#e0e0e0', padding: '5px 10px', margin: '5px', borderRadius: '4px' }}>
                        Row {t.seat?.row_label} - Seat {t.seat?.seat_number} ({t.seat?.seat_type})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No seats assigned.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;