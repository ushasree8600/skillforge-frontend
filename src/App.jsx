
import { useState } from "react";
import "./App.css";

// SkillForge deployed backend API
const API = `${import.meta.env.VITE_API_URL}/api/auth`;

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [busy, setBusy] = useState(false);

  // Update form fields
  function update(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Switch between login and registration
  function switchPage(nextPage) {
    setPage(nextPage);
    setMessage("");
    setMessageType("");
  }

  // Register or log in
  async function submit(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setBusy(true);

    try {
      const endpoint =
        page === "register" ? "/register" : "/login";

      const payload =
        page === "register"
          ? {
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
            }
          : {
              email: form.email.trim(),
              password: form.password,
            };

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Request failed.");
        setMessageType("error");
        return;
      }

      if (page === "register") {
        setMessage(
          data.message || "Registration successful. Please log in."
        );
        setMessageType("success");

        setForm({
          name: "",
          email: form.email.trim(),
          password: "",
        });

        setPage("login");
      } else {
        setUser(data);
        setMessage(data.message || "Login successful.");
        setMessageType("success");
      }
    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(
        "Unable to connect to the server. Check your internet connection and try again."
      );
      setMessageType("error");
    } finally {
      setBusy(false);
    }
  }

  // Log out of the current screen
  function logout() {
    setUser(null);

    setForm({
      name: "",
      email: "",
      password: "",
    });

    setPage("login");
    setMessage("You have logged out.");
    setMessageType("success");
  }

  // Dashboard after successful login
  if (user) {
    return (
      <main className="app-container">
        <section className="auth-card dashboard-card">
          <div className="brand-icon">SF</div>

          <h1>SkillForge</h1>

          <p className="subtitle">
            Build skills. Shape your future.
          </p>

          <div className="welcome-section">
            <h2>Welcome, {user.name}!</h2>

            <p>
              You have successfully logged in to SkillForge.
            </p>

            <div className="user-details">
              <p>
                <strong>Name:</strong> {user.name}
              </p>

              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Login and registration screen
  return (
    <main className="app-container">
      <section className="auth-card">
        <div className="brand-icon">SF</div>

        <h1>SkillForge</h1>

        <p className="subtitle">
          Build skills. Shape your future.
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={page === "login" ? "active" : ""}
            onClick={() => switchPage("login")}
          >
            Login
          </button>

          <button
            type="button"
            className={page === "register" ? "active" : ""}
            onClick={() => switchPage("register")}
          >
            Register
          </button>
        </div>

        <h2>
          {page === "register"
            ? "Create Your Account"
            : "Welcome Back"}
        </h2>

        <p className="form-description">
          {page === "register"
            ? "Start your learning journey with SkillForge."
            : "Log in to continue your learning journey."}
        </p>

        <form onSubmit={submit}>
          {page === "register" && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>

              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={update}
                autoComplete="name"
                maxLength={100}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={update}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={update}
              autoComplete={
                page === "register"
                  ? "new-password"
                  : "current-password"
              }
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={busy}
          >
            {busy
              ? "Please wait..."
              : page === "register"
                ? "Create Account"
                : "Login"}
          </button>
        </form>

        {message && (
          <p
            className={`message ${messageType}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        )}

        <p className="switch-text">
          {page === "register"
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            className="text-button"
            onClick={() =>
              switchPage(
                page === "register" ? "login" : "register"
              )
            }
          >
            {page === "register" ? "Login" : "Register"}
          </button>
        </p>

        <p className="footer-text">
          © 2026 SkillForge. Keep learning, keep growing.
        </p>
      </section>
    </main>
  );
}
