import { useState, useEffect, useRef } from "react";
import { MessageCircle, Bell, Send, Megaphone } from "lucide-react";
import {
  fetchThreadMessages,
  sendMessage,
  markThreadRead,
  fetchCoach,
  getThreadId,
  fetchUnreadByThread,
} from "../services/firestoreService";

export default function MessagesPage({ currentUserProfile, parents, onMessagesRead }) {
  const isCoach = currentUserProfile?.role === "coach";
  const isParent = currentUserProfile?.role === "parent";

  const [coach, setCoach] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [unreadByThread, setUnreadByThread] = useState({});
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastStatus, setBroadcastStatus] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!currentUserProfile) return;
    fetchUnreadByThread(currentUserProfile.id).then(setUnreadByThread).catch(() => {});
  }, [currentUserProfile]);

  useEffect(() => {
    if (!isParent || !currentUserProfile) return;
    fetchCoach().then((c) => {
      setCoach(c);
      if (c) {
        const tid = getThreadId(currentUserProfile.id, c.id);
        setSelectedThread({ id: tid, name: c.name || "Coach", otherId: c.id, type: "direct" });
      }
    });
  }, [isParent, currentUserProfile]);

  useEffect(() => {
    if (!selectedThread || selectedThread.type === "broadcast") return;
    async function load() {
      try {
        setLoadingMsgs(true);
        const msgs = await fetchThreadMessages(selectedThread.id, currentUserProfile.id);
        setMessages(msgs);
        await markThreadRead(selectedThread.id, currentUserProfile.id);
        setUnreadByThread((prev) => ({ ...prev, [selectedThread.id]: 0 }));
        onMessagesRead?.();
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoadingMsgs(false);
      }
    }
    load();
  }, [selectedThread]);

  async function loadMessages(threadId) {
    try {
      setLoadingMsgs(true);
      const msgs = await fetchThreadMessages(threadId, currentUserProfile.id);
      setMessages(msgs);
      await markThreadRead(threadId, currentUserProfile.id);
      setUnreadByThread((prev) => ({ ...prev, [threadId]: 0 }));
      onMessagesRead?.();
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setLoadingMsgs(false);
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread || !currentUserProfile) return;
    try {
      setSending(true);
      await sendMessage({
        fromId: currentUserProfile.id,
        fromName: currentUserProfile.name,
        toId: selectedThread.otherId,
        body: newMessage.trim(),
        type: "direct",
      });
      setNewMessage("");
      await loadMessages(selectedThread.id);
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  }

  async function handleBroadcast(e) {
    e.preventDefault();
    if (!broadcastMessage.trim() || !currentUserProfile) return;
    if (parents.length === 0) { setBroadcastStatus("No parent accounts found."); return; }
    try {
      setSending(true);
      setBroadcastStatus("Sending…");
      await Promise.all(
        parents.map((p) =>
          sendMessage({
            fromId: currentUserProfile.id,
            fromName: currentUserProfile.name || "Coach",
            toId: p.id,
            body: broadcastMessage.trim(),
            type: "notification",
          })
        )
      );
      setBroadcastMessage("");
      setBroadcastStatus(`Sent to ${parents.length} parent${parents.length !== 1 ? "s" : ""}.`);
      setTimeout(() => setBroadcastStatus(""), 3000);
    } catch (err) {
      console.error("Broadcast failed:", err);
      setBroadcastStatus("Something went wrong.");
    } finally {
      setSending(false);
    }
  }

  if (!currentUserProfile) return <p>Loading…</p>;

  const threadList = [];
  if (isCoach) {
    threadList.push({
      id: "broadcast",
      name: "Broadcast to All Parents",
      otherId: null,
      type: "broadcast",
    });
    parents.forEach((p) => {
      threadList.push({
        id: getThreadId(currentUserProfile.id, p.id),
        name: p.name,
        otherId: p.id,
        type: "direct",
      });
    });
  }
  if (isParent) {
    if (coach) {
      threadList.push({
        id: getThreadId(currentUserProfile.id, coach.id),
        name: coach.name || "Coach",
        otherId: coach.id,
        type: "direct",
      });
    }
    threadList.push({
      id: `system_${currentUserProfile.id}`,
      name: "Team Notifications",
      otherId: "system",
      type: "notification",
    });
  }

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: "20px",
        marginTop: "8px",
        height: "calc(100vh - 160px)",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "16px",
          boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div
          style={{
            fontWeight: 800,
            fontSize: "15px",
            color: "#0f172a",
            marginBottom: "8px",
            padding: "4px 6px",
          }}
        >
          {isCoach ? "Parents" : "Messages"}
        </div>

        {threadList.length === 0 && (
          <p style={{ color: "#94a3b8", fontSize: "14px", padding: "4px 6px" }}>
            {isCoach ? "No parent accounts found." : "Loading…"}
          </p>
        )}

        {threadList.map((thread) => (
          <button
            key={thread.id}
            onClick={() => setSelectedThread(thread)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "11px 14px",
              borderRadius: "14px",
              border: "none",
              background: selectedThread?.id === thread.id ? "#eff6ff" : "transparent",
              color: selectedThread?.id === thread.id ? "#1d4ed8" : "#0f172a",
              fontWeight: unreadByThread[thread.id] ? 800 : 600,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {thread.type === "broadcast" ? <Megaphone size={14} /> : thread.type === "notification" ? <Bell size={14} /> : <MessageCircle size={14} />}
            <span style={{ flex: 1 }}>{thread.name}</span>
            {!!unreadByThread[thread.id] && (
              <span style={{
                background: "#ef4444",
                color: "white",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 800,
                minWidth: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 5px",
              }}>
                {unreadByThread[thread.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conversation */}
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {!selectedThread ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#94a3b8",
              fontSize: "15px",
            }}
          >
            Select a conversation
          </div>
        ) : selectedThread.type === "broadcast" ? (
          <>
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e2e8f0",
                fontWeight: 800,
                fontSize: "16px",
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Megaphone size={18} />
              Broadcast to All Parents
            </div>
            <div style={{ flex: 1, padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                This message will appear in every parent's <strong>Team Notifications</strong> inbox.
                {parents.length > 0 && ` ${parents.length} parent${parents.length !== 1 ? "s" : ""} will receive it.`}
              </p>
              <form onSubmit={handleBroadcast} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type your message to all parents…"
                  rows={8}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    resize: "vertical",
                    outline: "none",
                    fontFamily: "inherit",
                    lineHeight: 1.6,
                  }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <button
                    type="submit"
                    disabled={sending || !broadcastMessage.trim()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 20px",
                      borderRadius: "999px",
                      border: "none",
                      background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                      color: "white",
                      fontWeight: 800,
                      fontSize: "14px",
                      cursor: "pointer",
                      opacity: sending || !broadcastMessage.trim() ? 0.5 : 1,
                    }}
                  >
                    <Megaphone size={15} />
                    {sending ? "Sending…" : "Send to All"}
                  </button>
                  {broadcastStatus && (
                    <span style={{ fontSize: "14px", color: "#0369a1", fontWeight: 600 }}>
                      {broadcastStatus}
                    </span>
                  )}
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            {/* Thread header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e2e8f0",
                fontWeight: 800,
                fontSize: "16px",
                color: "#0f172a",
              }}
            >
              {selectedThread.name}
            </div>

            {/* Messages list */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {loadingMsgs && (
                <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
                  Loading…
                </p>
              )}
              {!loadingMsgs && messages.length === 0 && (
                <p style={{ color: "#94a3b8", fontSize: "14px", textAlign: "center" }}>
                  No messages yet.
                </p>
              )}
              {messages.map((msg) => {
                const isOwn    = msg.fromId === currentUserProfile.id;
                const isSystem = msg.fromId === "system";
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      justifyContent: isOwn ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "12px 16px",
                        borderRadius: isOwn
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                        background: isSystem
                          ? "#f0fdf4"
                          : isOwn
                          ? "#0ea5e9"
                          : "#f1f5f9",
                        color: isSystem
                          ? "#166534"
                          : isOwn
                          ? "white"
                          : "#0f172a",
                      }}
                    >
                      {!isOwn && (
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            marginBottom: "4px",
                            opacity: 0.65,
                          }}
                        >
                          {msg.fromName}
                        </div>
                      )}
                      <div style={{ fontSize: "14px", lineHeight: 1.5 }}>
                        {msg.body}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          marginTop: "5px",
                          opacity: 0.55,
                          textAlign: isOwn ? "right" : "left",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input — hidden for notification-only threads */}
            {selectedThread.type !== "notification" && (
              <form
                onSubmit={handleSend}
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message…"
                  style={{
                    flex: 1,
                    padding: "11px 16px",
                    borderRadius: "999px",
                    border: "1px solid #e2e8f0",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  title="Send"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    border: "none",
                    background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                    color: "white",
                    cursor: "pointer",
                    flexShrink: 0,
                    opacity: sending || !newMessage.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </section>
  );
}
