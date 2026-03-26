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
        <div className="sidebar-logo">
          <img
            src={logo}
            alt="Logo"
          />
        </div>

        <h2 className="sidebar-title">Excel Validator</h2>

        <nav className="sidebar-nav">

          <Link to="/dashboard" className="sidebar-btn">
            <span className="sidebar-icon">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link to="/upload" className="sidebar-btn">
            <span className="sidebar-icon">📤</span>
            <span>Upload File</span>
          </Link>

          <Link to="/history" className="sidebar-btn">
            <span className="sidebar-icon">📋</span>
            <span>Upload History</span>
          </Link>

          <Link to="/form-data" className="sidebar-btn">
            <span className="sidebar-icon">📑</span>
            <span>Form Data</span>
          </Link>

          <Link to="/analytics" className="sidebar-btn">
            <span className="sidebar-icon">📈</span>
            <span>Analytics</span>
          </Link>

          <Link to="/site-monitoring" className="sidebar-btn">
            <span className="sidebar-icon">🗺️</span>
            <span>Site Monitoring</span>
          </Link>

          {/* Logout Button in Sidebar */}
          <button className="sidebar-btn" onClick={handleLogout} style={{ marginTop: 'auto' }}>
            <span className="sidebar-icon">🚪</span>
            <span>Logout</span>
          </button>

        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">

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