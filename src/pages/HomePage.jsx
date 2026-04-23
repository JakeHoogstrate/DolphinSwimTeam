import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HomePage({ events, homepageSlides = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const upcomingEvents = [...events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const slides = homepageSlides.length
    ? homepageSlides
    : [
        {
          id: "default-1",
          title: "Train with purpose",
          subtitle: "Track progress, manage swimmers, and keep families connected.",
          imageUrl:
            "https://images.unsplash.com/photo-1519315901367-f34ff9154487?auto=format&fit=crop&w=1400&q=80",
        },
        {
          id: "default-2",
          title: "Race day starts here",
          subtitle: "Share events, update times, and celebrate swimmer growth.",
          imageUrl:
            "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?auto=format&fit=crop&w=1400&q=80",
        },
      ];

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const activeSlide = slides[currentSlide] || slides[0];

  return (
    <section style={{ display: "grid", gap: "28px" }}>
      <div
        style={{
          position: "relative",
          minHeight: "430px",
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow: "0 30px 60px rgba(15, 23, 42, 0.18)",
          backgroundImage: `linear-gradient(90deg, rgba(2, 6, 23, 0.74), rgba(2, 6, 23, 0.2)), url(${activeSlide.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            padding: "56px",
            maxWidth: "680px",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "56px",
              lineHeight: 1.02,
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            {activeSlide.title}
          </h1>

          <p
            style={{
              marginTop: "18px",
              fontSize: "18px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.92)",
            }}
          >
            {activeSlide.subtitle}
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "22px",
            left: "30px",
            display: "flex",
            gap: "8px",
          }}
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: index === currentSlide ? "30px" : "10px",
                height: "10px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                background: index === currentSlide ? "white" : "rgba(255,255,255,0.5)",
                transition: "all 0.25s ease",
              }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "24px", color: "#0f172a" }}>
          Upcoming Events
        </h2>

        <div style={{ marginTop: "16px", display: "grid", gap: "14px" }}>
          {upcomingEvents.length === 0 ? (
            <p style={{ color: "#64748b" }}>No upcoming events yet.</p>
          ) : (
            upcomingEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  borderRadius: "18px",
                  padding: "18px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: 800, color: "#0f172a" }}>{event.title}</div>
                <div style={{ marginTop: "6px", color: "#334155", fontSize: "14px" }}>
                  {event.date}
                </div>
                <div style={{ marginTop: "4px", color: "#64748b", fontSize: "14px" }}>
                  {event.location}
                </div>
              </div>
            ))
          )}
        </div>

        <Link
          to="/events"
          style={{
            display: "inline-block",
            marginTop: "18px",
            textDecoration: "none",
            color: "#0284c7",
            fontWeight: 800,
          }}
        >
          See all events →
        </Link>
      </div>
    </section>
  );
}