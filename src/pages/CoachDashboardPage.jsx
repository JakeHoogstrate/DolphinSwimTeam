import { Link } from "react-router-dom";
import { useState } from "react";
import { Users, Calendar, MessageSquare } from "lucide-react";

export default function CoachDashboardPage({
  events = [],
  swimmers = [],
  parents = [],
  homepageSlides = [],
  currentUserProfile,
  addHomepageSlide = async () => {},
  removeHomepageSlide = async () => {},
  removeSwimmer = async () => {},
  removeEvent = async () => {},
  templates = {},
  onSaveTemplates = async () => {},
}) {
  const [slideTitle, setSlideTitle] = useState("");
  const [slideSubtitle, setSlideSubtitle] = useState("");
  const [slideImageUrl, setSlideImageUrl] = useState("");
  const [eventTemplate, setEventTemplate] = useState(templates.eventAnnouncement || "");
  const [levelUpTemplate, setLevelUpTemplate] = useState(templates.levelUp || "");
  const [templateSaveStatus, setTemplateSaveStatus] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  if (!currentUserProfile) {
    return (
      <section style={{ marginTop: "30px" }}>
        <h2>Coach Dashboard</h2>
        <p>Loading...</p>
      </section>
    );
  }

  if (currentUserProfile.role !== "coach") {
    return (
      <section style={{ marginTop: "30px" }}>
        <h2>Coach Dashboard</h2>
        <p>You need to be logged in as a coach to view this page.</p>
      </section>
    );
  }

  function getParentName(parentId) {
    const parent = parents.find((p) => String(p.id) === String(parentId));
    return parent ? `${parent.name} (${parent.email})` : "Unassigned";
  }

  async function handleSlideUpload(e) {
    e.preventDefault();

    if (!slideImageUrl.trim()) {
      setUploadStatus("Please enter an image URL first.");
      return;
    }

    try {
      setUploadStatus("Saving...");

      await addHomepageSlide({
        imageUrl: slideImageUrl.trim(),
        title: slideTitle,
        subtitle: slideSubtitle,
      });

      setSlideTitle("");
      setSlideSubtitle("");
      setSlideImageUrl("");
      setUploadStatus("Slide added successfully.");
    } catch (error) {
      console.error("Slide add failed:", error);
      setUploadStatus("Something went wrong. Check the URL and try again.");
    }
  }

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
          Dolphin Swim Team
        </div>
        <h2
          style={{
            margin: "10px 0 0 0",
            fontSize: "34px",
            letterSpacing: "-0.03em",
          }}
        >
          Coach Dashboard
        </h2>
        <p style={{ marginTop: "14px", maxWidth: "760px", lineHeight: 1.7 }}>
          Add swimmers, assign parents, update times, create events, and keep
          the home page polished with fresh carousel images.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "18px",
            flexWrap: "wrap",
          }}
        >
          <Link to="/add-swimmer">
            <button
              style={{
                padding: "12px 16px",
                borderRadius: "999px",
                border: "none",
                background: "white",
                color: "#0f172a",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Add Swimmer
            </button>
          </Link>

<Link to="/add-event">
            <button
              style={{
                padding: "12px 16px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Add Event
            </button>
          </Link>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "22px",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Home Page Carousel</h3>
          <p style={{ color: "#64748b", marginTop: "8px" }}>
            Add images that appear on the home page. Paste any public image URL.
          </p>

          <form onSubmit={handleSlideUpload} style={{ marginTop: "18px" }}>
            <input
              type="text"
              placeholder="Slide title"
              value={slideTitle}
              onChange={(e) => setSlideTitle(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Slide subtitle"
              value={slideSubtitle}
              onChange={(e) => setSlideSubtitle(e.target.value)}
              rows={4}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <input
              type="url"
              placeholder="Image URL (https://...)"
              value={slideImageUrl}
              onChange={(e) => setSlideImageUrl(e.target.value)}
              style={inputStyle}
            />

            <button type="submit" style={primaryButtonStyle}>
              Add Carousel Slide
            </button>
          </form>

          {uploadStatus && (
            <p style={{ marginTop: "14px", color: "#0369a1", fontWeight: 700 }}>
              {uploadStatus}
            </p>
          )}
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "24px",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Current Carousel Slides</h3>

          <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
            {homepageSlides.length === 0 ? (
              <p style={{ color: "#64748b" }}>No uploaded slides yet.</p>
            ) : (
              homepageSlides.map((slide) => (
                <div
                  key={slide.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "14px",
                    display: "flex",
                    gap: "14px",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    style={{
                      width: "120px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "14px",
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: "#0f172a" }}>
                      {slide.title}
                    </div>
                    <div
                      style={{
                        color: "#64748b",
                        marginTop: "4px",
                        fontSize: "14px",
                      }}
                    >
                      {slide.subtitle}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      removeHomepageSlide(slide.id, slide.storagePath)
                    }
                    style={{
                      border: "none",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      fontWeight: 800,
                      borderRadius: "999px",
                      padding: "10px 12px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
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
        <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={18} /> Swimmers
        </h3>

        <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
          {swimmers.length === 0 ? (
            <p style={{ color: "#64748b" }}>No swimmers added yet.</p>
          ) : (
            swimmers.map((swimmer) => (
              <div
                key={swimmer.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "18px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#0f172a",
                      fontSize: "18px",
                    }}
                  >
                    {swimmer.name}
                  </div>
                  <div style={{ color: "#475569", marginTop: "6px" }}>
                    {swimmer.ageGroup} • {swimmer.gender}
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      marginTop: "4px",
                      fontSize: "14px",
                    }}
                  >
                    Parent: {getParentName(swimmer.parentId)}
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      marginTop: "4px",
                      fontSize: "14px",
                    }}
                  >
                    Visibility: {swimmer.isPublic ? "Public" : "Private"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <Link to={`/coach-edit-times/${swimmer.id}`}>
                    <button style={secondaryButtonStyle}>Edit Times</button>
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${swimmer.name}? This cannot be undone.`)) {
                        removeSwimmer(swimmer.id);
                      }
                    }}
                    style={deleteButtonStyle}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
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
        <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <Calendar size={18} /> Upcoming Events
        </h3>

        <div style={{ display: "grid", gap: "14px", marginTop: "16px" }}>
          {events.length === 0 ? (
            <p style={{ color: "#64748b" }}>No upcoming events yet.</p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>
                    {event.title}
                  </div>
                  <div style={{ color: "#475569", marginTop: "6px" }}>
                    {event.date}
                  </div>
                  <div style={{ color: "#64748b", marginTop: "4px" }}>
                    {event.location}
                  </div>
                  <div style={{ color: "#64748b", marginTop: "8px" }}>
                    {event.description}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete "${event.title}"? This cannot be undone.`)) {
                      removeEvent(event.id);
                    }
                  }}
                  style={{ ...deleteButtonStyle, flexShrink: 0 }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Message Templates */}
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        <h3 style={{ marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageSquare size={18} /> Message Templates
        </h3>
        <p style={{ color: "#64748b", marginTop: "4px", fontSize: "14px" }}>
          Customize the automated messages sent to parents. Available variables are shown below each field.
        </p>

        <div style={{ marginTop: "20px", display: "grid", gap: "20px" }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
              New Event Announcement
            </label>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 8px" }}>
              Variables: {"{{parentName}}"}, {"{{title}}"}, {"{{date}}"}, {"{{location}}"}, {"{{description}}"}, {"{{coachName}}"}
            </p>
            <textarea
              value={eventTemplate}
              onChange={(e) => setEventTemplate(e.target.value)}
              rows={8}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "13px" }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 700, fontSize: "14px", color: "#0f172a" }}>
              Level-Up Notification
            </label>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 8px" }}>
              Variables: {"{{parentName}}"}, {"{{swimmerName}}"}, {"{{level}}"}, {"{{event}}"}, {"{{time}}"}, {"{{coachName}}"}
            </p>
            <textarea
              value={levelUpTemplate}
              onChange={(e) => setLevelUpTemplate(e.target.value)}
              rows={8}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace", fontSize: "13px" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <button
              onClick={async () => {
                try {
                  setTemplateSaveStatus("Saving…");
                  await onSaveTemplates({ eventAnnouncement: eventTemplate, levelUp: levelUpTemplate });
                  setTemplateSaveStatus("Saved!");
                  setTimeout(() => setTemplateSaveStatus(""), 2000);
                } catch {
                  setTemplateSaveStatus("Save failed.");
                }
              }}
              style={primaryButtonStyle}
            >
              Save Templates
            </button>
            {templateSaveStatus && (
              <span style={{ fontSize: "14px", color: "#0369a1", fontWeight: 600 }}>
                {templateSaveStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  marginBottom: "12px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const primaryButtonStyle = {
  border: "none",
  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
  color: "white",
  fontWeight: 800,
  borderRadius: "999px",
  padding: "12px 18px",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  border: "none",
  background: "#e0f2fe",
  color: "#075985",
  fontWeight: 800,
  borderRadius: "999px",
  padding: "12px 16px",
  cursor: "pointer",
};

const deleteButtonStyle = {
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  fontWeight: 800,
  borderRadius: "999px",
  padding: "12px 16px",
  cursor: "pointer",
};