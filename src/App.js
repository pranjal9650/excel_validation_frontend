import React, { useState } from "react";
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
  Search,
  Moon,
  Sun,
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

/* ─── Nav items ──────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: "Dashboard",       icon: LayoutDashboard, path: "/dashboard" },
  { label: "Upload File",     icon: Upload,           path: "/upload" },
  { label: "Upload History",  icon: ClipboardList,    path: "/history" },
  { label: "Form Data",       icon: FileSpreadsheet,  path: "/form-data" },
  { label: "Analytics",       icon: BarChart2,        path: "/analytics" },
  { label: "Site Monitoring", icon: MapPin,           path: "/site-monitoring" },
];

const PAGE_TITLES = {
  "/dashboard":       "Dashboard",
  "/upload":          "Upload File",
  "/history":         "Upload History",
  "/form-data":       "Form Data",
  "/analytics":       "Analytics",
  "/site-monitoring": "Site Monitoring",
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

/* ─── Layout ─────────────────────────────────────────────────── */
const Layout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme]         = useState("light");

  const SIDEBAR_W = collapsed ? 64 : 228;
  const pageTitle = PAGE_TITLES[location.pathname] ?? "Excel Validator";

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'DM Sans', sans-serif" }}>

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
          background: T.white,
          borderBottom: `1px solid ${T.grey200}`,
          padding: "0 24px",
          gap: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
          zIndex: 50,
        }}>
          {/* Left: page title */}
          <div style={{ flex: "0 0 auto" }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: T.black, margin: 0, letterSpacing: -0.3 }}>
              {pageTitle}
            </h1>
          </div>

          {/* Right: actions */}
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 8 }}>
            <IconBtn onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))} label="Theme">
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </IconBtn>

            <div style={{ position: "relative" }}>
              <IconBtn label="Notifications">
                <Bell size={16} />
              </IconBtn>
              <span style={{
                position: "absolute", top: 5, right: 5,
                width: 14, height: 14, borderRadius: "50%",
                background: T.red, color: T.white,
                fontSize: 8.5, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${T.white}`,
              }}>3</span>
            </div>

            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: T.red, color: T.white,
              fontSize: 12, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              letterSpacing: 0.5, cursor: "pointer",
              boxShadow: `0 0 0 2px ${T.white}, 0 0 0 3.5px ${T.red}`,
            }}>
              PG
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          overflowY: "auto",
          padding: 28,
          background: T.grey100,
        }}>
          <Routes>
            <Route path="/dashboard"       element={<Dashboard />} />
            <Route path="/upload"          element={<UploadPage />} />
            <Route path="/history"         element={<History />} />
            <Route path="/form-data"       element={<FormData />} />
            <Route path="/analytics"       element={<Analytics />} />
            <Route path="/site-monitoring" element={<SiteMonitoring />} />
            <Route path="*"                element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>
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

/* ─── Search bar ─────────────────────────────────────────────── */
function SearchBar() {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: focused ? "#fff" : "#F4F4F5",
      border: `1px solid ${focused ? "#CC0000" : "#E4E4E7"}`,
      borderRadius: 10,
      padding: "7px 12px",
      width: 280,
      transition: "all 0.15s ease",
      boxShadow: focused ? "0 0 0 3px rgba(204,0,0,0.10)" : "none",
    }}>
      <Search size={14} style={{ color: "#999", flexShrink: 0 }} />
      <input
        type="text"
        placeholder="Search…"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, border: "none", background: "transparent",
          outline: "none", fontSize: 13.5,
          fontFamily: "'DM Sans', sans-serif", color: "#111",
        }}
      />
      <kbd style={{
        fontSize: 10.5, color: "#aaa", background: "#E4E4E7",
        borderRadius: 4, padding: "1px 5px", border: "1px solid #ddd",
        fontFamily: "'DM Sans', sans-serif",
      }}>⌘K</kbd>
    </div>
  );
}

/* ─── Icon button ────────────────────────────────────────────── */
function IconBtn({ children, onClick, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 34, height: 34, borderRadius: 8,
        border: "1px solid #E4E4E7",
        background: hovered ? "#F4F4F5" : "#fff",
        color: hovered ? "#111" : "#555",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.15s ease", padding: 0,
      }}
    >
      {children}
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