import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from "react-router-dom";

/* Pages */
import Login from "./Login";
import Dashboard from "./Dashboard";
import UploadPage from "./UploadPage";
import History from "./History";
import FormData from "./FormData";
import Analytics from "./Analytics";
import SiteMonitoring from "./SiteMonitoring";
import CreateForm from "./CreateForm";
import Rules from "./Rules";

/* Logo */
import logo from "./assets/logo.png";

/* Lucide Icons */
import {
  LayoutDashboard,
  Upload,
  ClipboardList,
  FileSpreadsheet,
  BarChart2,
  MapPin,
  BookOpen,
  LogOut,
  Bell,
  Moon,
  Sun,
  Monitor,
  Check,
} from "lucide-react";

/* ─── Design tokens ──────────────────────────────────────────── */
const T = {
  red:       "#CC0000",
  redDark:   "#A30000",
  redLight:  "rgba(204,0,0,0.07)",
  black:     "#111111",
  white:     "#FFFFFF",
  grey100:   "#F7F5F0",
  grey200:   "#E5E2DC",
  grey500:   "#6B7280",
  border:    "#E5E2DC",
};

/* ─── Theme tokens ───────────────────────────────────────────── */
const THEME_TOKENS = {
  light: {
    bg:           "#F7F5F0",
    surface:      "#FFFFFF",
    border:       "#E5E2DC",
    text:         "#111111",
    muted:        "#6B7280",
    headerBg:     "#FFFFFF",
    headerBorder: "#E5E2DC",
    inputBg:      "#F2F0EB",
  },
  dark: {
    bg:           "#0F0F0F",
    surface:      "#1A1A1A",
    border:       "#2A2A2A",
    text:         "#F2F0EB",
    muted:        "#9CA3AF",
    headerBg:     "#111111",
    headerBorder: "#2A2A2A",
    inputBg:      "#222222",
  },
};

function resolveTheme(pref) {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

/* ─── Nav items ──────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Dashboard",  icon: LayoutDashboard, path: "/dashboard" },
  { label: "Upload",     icon: Upload,           path: "/upload" },
  { label: "History",    icon: ClipboardList,    path: "/history" },
  { label: "Form Data",  icon: FileSpreadsheet,  path: "/form-data" },
  { label: "Analytics",  icon: BarChart2,        path: "/analytics" },
  { label: "Site Monitoring", icon: MapPin,           path: "/site-monitoring" },
  { label: "Create Form",     icon: FileSpreadsheet,  path: "/create-form" },
  { label: "Rules",           icon: BookOpen,         path: "/rules" },
];

/* ─── Top nav link ───────────────────────────────────────────── */
function TopNavLink({ item, th }) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={item.path}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "0 14px",
        height: "100%",
        textDecoration: "none",
        fontSize: 13.5,
        fontWeight: isActive ? 600 : 400,
        fontFamily: "'DM Sans', sans-serif",
        color: isActive ? T.red : (hovered ? T.black : th.muted),
        background: hovered && !isActive ? "rgba(0,0,0,0.035)" : "transparent",
        transition: "color 0.15s ease, background 0.15s ease",
        whiteSpace: "nowrap",
        cursor: "pointer",
        // Bottom border indicator for active
        borderBottom: isActive ? `2px solid ${T.red}` : "2px solid transparent",
        borderTop: "2px solid transparent",
        boxSizing: "border-box",
      })}
    >
      <Icon size={14} style={{ flexShrink: 0, opacity: 0.75 }} />
      <span>{item.label}</span>
    </NavLink>
  );
}

/* ─── Theme Dropdown ─────────────────────────────────────────── */
function ThemeDropdown({ themePref, setThemePref, themeTokens }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const resolved = resolveTheme(themePref);
  const options = [
    { value: "light",  label: "Light",  icon: Sun },
    { value: "dark",   label: "Dark",   icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];
  const ActiveIcon = resolved === "dark" ? Moon : Sun;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Theme"
        style={{
          width: 36, height: 36, borderRadius: "50%",
          border: "none",
          background: open ? "rgba(0,0,0,0.06)" : "transparent",
          color: themeTokens.muted,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.15s ease", padding: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; e.currentTarget.style.color = "#111"; }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = themeTokens.muted; } }}
      >
        <ActiveIcon size={16} />
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 168,
          background: themeTokens.surface,
          border: `1px solid ${themeTokens.border}`,
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
          zIndex: 300,
          overflow: "hidden",
          animation: "fadeInDown 0.15s ease",
        }}>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isActive = themePref === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { setThemePref(opt.value); setOpen(false); }}
                style={{
                  width: "100%",
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px",
                  border: "none",
                  background: isActive ? (resolved === "dark" ? "rgba(255,255,255,0.06)" : "#F2F0EB") : "transparent",
                  color: isActive ? themeTokens.text : themeTokens.muted,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = resolved === "dark" ? "rgba(255,255,255,0.05)" : "#F2F0EB";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isActive && <Check size={13} color={T.red} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Layout ─────────────────────────────────────────────────── */
const Layout = () => {
  const navigate = useNavigate();

  const [themePref, setThemePref] = useState(() => {
    return localStorage.getItem("themePref") || "system";
  });

  useEffect(() => {
    localStorage.setItem("themePref", themePref);
  }, [themePref]);

  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const resolvedTheme = themePref === "system" ? (systemDark ? "dark" : "light") : themePref;
  const th = THEME_TOKENS[resolvedTheme];

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      fontFamily: "'DM Sans', sans-serif",
      background: th.bg,
      transition: "background 0.2s ease",
    }}>

      {/* ── Top Navbar ───────────────────────────────────────── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: th.headerBg,
        borderBottom: `1px solid ${th.headerBorder}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 24px",
          height: 70,
          display: "flex",
          alignItems: "center",
          gap: 0,
        }}>

          {/* Brand / Logo */}
          <div style={{
            display: "flex",
            alignItems: "center",
            marginRight: 32,
            flexShrink: 0,
          }}>
            <img
              src={logo}
              alt="Logo"
              style={{ height: 52, width: "auto", objectFit: "contain", borderRadius: 10 }}
            />
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 24, background: th.border, marginRight: 8, flexShrink: 0 }} />

          {/* Nav links */}
          <nav style={{
            display: "flex",
            alignItems: "stretch",
            height: 70,
            flex: 1,
            gap: 0,
          }}>
            {NAV_ITEMS.map((item) => (
              <TopNavLink key={item.path} item={item} th={th} />
            ))}
          </nav>

          {/* Right: actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 16 }}>

            {/* Notification bell */}
            <div style={{ position: "relative" }}>
              <button
                aria-label="Notifications"
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "none",
                  background: "transparent",
                  color: th.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s ease", padding: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; e.currentTarget.style.color = T.black; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = th.muted; }}
              >
                <Bell size={17} />
              </button>
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 7, height: 7, borderRadius: "50%",
                background: T.red,
                border: `1.5px solid ${th.headerBg}`,
                pointerEvents: "none",
              }} />
            </div>

            {/* Theme dropdown */}
            <ThemeDropdown
              themePref={themePref}
              setThemePref={setThemePref}
              themeTokens={th}
            />

            {/* Divider */}
            <div style={{ width: 1, height: 22, background: th.border, margin: "0 6px" }} />

            {/* Avatar + name + logout grouped */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: T.red, color: T.white,
                fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                letterSpacing: 0.5,
                flexShrink: 0,
              }}>
                PG
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: th.text, whiteSpace: "nowrap" }}>
                  Pranjal Gupta
                </span>
                <span style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>Admin</span>
              </div>
            </div>

            {/* Logout — icon only, circular ghost */}
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                width: 36, height: 36, borderRadius: "50%",
                border: "none",
                background: "transparent",
                color: th.muted,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
                padding: 0,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(204,0,0,0.08)";
                e.currentTarget.style.color = T.red;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = th.muted;
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Page content ─────────────────────────────────────── */}
      <main style={{
        flex: 1,
        overflowY: "auto",
        background: th.bg,
        transition: "background 0.2s ease",
      }}>
        <div style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "32px 24px",
          width: "100%",
        }}>
          <Routes>
            <Route path="/dashboard"       element={<Dashboard />} />
            <Route path="/upload"          element={<UploadPage />} />
            <Route path="/create-form"     element={<CreateForm />} />
            <Route path="/history"         element={<History />} />
            <Route path="/form-data"       element={<FormData />} />
            <Route path="/analytics"       element={<Analytics />} />
            <Route path="/site-monitoring" element={<SiteMonitoring />} />
            <Route path="/rules"           element={<Rules />} />
            <Route path="*"               element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>

      <style>{`
        nav::-webkit-scrollbar { display: none; }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ─── Protected route ────────────────────────────────────────── */
const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return isLoggedIn ? children : <Navigate to="/" />;
};

/* ─── App root ───────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
