import { useParams } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import {
  parseSwimTimeToSeconds,
  formatSecondsToSwimTime,
  groupTimesByEvent,
  getBestTime,
  getQualificationLevel,
  projectTime,
} from "../utils/swimUtils";
import { standards } from "../utils/swimStandards";

const LEVEL_ORDER = ["Slower than B", "B", "BB", "A", "AA", "AAA", "AAAA"];

const LEVEL_COLORS = {
  AAAA: { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" },
  AAA: { bg: "#f3e8ff", text: "#6b21a8", border: "#a855f7" },
  AA: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  A: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
  BB: { bg: "#ccfbf1", text: "#115e59", border: "#14b8a6" },
  B: { bg: "#f1f5f9", text: "#475569", border: "#94a3b8" },
  "Slower than B": { bg: "#f8fafc", text: "#94a3b8", border: "#e2e8f0" },
};

function getNextLevel(currentLevel) {
  const idx = LEVEL_ORDER.indexOf(currentLevel);
  if (idx < 0 || idx === LEVEL_ORDER.length - 1) return null;
  return LEVEL_ORDER[idx + 1];
}

function getStandardTime(ageGroup, gender, event, level) {
  return standards[ageGroup]?.[gender]?.[event]?.[level] ?? null;
}


export default function SwimmerDetailPage({ swimmers, currentUserProfile }) {
  const { swimmerId } = useParams();

  const swimmer = swimmers.find((s) => String(s.id) === String(swimmerId));

  if (!swimmer) {
    return (
      <section style={{ marginTop: "30px" }}>
        <h2>Swimmer Not Found</h2>
        <p>This swimmer profile does not exist.</p>
      </section>
    );
  }

  const isCoach = currentUserProfile?.role === "coach";
  const isAssignedParent =
    currentUserProfile?.role === "parent" &&
    String(swimmer.parentId) === String(currentUserProfile.id);

  if (!swimmer.isPublic && !isCoach && !isAssignedParent) {
    return (
      <section style={{ marginTop: "30px" }}>
        <h2>Private Swimmer Profile</h2>
        <p>You do not have permission to view this profile.</p>
      </section>
    );
  }

  const groupedTimes = groupTimesByEvent(swimmer.times || []);

  return (
    <section style={{ display: "grid", gap: "20px", marginTop: "8px" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #082f49, #0f766e)",
          color: "white",
          borderRadius: "28px",
          padding: "28px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}
      >
        <img
          src={swimmer.profilePhoto || "https://via.placeholder.com/100?text=Swim"}
          alt={swimmer.name}
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid rgba(255,255,255,0.3)",
            flexShrink: 0,
          }}
        />
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              opacity: 0.7,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Swimmer Profile
          </div>
          <h2
            style={{
              margin: "6px 0 10px",
              fontSize: "32px",
              letterSpacing: "-0.02em",
            }}
          >
            {swimmer.name}
          </h2>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              fontSize: "14px",
              opacity: 0.85,
            }}
          >
            <span>{swimmer.ageGroup}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{swimmer.gender}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>DOB: {swimmer.dob}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{swimmer.isPublic ? "Public" : "Private"}</span>
          </div>
        </div>
      </div>

      {!swimmer.events || swimmer.events.length === 0 ? (
        <p style={{ color: "#64748b" }}>No events listed for this swimmer yet.</p>
      ) : (
        swimmer.events.map((eventName) => {
          const entries = groupedTimes[eventName] || [];
          const best = getBestTime(entries);

          const currentLevel = best
            ? getQualificationLevel(swimmer.ageGroup, swimmer.gender, eventName, best.time)
            : "Slower than B";

          const hasStandard = LEVEL_ORDER.includes(currentLevel);

          const nextLevel = hasStandard ? getNextLevel(currentLevel) : null;
          const nextCutTime = nextLevel
            ? getStandardTime(swimmer.ageGroup, swimmer.gender, eventName, nextLevel)
            : null;

          const secondsToNext =
            best && nextCutTime
              ? (
                  parseSwimTimeToSeconds(best.time) -
                  parseSwimTimeToSeconds(nextCutTime)
                ).toFixed(2)
              : null;

          const projected = projectTime(entries);
          const projectedLevel = projected && hasStandard
            ? getQualificationLevel(
                swimmer.ageGroup,
                swimmer.gender,
                eventName,
                formatSecondsToSwimTime(projected)
              )
            : null;

          const levelStyle =
            LEVEL_COLORS[currentLevel] ?? LEVEL_COLORS["Slower than B"];

          return (
            <div
              key={eventName}
              style={{
                background: "white",
                borderRadius: "24px",
                padding: "24px",
                boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {eventName}
                </h3>
                {hasStandard ? (
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 800,
                      background: levelStyle.bg,
                      color: levelStyle.text,
                      border: `1px solid ${levelStyle.border}`,
                    }}
                  >
                    {currentLevel}
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 700,
                      background: "#f8fafc",
                      color: "#94a3b8",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    No USA standard
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  marginTop: "18px",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Best Time
                  </div>
                  <div
                    style={{
                      fontSize: "28px",
                      fontWeight: 900,
                      color: "#0f172a",
                      marginTop: "4px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {best ? best.time : "—"}
                  </div>
                  {best && (
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                      {best.date}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Next Level
                  </div>
                  {!hasStandard ? (
                    <div style={{ fontSize: "14px", color: "#94a3b8", marginTop: "4px" }}>
                      Not a standard USA Swimming event for this age group
                    </div>
                  ) : nextLevel ? (
                    <>
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: 800,
                          color: "#0f172a",
                          marginTop: "4px",
                        }}
                      >
                        {nextLevel} — {nextCutTime}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#0ea5e9",
                          marginTop: "4px",
                          fontWeight: 600,
                        }}
                      >
                        Drop {secondsToNext}s to qualify
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 800,
                        color: "#22c55e",
                        marginTop: "4px",
                      }}
                    >
                      Top level reached!
                    </div>
                  )}
                </div>
              </div>

              {projected && (
                <div
                  style={{
                    marginTop: "14px",
                    background: "#f0fdf4",
                    borderRadius: "14px",
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <TrendingUp size={18} color="#166534" style={{ flexShrink: 0 }} />
                  <div>
                    <div
                      style={{ fontSize: "13px", fontWeight: 700, color: "#166534" }}
                    >
                      90-day projection: {formatSecondsToSwimTime(projected)}
                      {projectedLevel && projectedLevel !== currentLevel && (
                        <span style={{ marginLeft: "8px", color: "#15803d" }}>
                          ({projectedLevel} pace)
                        </span>
                      )}
                    </div>
                    <div
                      style={{ fontSize: "12px", color: "#4ade80", marginTop: "2px" }}
                    >
                      Linear trend across {entries.length} recorded times
                    </div>
                  </div>
                </div>
              )}

              {entries.length > 0 ? (
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "10px",
                    }}
                  >
                    Time History
                  </div>
                  <div style={{ display: "grid", gap: "7px" }}>
                    {[...entries].reverse().map((entry, i, arr) => {
                      const prev = arr[i + 1];
                      const delta = prev
                        ? parseSwimTimeToSeconds(prev.time) -
                          parseSwimTimeToSeconds(entry.time)
                        : null;
                      const isBest = best && entry.time === best.time && entry.date === best.date;
                      return (
                        <div
                          key={`${entry.date}-${i}`}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            background: isBest ? "#eff6ff" : "#f8fafc",
                            border: isBest
                              ? "1px solid #bfdbfe"
                              : "1px solid transparent",
                          }}
                        >
                          <span style={{ fontSize: "13px", color: "#475569" }}>
                            {entry.date}
                          </span>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                            }}
                          >
                            {delta !== null && (
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color:
                                    delta > 0
                                      ? "#16a34a"
                                      : delta < 0
                                      ? "#dc2626"
                                      : "#94a3b8",
                                }}
                              >
                                {delta > 0
                                  ? `▲ ${delta.toFixed(2)}s`
                                  : delta < 0
                                  ? `▼ ${Math.abs(delta).toFixed(2)}s`
                                  : "—"}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: "15px",
                                fontWeight: isBest ? 800 : 600,
                                color: isBest ? "#1d4ed8" : "#0f172a",
                              }}
                            >
                              {entry.time}
                              {isBest && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    color: "#3b82f6",
                                    marginLeft: "6px",
                                    fontWeight: 700,
                                  }}
                                >
                                  BEST
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p style={{ color: "#94a3b8", marginTop: "14px", fontSize: "14px" }}>
                  No times recorded yet.
                </p>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}
