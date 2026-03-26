import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "./assets/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
  e.preventDefault();

  if (!email || !password) {
    setError("Please enter both email and password.");
    return;
  }

  if (email === "admin@gmail.com" && password === "1234") {
    localStorage.setItem("isLoggedIn", "true");   // 🔥 THIS WAS MISSING
    navigate("/dashboard");
  } else {
    setError("Invalid email or password");
  }
};

  return (
    <div className="login-container">
      <div className="login-card">

        <img src={logo} alt="Company Logo" className="login-logo" />

        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to continue</p>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
        </form>

      </div>
    </div>
  );
}

export default Login;