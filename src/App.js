import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate
} from "react-router-dom";

import "./App.css";

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

/* -------------------- Layout With Sidebar -------------------- */

const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/");
  };

  return (
    <div className="app-container">

      {/* Sidebar */}
      <div className="sidebar">

        {/* Logo Above Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src={logo}
            alt="Logo"
            style={{
              width: "160px",
              height: "auto"
            }}
          />
        </div>

        <h2 className="logo">ML Dashboard</h2>

        <nav className="sidebar-nav">

          <Link to="/dashboard" className="sidebar-btn">
            📊 Dashboard
          </Link>

          <Link to="/upload" className="sidebar-btn">
            📁 Upload File
          </Link>

          <Link to="/history" className="sidebar-btn">
            📜 Upload History
          </Link>

          <Link to="/form-data" className="sidebar-btn">
            📋 Form Data
          </Link>

          <Link to="/analytics" className="sidebar-btn">
            📈 Analytics
          </Link>

          <Link to="/site-monitoring" className="sidebar-btn">
            📡 Site Monitoring
          </Link>

        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">

        <div className="top-bar">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="page-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/history" element={<History />} />
            <Route path="/form-data" element={<FormData />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/site-monitoring" element={<SiteMonitoring />} />

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>

      </div>
    </div>
  );
};

/* -------------------- Protected Route -------------------- */

const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  return isLoggedIn ? children : <Navigate to="/" />;
};

/* -------------------- Main App -------------------- */

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