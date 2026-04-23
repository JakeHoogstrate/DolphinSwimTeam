import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import LoginPage from "./pages/LoginPage";
import ParentDashboardPage from "./pages/ParentDashboardPage";
import SwimmerDetailPage from "./pages/SwimmerDetailPage";
import AddSwimmerPage from "./pages/AddSwimmerPage";
import CoachDashboardPage from "./pages/CoachDashboardPage";
import AddEventPage from "./pages/AddEventPage";
import CoachEditTimesPage from "./pages/CoachEditTimesPage";
import MessagesPage from "./pages/MessagesPage";
import SwimmersPage from "./pages/SwimmersPage";
import {
  fetchEvents,
  fetchSwimmers,
  fetchParents,
  fetchHomepageSlides,
  createEvent,
  createSwimmer,
  createHomepageSlide,
  deleteHomepageSlide,
  deleteSwimmer,
  deleteEvent,
  updateSwimmerPrivacy,
  addTimeToSwimmer,
  sendMessage,
  fetchUnreadCount,
  fetchMessageTemplates,
  saveMessageTemplates,
} from "./services/firestoreService";
import {
  subscribeToAuth,
  getUserProfile,
  logoutUser,
} from "./services/authService";
import { getBestTime, getQualificationLevel } from "./utils/swimUtils";

const LEVEL_ORDER = ["Slower than B", "B", "BB", "A", "AA", "AAA", "AAAA"];

const DEFAULT_TEMPLATES = {
  eventAnnouncement: `Hi {{parentName}},\n\nWanted to let you know about an upcoming event:\n\n{{title}}\n{{date}} - {{location}}\n\n{{description}}\n\nCheck the Events page for more details.\n\n- {{coachName}}`,
  levelUp: `Hi {{parentName}},\n\n{{swimmerName}} just hit the {{level}} standard in {{event}} with a time of {{time}}. Great work!\n\n- {{coachName}}`,
};

function fillTemplate(template, vars) {
  let result = template;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, val ?? "");
  }
  return result;
}

export default function App() {
  const [events, setEvents] = useState([]);
  const [swimmers, setSwimmers] = useState([]);
  const [parents, setParents] = useState([]);
  const [homepageSlides, setHomepageSlides] = useState([]);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      try {
        if (user) {
          const profile = await getUserProfile(user.uid);
          setCurrentUserProfile(profile);
        } else {
          setCurrentUserProfile(null);
        }
      } catch (error) {
        console.error(error);
        setCurrentUserProfile(null);
      } finally {
        setAuthReady(true);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchMessageTemplates()
      .then((saved) => { if (saved) setTemplates(saved); })
      .catch(() => {});
  }, []);

  async function refreshUnreadCount(userId) {
    const count = await fetchUnreadCount(userId).catch(() => 0);
    setUnreadCount(count);
  }

  useEffect(() => {
    if (currentUserProfile?.id) refreshUnreadCount(currentUserProfile.id);
    else setUnreadCount(0);
  }, [currentUserProfile?.id]);

  useEffect(() => {
    if (!authReady) return;

    async function load() {
      try {
        setLoading(true);

        const [eventsData, swimmersData, slidesData] = await Promise.all([
          fetchEvents(),
          fetchSwimmers(),
          fetchHomepageSlides(),
        ]);

        setEvents(eventsData);
        setSwimmers(swimmersData);
        setHomepageSlides(slidesData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [authReady, currentUserProfile?.id]);

  useEffect(() => {
    if (!authReady) return;

    async function load() {
      if (currentUserProfile?.role === "coach") {
        try {
          const parentsData = await fetchParents();
          setParents(parentsData);
        } catch (error) {
          console.error(error);
          setParents([]);
        }
      } else {
        setParents([]);
      }
    }

    load();
  }, [authReady, currentUserProfile]);

  async function addSwimmer(newSwimmer) {
    const swimmerToAdd = {
      ...newSwimmer,
      isPublic: true,
      profilePhoto:
        newSwimmer.profilePhoto || "https://via.placeholder.com/72?text=Swim",
      times: [],
    };

    const created = await createSwimmer(swimmerToAdd);
    setSwimmers((prev) => [...prev, created]);
  }

  async function addEvent(newEvent) {
    try {
      const created = await createEvent(newEvent);
      setEvents((prev) => [...prev, created]);

      for (const parent of parents) {
        const body = fillTemplate(templates.eventAnnouncement, {
          parentName: parent.name || "Parent",
          title: newEvent.title || "",
          date: newEvent.date || "",
          location: newEvent.location || "",
          description: newEvent.description || "",
          coachName: currentUserProfile?.name || "Coach",
        });
        await sendMessage({
          fromId: "system",
          fromName: currentUserProfile?.name || "Dolphin Swim Team",
          toId: parent.id,
          body,
          type: "notification",
        });
      }
    } catch (error) {
      console.error("addEvent failed:", error);
    }
  }

  async function addHomepageSlide(slideInput) {
    const created = await createHomepageSlide({
      ...slideInput,
      createdBy: currentUserProfile?.name || "Coach",
    });
    setHomepageSlides((prev) => [created, ...prev]);
  }

  async function removeHomepageSlide(slideId, storagePath) {
    await deleteHomepageSlide(slideId, storagePath);
    setHomepageSlides((prev) => prev.filter((slide) => slide.id !== slideId));
  }

  async function removeSwimmer(swimmerId) {
    try {
      await deleteSwimmer(swimmerId);
      setSwimmers((prev) => prev.filter((s) => s.id !== swimmerId));
    } catch (error) {
      console.error(error);
    }
  }

  async function removeEvent(eventId) {
    await deleteEvent(eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }

  async function toggleSwimmerPrivacy(swimmerId) {
    const swimmer = swimmers.find((s) => s.id === swimmerId);
    if (!swimmer) return;

    const newValue = !swimmer.isPublic;
    try {
      await updateSwimmerPrivacy(swimmerId, newValue);
      setSwimmers((prev) =>
        prev.map((s) => (s.id === swimmerId ? { ...s, isPublic: newValue } : s))
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function addSwimTime(swimmerId, newTime) {
    try {
      const swimmer = swimmers.find((s) => s.id === swimmerId);
      if (!swimmer) return;

      const oldEventTimes = (swimmer.times || []).filter(
        (t) => t.event === newTime.event
      );
      const oldBest = getBestTime(oldEventTimes);
      const oldLevel = oldBest
        ? getQualificationLevel(swimmer.ageGroup, swimmer.gender, newTime.event, oldBest.time)
        : "Slower than B";

      await addTimeToSwimmer(swimmerId, newTime);

      const newEventTimes = [...oldEventTimes, newTime];
      const newBest  = getBestTime(newEventTimes);
      const newLevel = getQualificationLevel(
        swimmer.ageGroup,
        swimmer.gender,
        newTime.event,
        newBest.time
      );

      if (
        swimmer.parentId &&
        LEVEL_ORDER.indexOf(newLevel) > LEVEL_ORDER.indexOf(oldLevel)
      ) {
        const parent = parents.find((p) => p.id === swimmer.parentId);
        const body = fillTemplate(templates.levelUp, {
          parentName: parent?.name || "Parent",
          swimmerName: swimmer.name,
          level: newLevel,
          event: newTime.event,
          time: newTime.time,
          coachName: currentUserProfile?.name || "Coach",
        });
        await sendMessage({
          fromId: "system",
          fromName: currentUserProfile?.name || "Dolphin Swim Team",
          toId: swimmer.parentId,
          body,
          type: "notification",
        });
      }

      setSwimmers((prev) =>
        prev.map((s) =>
          s.id === swimmerId
            ? { ...s, times: [...(s.times || []), newTime] }
            : s
        )
      );
    } catch (error) {
      console.error("addSwimTime failed:", error);
    }
  }

  async function handleLogout() {
    await logoutUser();
    setCurrentUserProfile(null);
    setParents([]);
  }

  if (!authReady || loading) {
    return (
      <div
        style={{
          padding: "30px",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background:
          "linear-gradient(180deg, #f5fbff 0%, #eef7fb 40%, #ffffff 100%)",
        minHeight: "100vh",
      }}
    >
      <Navbar currentUserProfile={currentUserProfile} onLogout={handleLogout} unreadCount={unreadCount} />

      <main style={{ maxWidth: "1180px", margin: "0 auto", padding: "24px" }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                events={events}
                homepageSlides={homepageSlides}
              />
            }
          />
          <Route path="/events" element={<EventsPage events={events} />} />
          <Route
            path="/swimmers"
            element={<SwimmersPage swimmers={swimmers} currentUserProfile={currentUserProfile} />}
          />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ParentDashboardPage
                swimmers={swimmers}
                currentUserProfile={currentUserProfile}
                toggleSwimmerPrivacy={toggleSwimmerPrivacy}
              />
            }
          />

          <Route
            path="/swimmer/:swimmerId"
            element={
              <SwimmerDetailPage
                swimmers={swimmers}
                currentUserProfile={currentUserProfile}
              />
            }
          />

          <Route
            path="/add-swimmer"
            element={<AddSwimmerPage addSwimmer={addSwimmer} parents={parents} />}
          />

          <Route
            path="/coach-dashboard"
            element={
              <CoachDashboardPage
                events={events}
                swimmers={swimmers}
                parents={parents}
                homepageSlides={homepageSlides}
                currentUserProfile={currentUserProfile}
                addHomepageSlide={addHomepageSlide}
                removeHomepageSlide={removeHomepageSlide}
                removeSwimmer={removeSwimmer}
                removeEvent={removeEvent}
                templates={templates}
                onSaveTemplates={async (t) => { await saveMessageTemplates(t); setTemplates(t); }}
              />
            }
          />

          <Route
            path="/add-event"
            element={<AddEventPage addEvent={addEvent} />}
          />

          <Route
            path="/coach-edit-times/:swimmerId"
            element={
              <CoachEditTimesPage
                swimmers={swimmers}
                addSwimTime={addSwimTime}
              />
            }
          />

          <Route
            path="/messages"
            element={
              <MessagesPage
                currentUserProfile={currentUserProfile}
                parents={parents}
                onMessagesRead={() => refreshUnreadCount(currentUserProfile?.id)}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
