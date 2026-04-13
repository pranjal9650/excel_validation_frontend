import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
  useLocation,
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
  LogOut,
  ChevronLeft,
  ChevronRight,
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
  black:     "#111111",
  grey900:   "#1A1A1A",
  grey800:   "#2A2A2A",
  grey200:   "#E4E4E7",
  grey100:   "#F4F4F5",
  white:     "#FFFFFF",
  textMuted: "rgba(255,255,255,0.55)",
  textNav:   "rgba(255,255,255,0.80)",
};

/* ─── Theme tokens ───────────────────────────────────────────── */
const THEME_TOKENS = {
  light: {
    bg:         "#F4F4F5",
    surface:    "#FFFFFF",
    border:     "#E4E4E7",
    text:       "#111111",
    muted:      "#71717A",
    headerBg:   "#FFFFFF",
    headerBorder: "#E4E4E7",
    inputBg:    "#F4F4F5",
  },
  dark: {
    bg:         "#0F0F0F",
    surface:    "#1A1A1A",
    border:     "#2A2A2A",
    text:       "#F4F4F5",
    muted:      "#A1A1AA",
    headerBg:   "#111111",
    headerBorder: "#2A2A2A",
    inputBg:    "#222222",
  },
};

/* ─── Resolve "system" to light or dark ─────────────────────── */
function resolveTheme(pref) {
  if (pref === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return pref;
}

/* ─── Nav items ──────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Dashboard",       icon: LayoutDashboard, path: "/dashboard" },
  { label: "Upload File",     icon: Upload,           path: "/upload" },
  { label: "Upload History",  icon: ClipboardList,    path: "/history" },
  { label: "Form Data",       icon: FileSpreadsheet,  path: "/form-data" },
  { label: "Analytics",       icon: BarChart2,        path: "/analytics" },
  { label: "Site Monitoring", icon: MapPin,           path: "/site-monitoring" },
  { label: "Create Form",     icon: FileSpreadsheet,  path: "/create-form" },
];

const PAGE_TITLES = {
  "/dashboard":       "Dashboard",
  "/upload":          "Upload File",
  "/history":         "Upload History",
  "/form-data":       "Form Data",
  "/analytics":       "Analytics",
  "/site-monitoring": "Site Monitoring",
  "/create-form":     "Create Form",
};

/* ─── Sidebar nav link ───────────────────────────────────────── */
function SideNavLink({ item, collapsed }) {
  const Icon = item.icon;
  const [hovered, setHovered] = useState(false);

  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={({ isActive }) => ({
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 10,
        padding: collapsed ? "10px 0" : "9px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        borderRadius: 8,
        textDecoration: "none",
        color: isActive ? T.white : hovered ? T.white : T.textNav,
        background: isActive
          ? T.red
          : hovered
          ? "rgba(255,255,255,0.08)"
          : "transparent",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13.5,
        fontWeight: isActive ? 600 : 500,
        transition: "all 0.15s ease",
        boxShadow: isActive ? "0 2px 12px rgba(204,0,0,0.35)" : "none",
        cursor: "pointer",
        whiteSpace: "nowrap",
        overflow: "hidden",
      })}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );
}

/* ─── Theme Dropdown ─────────────────────────────────────────── */
function ThemeDropdown({ themePref, setThemePref, themeTokens }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  /* Close on outside click */
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
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Theme"
        style={{
          width: 34, height: 34, borderRadius: 8,
          border: `1px solid ${themeTokens.border}`,
          background: open ? themeTokens.inputBg : themeTokens.surface,
          color: themeTokens.muted,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", transition: "all 0.15s ease", padding: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = themeTokens.inputBg; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = themeTokens.surface; }}
      >
        <ActiveIcon size={16} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 168,
          background: themeTokens.surface,
          border: `1px solid ${themeTokens.border}`,
          borderRadius: 12,
          boxShadow: "0 8px 30px rgba(0,0,0,0.14)",
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
                  background: isActive ? (resolved === "dark" ? "rgba(255,255,255,0.06)" : T.grey100) : "transparent",
                  color: isActive ? themeTokens.text : themeTokens.muted,
                  fontSize: 13.5,
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = resolved === "dark" ? "rgba(255,255,255,0.05)" : T.grey100;
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
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  /* Theme: stored in localStorage so it persists across reloads */
  const [themePref, setThemePref] = useState(() => {
    return localStorage.getItem("themePref") || "system";
  });

  useEffect(() => {
    localStorage.setItem("themePref", themePref);
  }, [themePref]);

  /* Listen for system preference changes when pref = "system" */
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

  const SIDEBAR_W = collapsed ? 64 : 228;
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Excel Validator";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
      background: th.bg,
      transition: "background 0.2s ease",
    }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside style={{
        width: SIDEBAR_W,
        minWidth: SIDEBAR_W,
        height: "100vh",
        background: T.black,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "width 0.22s ease, min-width 0.22s ease",
        overflow: "hidden",
        zIndex: 100,
        backgroundImage: `
          radial-gradient(circle at 85% 8%, rgba(204,0,0,0.20) 0%, transparent 50%),
          radial-gradient(circle at 15% 92%, rgba(204,0,0,0.12) 0%, transparent 48%)
        `,
      }}>

        {/* Brand */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 16px",
          minHeight: 60,
        }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: 100, height: 100, objectFit: "contain", flexShrink: 0, borderRadius: 16 }}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "4px 14px 6px" }} />

        {/* Nav links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "4px 10px", flex: 1, marginTop: 2 }}>
          {NAV_ITEMS.map((item) => (
            <SideNavLink key={item.path} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "8px 14px" }} />

        {/* Logout */}
        <LogoutBtn collapsed={collapsed} onLogout={handleLogout} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
          style={{
            position: "absolute",
            bottom: 80,
            right: -11,
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: `1.5px solid rgba(255,255,255,0.18)`,
            background: T.grey800,
            color: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 110,
            padding: 0,
          }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* ── Right panel ──────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          display: "flex",
          alignItems: "center",
          height: 60,
          minHeight: 60,
          background: th.headerBg,
          borderBottom: `1px solid ${th.headerBorder}`,
          padding: "0 24px",
          gap: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
          zIndex: 50,
          transition: "background 0.2s ease, border-color 0.2s ease",
        }}>

          {/* Left: page title */}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: th.text, margin: 0, letterSpacing: -0.3, transition: "color 0.2s ease" }}>
              {pageTitle}
            </h1>
          </div>

          {/* Right: actions — Bell · Theme · PG avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* Bell with badge */}
            <div style={{ position: "relative" }}>
              <button
                aria-label="Notifications"
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: `1px solid ${th.border}`,
                  background: th.surface,
                  color: th.muted,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s ease", padding: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = th.inputBg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = th.surface; }}
              >
                <Bell size={16} />
              </button>
              <span style={{
                position: "absolute", top: 5, right: 5,
                width: 14, height: 14, borderRadius: "50%",
                background: T.red, color: T.white,
                fontSize: 8.5, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${th.headerBg}`,
                pointerEvents: "none",
              }}>3</span>
            </div>

            {/* Theme dropdown */}
            <ThemeDropdown
              themePref={themePref}
              setThemePref={setThemePref}
              themeTokens={th}
            />

            {/* Divider */}
            <div style={{ width: 1, height: 22, background: th.border }} />

            {/* PG Avatar — far right */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: T.red, color: T.white,
                fontSize: 12, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                letterSpacing: 0.5,
                boxShadow: `0 0 0 2px ${th.headerBg}, 0 0 0 3.5px ${T.red}`,
                flexShrink: 0,
              }}>
                PG
              </div>
              <span style={{
                fontSize: 13.5, fontWeight: 600,
                color: th.text,
                transition: "color 0.2s ease",
                whiteSpace: "nowrap",
              }}>
                Pranjal Gupta
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: 28,
          background: th.bg,
          transition: "background 0.2s ease",
        }}>
          <Routes>
            <Route path="/dashboard"       element={<Dashboard />} />
            <Route path="/upload"          element={<UploadPage />} />
            <Route path="/create-form"     element={<CreateForm />} />
            <Route path="/history"         element={<History />} />
            <Route path="/form-data"       element={<FormData />} />
            <Route path="/analytics"       element={<Analytics />} />
            <Route path="/site-monitoring" element={<SiteMonitoring />} />
            <Route path="*"                element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* ─── Logout button ──────────────────────────────────────────── */
function LogoutBtn({ collapsed, onLogout }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onLogout}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={collapsed ? "Logout" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 10,
        padding: collapsed ? "10px 0" : "9px 12px",
        justifyContent: collapsed ? "center" : "flex-start",
        margin: "0 10px 12px",
        borderRadius: 8,
        border: "none",
        background: hovered ? "rgba(204,0,0,0.15)" : "transparent",
        color: hovered ? "#ff6b6b" : "rgba(255,255,255,0.45)",
        fontSize: 13.5,
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
    >
      <LogOut size={18} style={{ flexShrink: 0 }} />
      {!collapsed && <span>Logout</span>}
    </button>
  );
}

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