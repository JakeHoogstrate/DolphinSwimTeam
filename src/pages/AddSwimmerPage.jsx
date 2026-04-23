import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAgeGroupFromDob } from "../utils/ageGroupUtils";
export default function AddSwimmerPage({ addSwimmer, parents }) {
  const navigate = useNavigate();

  const individualEvents = [
    "50 Freestyle",
    "100 Freestyle",
    "200 Freestyle",
    "500 Freestyle",
    "1000 Freestyle",
    "1650 Freestyle",
    "50 Backstroke",
    "100 Backstroke",
    "200 Backstroke",
    "50 Breaststroke",
    "100 Breaststroke",
    "200 Breaststroke",
    "50 Butterfly",
    "100 Butterfly",
    "200 Butterfly",
    "100 Individual Medley",
    "200 Individual Medley",
    "400 Individual Medley",
  ];

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    gender: "",
    events: [],
    parentId: "",
  });

  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleEventChange(e) {
    const { value, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      events: checked
        ? [...prev.events, value]
        : prev.events.filter((event) => event !== value),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.dob) newErrors.dob = "Date of birth is required.";
    if (!formData.gender) newErrors.gender = "Gender is required.";
    if (!formData.parentId) newErrors.parentId = "Assigned parent is required.";
    if (formData.events.length === 0) newErrors.events = "Select at least one event.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setSaving(true);
      await addSwimmer({
        ...formData,
        ageGroup: getAgeGroupFromDob(formData.dob),
        profilePhoto: photoUrl.trim(),
      });
      setFormData({ name: "", dob: "", gender: "", events: [], parentId: "" });
      setPhotoUrl("");
      setErrors({});
      navigate("/coach-dashboard");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ marginTop: "30px", maxWidth: "700px" }}>
      <h2>Add Swimmer</h2>

      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Swimmer Name"
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
          {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          />
          {errors.dob && <p style={{ color: "red" }}>{errors.dob}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          >
            <option value="">Select Gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
          </select>
          {errors.gender && <p style={{ color: "red" }}>{errors.gender}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Assigned Parent</label>
          <select
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "5px",
            }}
          >
            <option value="">Select Parent Account</option>
            {parents.map((parent) => (
              <option key={parent.id} value={parent.id}>
                {parent.name} ({parent.email})
              </option>
            ))}
          </select>
          {errors.parentId && <p style={{ color: "red" }}>{errors.parentId}</p>}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Profile Photo URL (optional)</label>
          <input
            type="url"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            style={{ display: "block", width: "100%", padding: "10px", marginTop: "5px" }}
          />
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Preview"
              onError={(e) => { e.target.style.display = "none"; }}
              style={{
                marginTop: "10px",
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "50%",
                border: "2px solid #e2e8f0",
              }}
            />
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Events</label>
          <div
            style={{
              marginTop: "10px",
              border: errors.events ? "1px solid red" : "1px solid #ccc",
              borderRadius: "8px",
              padding: "12px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 16px",
            }}
          >
            {individualEvents.map((event) => (
              <label
                key={event}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <input
                  type="checkbox"
                  value={event}
                  checked={formData.events.includes(event)}
                  onChange={handleEventChange}
                />
                <span>{event}</span>
              </label>
            ))}
          </div>
          {errors.events && <p style={{ color: "red" }}>{errors.events}</p>}
        </div>

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "10px 15px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#0ea5e9",
            color: "white",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving…" : "Save Swimmer"}
        </button>
      </form>
    </section>
  );
}