import { Link } from "react-router-dom";
import {
  groupTimesByEvent,
  getBestTime,
  getQualificationLevel,
  projectTime,
  formatSecondsToSwimTime,
} from "../utils/swimUtils";

const LEVEL_ORDER = ["Slower than B", "B", "BB", "A", "AA", "AAA", "AAAA"];

const LEVEL_COLORS = {
  AAAA: { bg: "#fef3c7", text: "#92400e" },
  AAA: { bg: "#f3e8ff", text: "#6b21a8" },
  AA: { bg: "#dbeafe", text: "#1e40af" },
  A: { bg: "#dcfce7", text: "#166534" },
  BB: { bg: "#ccfbf1", text: "#115e59" },
  B: { bg: "#f1f5f9", text: "#475569" },
  "Slower than B": { bg: "#f8fafc", text: "#94a3b8" },
};

function getBestLevel(swimmer) {
  const grouped = groupTimesByEvent(swimmer.times || []);
  let best = "Slower than B";

  for (const eventName of swimmer.events || []) {
    const entries = grouped[eventName] || [];
    const bestTime = getBestTime(entries);
    if (!bestTime) continue;

    const level = getQualificationLevel(swimmer.ageGroup, swimmer.gender, eventName, bestTime.time);
    if (LEVEL_ORDER.indexOf(level) > LEVEL_ORDER.indexOf(best)) best = level;
  }

  return best;
}

function getProjectedLevel(swimmer) {
  const grouped = groupTimesByEvent(swimmer.times || []);
  let best = null;

  for (const eventName of swimmer.events || []) {
    const entries = grouped[eventName] || [];
    const projected = projectTime(entries);
    if (!projected) continue;

    const level = getQualificationLevel(
      swimmer.ageGroup, swimmer.gender, eventName,
      formatSecondsToSwimTime(projected)
    );
    if (!LEVEL_ORDER.includes(level)) continue;
    if (!best || LEVEL_ORDER.indexOf(level) > LEVEL_ORDER.indexOf(best)) best = level;
  }

  return best;
}

export default function SwimmersPage({ swimmers, currentUserProfile }) {
  const isCoach = currentUserProfile?.role === "coach";

  const visible = isCoach
    ? swimmers
    : swimmers.filter((s) => s.isPublic);

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
          Roster
        </div>
        <h2 style={{ margin: "10px 0 0", fontSize: "34px", letterSpacing: "-0.03em" }}>
          Swimmers
        </h2>
        <p style={{ marginTop: "10px", opacity: 0.85, lineHeight: 1.6 }}>
          {visible.length === 0
            ? "No swimmer profiles yet."
            : `${visible.length} swimmer${visible.length !== 1 ? "s" : ""}${isCoach ? "" : " with public profiles"}.`}
        </p>
      </div>

      {visible.length === 0 ? (
        <p style={{ color: "#64748b" }}>No swimmer profiles to show yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "18px",
          }}
        >
          {visible.map((swimmer) => {
            const currentLevel = getBestLevel(swimmer);
            const projectedLevel = getProjectedLevel(swimmer);
            const levelUp = projectedLevel && LEVEL_ORDER.indexOf(projectedLevel) > LEVEL_ORDER.indexOf(currentLevel);
            const levelStyle = LEVEL_COLORS[currentLevel] ?? LEVEL_COLORS["Slower than B"];

            return (
              <Link
                key={swimmer.id}
                to={`/swimmer/${swimmer.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "20px",
                    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
                    border: "1px solid #e2e8f0",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <img
                    src={swimmer.profilePhoto || "https://via.placeholder.com/100?text=Swim"}
                    alt={swimmer.name}
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                      marginBottom: "14px",
                    }}
                  />
                  <div style={{ fontWeight: 800, fontSize: "17px", color: "#0f172a" }}>
                    {swimmer.name}
                  </div>
                  <div style={{ color: "#475569", marginTop: "4px", fontSize: "14px" }}>
                    {swimmer.ageGroup} · {swimmer.gender}
                  </div>

                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: levelStyle.bg,
                        color: levelStyle.text,
                      }}
                    >
                      {currentLevel}
                    </span>
                    {levelUp && (
                      <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                        → {projectedLevel}
                      </span>
                    )}
                  </div>

                  {isCoach && !swimmer.isPublic && (
                    <div style={{ marginTop: "6px", fontSize: "12px", color: "#94a3b8" }}>
                      Private
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
