import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddEventPage({ addEvent }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};
    if (!title.trim()) newErrors.title = "Event title is required.";
    if (!date) newErrors.date = "Event date is required.";
    if (!location.trim()) newErrors.location = "Location is required.";
    if (!description.trim()) newErrors.description = "Description is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addEvent({ title, date, location, description });
    navigate("/coach-dashboard");
  }

  return (
    <section style={{ marginTop: "30px", maxWidth: "700px" }}>
      <h2>Add Event</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label>Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Spring Invitational"
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              border: errors.title ? "1px solid red" : "1px solid #ccc",
            }}
          />
          {errors.title && (
            <p style={{ color: "red", marginTop: "5px" }}>{errors.title}</p>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              border: errors.date ? "1px solid red" : "1px solid #ccc",
            }}
          />
          {errors.date && (
            <p style={{ color: "red", marginTop: "5px" }}>{errors.date}</p>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Loyola Pool"
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              border: errors.location ? "1px solid red" : "1px solid #ccc",
            }}
          />
          {errors.location && (
            <p style={{ color: "red", marginTop: "5px" }}>{errors.location}</p>
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What should parents know about this event?"
            rows="4"
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              border: errors.description ? "1px solid red" : "1px solid #ccc",
            }}
          />
          {errors.description && (
            <p style={{ color: "red", marginTop: "5px" }}>{errors.description}</p>
          )}
        </div>

        <button
          type="submit"
          style={{
            padding: "10px 15px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#0ea5e9",
            color: "white",
            cursor: "pointer",
          }}
        >
          Save Event
        </button>
      </form>
    </section>
  );
}
