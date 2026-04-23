/**
 * Seed test swimmers with times into Firestore.
 * Usage: node scripts/seedTestData.mjs <coach-email> <coach-password>
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually
const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf8");
const env = Object.fromEntries(
  envFile.split("\n")
    .filter(l => l.includes("="))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const app = initializeApp({
  apiKey:            env.VITE_FIREBASE_API_KEY,
  authDomain:        env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.VITE_FIREBASE_APP_ID,
});

const auth = getAuth(app);
const db   = getFirestore(app);

const [,, email, password] = process.argv;
if (!email || !password) {
  console.error("Usage: node scripts/seedTestData.mjs <coach-email> <coach-password>");
  process.exit(1);
}

const swimmers = [
  {
    name: "Emma Johnson",
    dob: "2013-04-12",
    ageGroup: "11-12",
    gender: "Female",
    parentId: "",
    isPublic: true,
    profilePhoto: "",
    events: ["50 Freestyle", "100 Freestyle", "100 Backstroke", "200 Freestyle"],
    times: [
      { event: "50 Freestyle",   time: "38.40", date: "2024-09-10" },
      { event: "50 Freestyle",   time: "36.92", date: "2024-11-05" },
      { event: "50 Freestyle",   time: "35.10", date: "2025-01-18" },
      { event: "50 Freestyle",   time: "33.84", date: "2025-03-22" },
      { event: "100 Freestyle",  time: "1:24.30", date: "2024-09-10" },
      { event: "100 Freestyle",  time: "1:20.88", date: "2024-11-05" },
      { event: "100 Freestyle",  time: "1:17.45", date: "2025-01-18" },
      { event: "100 Freestyle",  time: "1:14.92", date: "2025-03-22" },
      { event: "100 Backstroke", time: "1:38.20", date: "2024-10-14" },
      { event: "100 Backstroke", time: "1:33.55", date: "2025-02-08" },
      { event: "200 Freestyle",  time: "3:02.40", date: "2024-11-05" },
      { event: "200 Freestyle",  time: "2:55.18", date: "2025-03-22" },
    ],
  },
  {
    name: "Marcus Williams",
    dob: "2010-08-27",
    ageGroup: "13-14",
    gender: "Male",
    parentId: "",
    isPublic: true,
    profilePhoto: "",
    events: ["100 Butterfly", "200 Freestyle", "50 Backstroke", "200 Individual Medley"],
    times: [
      { event: "100 Butterfly",         time: "1:14.80", date: "2024-08-15" },
      { event: "100 Butterfly",         time: "1:10.22", date: "2024-10-20" },
      { event: "100 Butterfly",         time: "1:07.45", date: "2025-01-10" },
      { event: "100 Butterfly",         time: "1:04.88", date: "2025-03-28" },
      { event: "200 Freestyle",         time: "2:16.30", date: "2024-08-15" },
      { event: "200 Freestyle",         time: "2:12.44", date: "2024-10-20" },
      { event: "200 Freestyle",         time: "2:08.90", date: "2025-03-28" },
      { event: "50 Backstroke",         time: "34.20",   date: "2024-09-05" },
      { event: "50 Backstroke",         time: "32.88",   date: "2025-02-14" },
      { event: "200 Individual Medley", time: "2:48.50", date: "2024-10-20" },
      { event: "200 Individual Medley", time: "2:42.30", date: "2025-01-10" },
      { event: "200 Individual Medley", time: "2:37.05", date: "2025-03-28" },
    ],
  },
  {
    name: "Sophie Chen",
    dob: "2016-02-03",
    ageGroup: "10 & under",
    gender: "Female",
    parentId: "",
    isPublic: true,
    profilePhoto: "",
    events: ["50 Freestyle", "50 Backstroke", "50 Breaststroke"],
    times: [
      { event: "50 Freestyle",    time: "44.80", date: "2024-09-22" },
      { event: "50 Freestyle",    time: "41.55", date: "2024-12-01" },
      { event: "50 Freestyle",    time: "38.90", date: "2025-02-20" },
      { event: "50 Backstroke",   time: "52.10", date: "2024-09-22" },
      { event: "50 Backstroke",   time: "48.34", date: "2024-12-01" },
      { event: "50 Backstroke",   time: "45.22", date: "2025-02-20" },
      { event: "50 Breaststroke", time: "55.40", date: "2024-12-01" },
      { event: "50 Breaststroke", time: "51.88", date: "2025-02-20" },
    ],
  },
];

async function seed() {
  console.log("Signing in…");
  await signInWithEmailAndPassword(auth, email, password);
  console.log("Signed in. Adding swimmers…");

  for (const swimmer of swimmers) {
    const ref = await addDoc(collection(db, "swimmers"), swimmer);
    console.log(`  Added: ${swimmer.name} (${ref.id})`);
  }

  console.log("Done!");
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
