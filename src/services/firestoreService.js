import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  doc,
  arrayUnion,
  query,
  where,
  deleteDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

export async function fetchEvents() {
  const snapshot = await getDocs(collection(db, "events"));
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function fetchSwimmers() {
  const snapshot = await getDocs(collection(db, "swimmers"));
  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function fetchParents() {
  const parentsQuery = query(
    collection(db, "users"),
    where("role", "==", "parent")
  );

  const snapshot = await getDocs(parentsQuery);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function createEvent(eventData) {
  const docRef = await addDoc(collection(db, "events"), eventData);
  return { id: docRef.id, ...eventData };
}

export async function createSwimmer(swimmerData) {
  const docRef = await addDoc(collection(db, "swimmers"), {
    ...swimmerData,
    times: swimmerData.times || [],
    isPublic: swimmerData.isPublic ?? true,
  });

  return {
    id: docRef.id,
    ...swimmerData,
    times: swimmerData.times || [],
    isPublic: swimmerData.isPublic ?? true,
  };
}

export async function updateSwimmerPrivacy(swimmerId, isPublic) {
  const swimmerRef = doc(db, "swimmers", swimmerId);
  await updateDoc(swimmerRef, { isPublic });
}

export async function addTimeToSwimmer(swimmerId, timeEntry) {
  const swimmerRef = doc(db, "swimmers", swimmerId);
  await updateDoc(swimmerRef, {
    times: arrayUnion(timeEntry),
  });
}

export async function fetchHomepageSlides() {
  const slidesQuery = query(
    collection(db, "homepageSlides"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(slidesQuery);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}

export async function createHomepageSlide({ imageUrl, title, subtitle, createdBy }) {
  const slideData = {
    title: title || "Dolphin Swim Team",
    subtitle: subtitle || "",
    imageUrl,
    createdBy,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, "homepageSlides"), slideData);

  return {
    id: docRef.id,
    ...slideData,
  };
}

export async function fetchUnreadCount(userId) {
  const q = query(collection(db, "messages"), where("toId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.filter((d) => !d.data().read).length;
}

export async function fetchUnreadByThread(userId) {
  const q = query(collection(db, "messages"), where("toId", "==", userId));
  const snapshot = await getDocs(q);
  const counts = {};
  snapshot.docs.forEach((d) => {
    const { threadId, read } = d.data();
    if (!read) counts[threadId] = (counts[threadId] || 0) + 1;
  });
  return counts;
}

export async function fetchMessageTemplates() {
  const snap = await getDoc(doc(db, "settings", "messageTemplates"));
  return snap.exists() ? snap.data() : null;
}

export async function saveMessageTemplates(templates) {
  await setDoc(doc(db, "settings", "messageTemplates"), templates);
}

export async function fetchCoach() {
  const q = query(collection(db, "users"), where("role", "==", "coach"), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}

export function getThreadId(uid1, uid2) {
  const ids = [uid1, uid2].sort();
  return ids[0] + "_" + ids[1];
}

export async function sendMessage({ fromId, fromName, toId, body, type = "direct" }) {
  let threadId;
  if (type === "notification") {
    threadId = `system_${toId}`;
  } else {
    threadId = getThreadId(fromId, toId);
  }

  const messageData = {
    fromId,
    fromName,
    toId,
    body,
    type,
    threadId,
    createdAt: Date.now(),
    read: false,
  };

  const docRef = await addDoc(collection(db, "messages"), messageData);
  return { id: docRef.id, ...messageData };
}

export async function fetchThreadMessages(threadId, userId) {
  const toQ = query(
    collection(db, "messages"),
    where("threadId", "==", threadId),
    where("toId", "==", userId),
    orderBy("createdAt", "asc")
  );
  const fromQ = query(
    collection(db, "messages"),
    where("threadId", "==", threadId),
    where("fromId", "==", userId),
    orderBy("createdAt", "asc")
  );

  const [toSnap, fromSnap] = await Promise.all([getDocs(toQ), getDocs(fromQ)]);

  const received = toSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const sent = fromSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const all = [...received, ...sent];

  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function markThreadRead(threadId, userId) {
  const q = query(
    collection(db, "messages"),
    where("threadId", "==", threadId),
    where("toId", "==", userId)
  );
  const snapshot = await getDocs(q);
  const unread = snapshot.docs.filter((d) => d.data().read === false);
  await Promise.all(unread.map((d) => updateDoc(d.ref, { read: true })));
}


export async function deleteHomepageSlide(slideId) {
  await deleteDoc(doc(db, "homepageSlides", slideId));
}

export async function deleteSwimmer(swimmerId) {
  await deleteDoc(doc(db, "swimmers", swimmerId));
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, "events", eventId));
}