import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    category: "",
    date: "",
    time: "",
    location: "",
    price: "",
    url: "",
    description: ""
  });

  // ✅ Fetch existing event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/events/${id}`);
        const data = await res.json();

        if (data) {
          setForm({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "",
            language: data.language || "English",
            duration_minutes: data.duration_minutes || 120,
            organizer_id: data.organizer_id,
            price: data.price || "",
            url: data.image_url || ""
          });
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchEvent();
  }, [id]);

  // handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Update event
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/events/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            category: form.category,
            language: form.language,
            duration_minutes: Number(form.duration_minutes),
            price: form.price,
            image_url: form.url
          })
        }
      );

      if (res.ok) {
        alert("Event updated successfully");
        navigate("/my-events");
      } else {
        alert("Update failed");
      }

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Edit Event</h1>

      <form onSubmit={handleSubmit}>
        <input name="title" value={form.title} onChange={handleChange} />
        <input name="category" value={form.category} onChange={handleChange} />
        <input type="date" name="date" value={form.date} onChange={handleChange} />
        <input type="time" name="time" value={form.time} onChange={handleChange} />
        <input name="location" value={form.location} onChange={handleChange} />
        <input name="price" value={form.price} onChange={handleChange} />
        <input name="url" value={form.url} onChange={handleChange} />
        <textarea name="description" value={form.description} onChange={handleChange} />

        <button type="submit">Update Event</button>
      </form>
    </div>
  );
};

export default EditEvent;