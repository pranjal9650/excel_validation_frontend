import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";

/* ─── Design tokens (mirrors App.js / Dashboard.js) ─────────── */
const T = {
  red:      "#CC0000",
  redDark:  "#A30000",
  black:    "#111111",
  grey200:  "#E4E4E7",
  grey100:  "#F4F4F5",
  white:    "#FFFFFF",
  text:     "#111111",
  muted:    "#71717A",
  redBg:    "rgba(204,0,0,0.07)",
};

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError("");
    setTimeout(() => {
      if (email === "admin@gmail.com" && password === "1234") {
        localStorage.setItem("isLoggedIn", "true");
        navigate("/dashboard");
      } else {
        setError("Invalid email or password.");
      }
      setLoading(false);
    }, 800);
  };

  const inputStyle = (field) => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: 9,
    border: `1px solid ${focusedField === field ? T.red : T.grey200}`,
    fontSize: 13.5,
    fontFamily: "'DM Sans', sans-serif",
    color: T.text,
    background: focusedField === field ? T.white : T.grey100,
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(204,0,0,0.10)" : "none",
    boxSizing: "border-box",
  });

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: T.black,
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background radial accents — mirrors sidebar in App.js */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(circle at 15% 85%, rgba(204,0,0,0.22) 0%, transparent 52%),
          radial-gradient(circle at 85% 15%, rgba(204,0,0,0.14) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(204,0,0,0.05) 0%, transparent 70%)
        `,
      }} />

      {/* Subtle grid texture */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 400,
        margin: "0 16px",
        background: T.white,
        borderRadius: 20,
        padding: "40px 40px 36px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.40), 0 4px 16px rgba(0,0,0,0.20)",
        animation: "cardIn 0.35s ease",
      }}>
        <style>{`
          @keyframes cardIn {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to   { opacity: 1; transform: translateY(0)   scale(1);    }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Logo */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          marginBottom: 14,
          padding: "8px 0"
        }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              height: 75,
              width: "auto",
              objectFit: "contain",
              borderRadius: 10,
            }}
          />
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, letterSpacing: -0.5, margin: 0 }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: 13.5, color: T.muted, marginTop: 5 }}>
            Sign in to continue to Excel Validator
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: T.grey200, marginBottom: 24 }} />

        {/* Error */}
        {error && (
          <div style={{
            padding: "10px 14px",
            borderRadius: 9,
            background: T.redBg,
            border: `1px solid rgba(204,0,0,0.18)`,
            borderLeft: `3px solid ${T.red}`,
            color: T.red,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 18,
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={inputStyle("email")}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={inputStyle("password")}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              width: "100%",
              padding: "12px",
              background: loading ? T.grey200 : T.red,
              border: "none",
              borderRadius: 9,
              color: loading ? T.muted : T.white,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background  = T.redDark;
                e.currentTarget.style.transform   = "translateY(-1px)";
                e.currentTarget.style.boxShadow   = "0 6px 20px rgba(204,0,0,0.32)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background  = T.red;
                e.currentTarget.style.transform   = "none";
                e.currentTarget.style.boxShadow   = "none";
              }
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: `2px solid rgba(0,0,0,0.15)`,
                  borderTop: `2px solid ${T.muted}`,
                  animation: "spin 0.8s linear infinite",
                  flexShrink: 0,
                }} />
                Signing in…
              </>
            ) : "Sign In"}
          </button>
        </form>

        {/* Footer hint */}
        <p style={{
          textAlign: "center",
          fontSize: 11.5,
          color: T.muted,
          marginTop: 20,
          padding: "10px 0 0",
          borderTop: `1px solid ${T.grey200}`,
        }}>
          Default&nbsp;&nbsp;
          <span style={{ fontFamily: "monospace", color: T.text, fontSize: 11 }}>admin@gmail.com</span>
          &nbsp;/&nbsp;
          <span style={{ fontFamily: "monospace", color: T.text, fontSize: 11 }}>1234</span>
        </p>
      </div>
    </div>
  );
}

export default Login;