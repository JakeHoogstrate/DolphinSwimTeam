import { Link } from "react-router-dom";

export default function SwimmerListItem({ swimmer, showVisibility = false }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        borderRadius: "12px",
        padding: "14px",
        marginBottom: "14px",
        display: "flex",
        alignItems: "center",
        gap: "15px",
      }}
    >
      <img
        src={swimmer.profilePhoto || "https://via.placeholder.com/72?text=Swim"}
        alt={swimmer.name}
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #ddd",
        }}
      />

      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0 }}>
          <Link to={`/swimmer/${swimmer.id}`}>{swimmer.name}</Link>
        </h3>
        <p style={{ margin: "6px 0" }}><strong>Age Group:</strong> {swimmer.ageGroup}</p>
        <p style={{ margin: "6px 0" }}>
          <strong>Events:</strong>{" "}
          {swimmer.events && swimmer.events.length > 0
            ? swimmer.events.join(", ")
            : "No events selected"}
        </p>
        {showVisibility && (
          <p style={{ margin: "6px 0" }}>
            <strong>Visibility:</strong> {swimmer.isPublic ? "Public" : "Private"}
          </p>
        )}
      </div>
    </div>
  );
}