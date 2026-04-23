import { Calendar, MapPin, FileText } from "lucide-react";

export default function EventsPage({ events }) {
  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <section style={{ display: "grid", gap: "24px", marginTop: "8px" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #082f49, #0f766e)",
          color: "white",
          borderRadius: "28px",
          padding: "28px",
          boxShadow: "0 28px 60px rgba(15, 23, 42, 0.18)",
        }}
      >
        <div style={{ fontSize: "14px", fontWeight: 800, opacity: 0.9 }}>
          Schedule
        </div>
        <h2 style={{ margin: "10px 0 0", fontSize: "34px", letterSpacing: "-0.03em" }}>
          Upcoming Events
        </h2>
        <p style={{ marginTop: "10px", opacity: 0.85, lineHeight: 1.6 }}>
          {sorted.length === 0
            ? "No events scheduled yet."
            : `${sorted.length} event${sorted.length !== 1 ? "s" : ""} coming up.`}
        </p>
      </div>

      {sorted.length === 0 ? (
        <p style={{ color: "#64748b" }}>Check back soon for upcoming meets and events.</p>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {sorted.map((event) => (
            <div
              key={event.id}
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "24px",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
                display: "grid",
                gap: "12px",
              }}
            >
              <div style={{ fontWeight: 800, fontSize: "20px", color: "#0f172a" }}>
                {event.title}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "14px" }}>
                  <Calendar size={14} />
                  <span>{event.date}</span>
                </div>
                {event.location && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#475569", fontSize: "14px" }}>
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <FileText size={14} color="#94a3b8" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <p style={{ margin: 0, color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
                    {event.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
