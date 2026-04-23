import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CoachEditTimesPage({ swimmers, addSwimTime }) {
  const { swimmerId } = useParams();
  const navigate = useNavigate();

  const swimmer = swimmers.find((s) => String(s.id) === String(swimmerId));

  const [event, setEvent] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState({});

  if (!swimmer) {
    return (
      <section style={{ marginTop: "30px" }}>
        <h2>Swimmer Not Found</h2>
      </section>
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};
    if (!event) newErrors.event = "Event is required.";
    if (!time.trim()) newErrors.time = "Time is required.";
    if (!date) newErrors.date = "Date is required.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    addSwimTime(swimmer.id, { event, time, date });
    navigate(`/swimmer/${swimmer.id}`);
  }

  return (
    <section style={{ marginTop: "30px", maxWidth: "700px" }}>
      <h2>Edit Times — {swimmer.name}</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label>Event</label>
          <select
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              border: errors.event ? "1px solid red" : "1px solid #ccc",
            }}
          >
            <option value="">Select an event</option>
            {(swimmer.events || []).map((ev) => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>
          {errors.event && <p style={{ color: "red" }}>{errors.event}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Time</label>
          <input
            type="text"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 31.22 or 1:04.55"
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
              border: errors.time ? "1px solid red" : "1px solid #ccc",
            }}
          />
          {errors.time && <p style={{ color: "red" }}>{errors.time}</p>}
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
          {errors.date && <p style={{ color: "red" }}>{errors.date}</p>}
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
          Save Time
        </button>
      </form>
    </section>
  );
}
