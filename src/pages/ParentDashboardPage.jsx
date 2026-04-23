import { Link } from "react-router-dom";

export default function ParentDashboardPage({
  swimmers,
  currentUserProfile,
  toggleSwimmerPrivacy,
}) {
  if (!currentUserProfile) {
    return (
      <section style={{ marginTop: "30px" }}>
        <h2>Parent Dashboard</h2>
        <p>Loading...</p>
      </section>
    );
  }

  if (currentUserProfile.role !== "parent") {
    return (
      <section style={{ marginTop: "30px" }}>
        <h2>Parent Dashboard</h2>
        <p>You need to be logged in as a parent to view this page.</p>
      </section>
    );
  }

  const linkedSwimmers = swimmers.filter(
    (swimmer) => String(swimmer.parentId) === String(currentUserProfile.id)
  );

  return (
    <section style={{ marginTop: "30px" }}>
      <h2>Parent Dashboard</h2>
      <p>Welcome, {currentUserProfile.name}.</p>

      <div style={{ marginTop: "20px" }}>
        {linkedSwimmers.length === 0 ? (
          <p>No swimmers linked to your account yet.</p>
        ) : (
          linkedSwimmers.map((swimmer) => (
            <div
              key={swimmer.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "18px",
                padding: "18px",
                marginBottom: "16px",
                background: "white",
              }}
            >
              <h3 style={{ marginTop: 0 }}>{swimmer.name}</h3>
              <p>
                <strong>Age Group:</strong> {swimmer.ageGroup}
              </p>
              <p>
                <strong>Gender:</strong> {swimmer.gender}
              </p>
              <p>
                <strong>Visibility:</strong> {swimmer.isPublic ? "Public" : "Private"}
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexWrap: "wrap" }}>
                <Link to={`/swimmer/${swimmer.id}`}>
                  <button
                    style={{
                      padding: "10px 14px",
                      border: "none",
                      borderRadius: "999px",
                      background: "#0ea5e9",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    View Profile
                  </button>
                </Link>

                <button
                  onClick={() => toggleSwimmerPrivacy(swimmer.id)}
                  style={{
                    padding: "10px 14px",
                    border: "none",
                    borderRadius: "999px",
                    background: "#e2e8f0",
                    color: "#0f172a",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Make {swimmer.isPublic ? "Private" : "Public"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
