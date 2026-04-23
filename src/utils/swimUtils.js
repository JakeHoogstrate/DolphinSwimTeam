import { standards } from "./swimStandards";

export function parseSwimTimeToSeconds(timeString) {
  if (!timeString) return null;

  const value = timeString.trim();

  if (value.includes(":")) {
    const [minutes, seconds] = value.split(":");
    return Number(minutes) * 60 + Number(seconds);
  }

  return Number(value);
}

export function formatSecondsToSwimTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || Number.isNaN(totalSeconds)) {
    return "N/A";
  }

  if (totalSeconds >= 60) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2).padStart(5, "0");
    return `${minutes}:${seconds}`;
  }

  return totalSeconds.toFixed(2);
}

export function groupTimesByEvent(times) {
  const grouped = {};

  times.forEach((entry) => {
    if (!grouped[entry.event]) {
      grouped[entry.event] = [];
    }
    grouped[entry.event].push(entry);
  });

  Object.keys(grouped).forEach((eventName) => {
    grouped[eventName].sort((a, b) => new Date(a.date) - new Date(b.date));
  });

  return grouped;
}

export function getBestTime(entries) {
  if (!entries || entries.length === 0) return null;

  return entries.reduce((best, current) => {
    const bestSeconds = parseSwimTimeToSeconds(best.time);
    const currentSeconds = parseSwimTimeToSeconds(current.time);

    return currentSeconds < bestSeconds ? current : best;
  });
}

export function projectTime(sortedEntries) {
  if (sortedEntries.length < 2) return null;

  const origin = new Date(sortedEntries[0].date).getTime();
  const points = sortedEntries.map((e) => ({
    x: (new Date(e.date).getTime() - origin) / 86400000,
    y: parseSwimTimeToSeconds(e.time),
  }));

  const n = points.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of points) {
    sumX += p.x; sumY += p.y;
    sumXY += p.x * p.y; sumX2 += p.x * p.x;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  const projected = slope * (points[n - 1].x + 90) + intercept;

  return projected > 0 ? projected : null;
}

export function getQualificationLevel(ageGroup, gender, eventName, timeString) {
  const ageGroupStandards = standards[ageGroup];
  if (!ageGroupStandards) return "No standards loaded";

  const genderStandards = ageGroupStandards[gender];
  if (!genderStandards) return "No standards loaded";

  const eventStandards = genderStandards[eventName];
  if (!eventStandards) return "No standard for this event";

  const swimmerSeconds = parseSwimTimeToSeconds(timeString);

  const orderedLevels = ["AAAA", "AAA", "AA", "A", "BB", "B"];

  for (const level of orderedLevels) {
    const standardSeconds = parseSwimTimeToSeconds(eventStandards[level]);
    if (swimmerSeconds <= standardSeconds) {
      return level;
    }
  }

  return "Slower than B";
}