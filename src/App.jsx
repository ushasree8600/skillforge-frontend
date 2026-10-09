import { useState } from "react";
import "./App.css";

const API = "http://localhost:8080/api/auth";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault(); setMessage(""); setBusy(true);
    try {
      const response = await fetch(`${API}/${page}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong.");
      if (page === "register") {
        setMessage("Registration successful! Please log in.");
        setPage("login"); setForm({ name: "", email: form.email, password: "" });
      } else { setUser(data); setPage("dashboard"); setMessage(""); }
    } catch (err) {
      setMessage(err.message === "Failed to fetch"
        ? "Cannot connect to backend. Make sure Spring Boot is running on port 8080."
        : err.message);
    } finally { setBusy(false); }
  }

  function logout() {
    setUser(null); setForm({ name: "", email: "", password: "" });
    setMessage(""); setPage("login");
  }

  if (page === "dashboard" && user) return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>SkillForge<span>.</span></h2><p className="muted">STUDENT WORKSPACE</p>
        <button className="nav active">⌂ &nbsp; Dashboard</button>
        <button className="nav" onClick={() => setMessage("Skills: Start tracking the skills you want to develop.")}>✦ &nbsp; My Skills</button>
        <button className="nav" onClick={() => setMessage("Projects: Record your academic and personal projects.")}>▣ &nbsp; Projects</button>
        <button className="nav" onClick={() => setMessage("Certifications: Keep a record of courses you complete.")}>♧ &nbsp; Certifications</button>
        <button className="nav" onClick={() => setMessage("Career Goals: Define your future career direction.")}>◎ &nbsp; Career Goals</button>
        <button className="nav logout" onClick={logout}>↪ &nbsp; Logout</button>
      </aside>
      <main className="main">
        <header className="topbar"><div><p className="muted">YOUR PERSONAL GROWTH SPACE</p><h1>Student Dashboard</h1></div><div className="avatar">{user.name?.charAt(0).toUpperCase()}</div></header>
        <section className="welcome"><p>WELCOME TO SKILLFORGE</p><h2>Hello, {user.name}! 👋</h2><p>Build your skills, track your progress, and prepare for your future career — one step at a time.</p></section>
        <h2 className="section-title">Your Learning Journey</h2>
        <div className="cards">
          <article className="stat"><span>✦</span><p>My Skills</p><h2>Start building</h2><small>Develop skills for your goals</small></article>
          <article className="stat"><span>▣</span><p>Projects</p><h2>Show your work</h2><small>Record projects and achievements</small></article>
          <article className="stat"><span>♧</span><p>Certifications</p><h2>Keep learning</h2><small>Track courses you complete</small></article>
          <article className="stat"><span>◎</span><p>Career Goals</p><h2>Plan your future</h2><small>Focus on your desired career</small></article>
        </div>
        {message && <p className="notice">{message}</p>}
        <section className="next-step"><div><h2>Small steps. Stronger skills.</h2><p>Document your accomplishments and build a clear picture of your career readiness.</p></div><span>🚀</span></section>
        <p className="footer">SkillForge © 2026 · Building and Strengthening Skills</p>
      </main>
    </div>
  );

  return <div className="auth-page">
    <div className="auth-brand"><div className="brand-icon">S</div><h1>SkillForge<span>.</span></h1><p>Build skills. Track growth. Shape your future.</p>
      <div className="brand-message"><h2>Your growth, all in one place.</h2><p>Organize your skills, projects, certifications, and career goals in one simple student workspace.</p></div>
      <small>BUILDING AND STRENGTHENING SKILLS</small>
    </div>
    <div className="auth-panel"><form className="auth-form" onSubmit={submit}>
      <p className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p><h2>{page === "login" ? "Welcome back!" : "Create your account"}</h2>
      <p className="subtitle">{page === "login" ? "Log in to continue your learning journey." : "Join SkillForge and start building your future."}</p>
      {page === "register" && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Enter your full name" required maxLength={100}/></label>}
      <label>Email address<input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" required maxLength={150}/></label>
      <label>Password<input name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters" minLength={8} required/></label>
      {message && <p className="notice">{message}</p>}
      <button className="primary" type="submit" disabled={busy}>{busy ? "Please wait..." : page === "login" ? "Log in to SkillForge →" : "Create account →"}</button>
      <p className="switch">{page === "login" ? "New to SkillForge? " : "Already have an account? "}<button type="button" onClick={() => {setPage(page === "login" ? "register" : "login");setMessage("");}}>{page === "login" ? "Register" : "Log in"}</button></p>
    </form></div>
  </div>;
}
