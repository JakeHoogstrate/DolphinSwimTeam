import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getUserProfile, resetPassword } from "../services/authService";

export default function LoginPage() {
  const navigate  = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("login");
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      const user    = await loginUser(email, password);
      const profile = await getUserProfile(user.uid);

      if (!profile) {
        setError("No user profile found for this account.");
        return;
      }

      if (profile.role === "coach")       navigate("/coach-dashboard");
      else if (profile.role === "parent") navigate("/dashboard");
      else setError("Unknown account role.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Enter your email address above.");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await resetPassword(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        maxWidth: "400px",
        margin: "72px auto 0",
        background: "white",
        borderRadius: "24px",
        padding: "36px",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
      }}
    >
      <h2
        style={{
          margin: "0 0 24px",
          fontSize: "26px",
          letterSpacing: "-0.02em",
          color: "#0f172a",
        }}
      >
        {mode === "forgot" ? "Reset Password" : "Sign In"}
      </h2>

      {mode === "login" && (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <button
            type="button"
            onClick={() => { setMode("forgot"); setError(""); }}
            style={linkButtonStyle}
          >
            Forgot password?
          </button>
        </form>
      )}

      {mode === "forgot" && !resetSent && (
        <form onSubmit={handleReset}>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: 0, marginBottom: "18px" }}>
            Enter your email and we'll send you a reset link.
          </p>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Sending…" : "Send Reset Link"}
          </button>
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); }}
            style={linkButtonStyle}
          >
            Back to sign in
          </button>
        </form>
      )}

      {mode === "forgot" && resetSent && (
        <div>
          <p style={{ color: "#166534", fontSize: "15px", marginTop: 0 }}>
            Reset link sent to <strong>{email}</strong>. Check your inbox.
          </p>
          <button
            type="button"
            onClick={() => { setMode("login"); setResetSent(false); setError(""); }}
            style={linkButtonStyle}
          >
            Back to sign in
          </button>
        </div>
      )}

      {error && (
        <p style={{ color: "#dc2626", marginTop: "14px", fontSize: "14px" }}>
          {error}
        </p>
      )}
    </section>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid #cbd5e1",
  marginBottom: "12px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonStyle = {
  display: "block",
  width: "100%",
  border: "none",
  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
  color: "white",
  fontWeight: 800,
  borderRadius: "999px",
  padding: "13px",
  fontSize: "15px",
  cursor: "pointer",
  marginTop: "4px",
};

const linkButtonStyle = {
  display: "block",
  width: "100%",
  border: "none",
  background: "none",
  color: "#0ea5e9",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: "14px",
  textAlign: "center",
  padding: 0,
};
