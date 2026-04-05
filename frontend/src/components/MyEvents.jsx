import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events");
      const data = await res.json();

      const user = JSON.parse(localStorage.getItem("user"));

      // 🔥 filter only my events (organizer_id)
      const myEvents = data.filter(
        (event) => event.organizer_id === user.id
      );

      setEvents(myEvents);
    } catch (err) {
      console.log(err);
    }
  };

  fetchEvents();
}, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5000/api/events/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // remove from UI
      setEvents(events.filter(e => e.event_id !== id));

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Events</h1>

      {events.length === 0 ? (
        <p>No events created yet.</p>
      ) : (
        events.map((event) => (
          <div key={event.event_id} style={{
            border: "1px solid #ccc",
            padding: "10px",
            margin: "20px 0",
            borderRadius: "12px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            backgroundColor: "#fff"
          }}>
            <h3>{event.title}</h3>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Duration:</strong> {event.duration_minutes} mins</p>

            {/* Organizer controls */}
            <div style={{ marginTop: "15px" }}>
              <button 
                onClick={() => navigate(`/edit-event/${event.event_id}`)}
                style={{ cursor: "pointer", padding: "8px 16px", borderRadius: "4px", border: "1px solid #333" }}
              >
                Edit
              </button>

              <button
                style={{ marginLeft: "10px", color: "white", backgroundColor: "#ff4444", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer" }}
                onClick={() => handleDelete(event.event_id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MyEvents;