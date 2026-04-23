import { Link } from "react-router-dom";
import {
  Home,
  Calendar,
  Users,
  MessageSquare,
  LayoutDashboard,
  UserPlus,
  CalendarPlus,
  LogOut,
} from "lucide-react";

export default function Navbar({ currentUserProfile, onLogout, unreadCount = 0 }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(6, 30, 46, 0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "0 24px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "18px",
        }}
      >
        <Link
          to="/"
          style={{
            color: "white",
            textDecoration: "none",
            fontWeight: 800,
            fontSize: "20px",
            letterSpacing: "-0.02em",
            flexShrink: 0,
          }}
        >
          Dolphin Swim Team
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          <NavLink to="/" icon={<Home size={16} />} label="Home" />
          <NavLink to="/swimmers" icon={<Users size={16} />} label="Swimmers" />
          <NavLink to="/events" icon={<Calendar size={16} />} label="Events" />

          {!currentUserProfile && (
            <NavLink to="/login" label="Sign In" />
          )}

          {currentUserProfile?.role === "parent" && (
            <NavLink to="/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
          )}

          {currentUserProfile?.role === "coach" && (
            <>
              <NavLink to="/coach-dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
              <IconLink to="/add-swimmer" icon={<UserPlus size={17} />} title="Add Swimmer" />
              <IconLink to="/add-event" icon={<CalendarPlus size={17} />} title="Add Event" />
            </>
          )}

          {currentUserProfile && (
            <Link
              to="/messages"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#e8f6ff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
                padding: "7px 12px",
                borderRadius: "10px",
              }}
            >
              <MessageSquare size={16} />
              Messages
              {unreadCount > 0 && (
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
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {currentUserProfile && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
              <span
                style={{
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "13px",
                  background: "rgba(255,255,255,0.08)",
                  padding: "6px 12px",
                  borderRadius: "999px",
                }}
              >
                {currentUserProfile.name}
              </span>

              <button
                onClick={onLogout}
                title="Sign Out"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "rgba(255,255,255,0.1)",
                  color: "#e8f6ff",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#e8f6ff",
        textDecoration: "none",
        fontWeight: 600,
        fontSize: "14px",
        padding: "7px 12px",
        borderRadius: "10px",
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

function IconLink({ to, icon, title }) {
  return (
    <Link
      to={to}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        color: "#e8f6ff",
        textDecoration: "none",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.07)",
      }}
    >
      {icon}
    </Link>
  );
}
