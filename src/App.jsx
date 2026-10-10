
import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://skillforge-backend-1-na61.onrender.com";

const INTEREST_OPTIONS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Web Development",
  "Data Science",
  "Cloud Computing",
  "Cybersecurity",
  "Mobile App Development",
  "UI/UX Design",
  "Game Development",
  "Programming",
];

const COURSE_CATALOG = [
  {
    id: 1,
    title: "Python Programming",
    category: "Programming",
    level: "Beginner",
    lessons: ["Python Basics", "Variables", "Loops", "Functions"],
  },
  {
    id: 2,
    title: "AI Fundamentals",
    category: "Artificial Intelligence",
    level: "Beginner",
    lessons: ["Introduction to AI", "Search", "Knowledge Representation"],
  },
  {
    id: 3,
    title: "Machine Learning Essentials",
    category: "Machine Learning",
    level: "Intermediate",
    lessons: ["ML Basics", "Data Preparation", "Model Evaluation"],
  },
  {
    id: 4,
    title: "Web Development",
    category: "Web Development",
    level: "Beginner",
    lessons: ["HTML", "CSS", "JavaScript"],
  },
  {
    id: 5,
    title: "Data Science",
    category: "Data Science",
    level: "Intermediate",
    lessons: ["Data Analysis", "Visualization", "Data Projects"],
  },
  {
    id: 6,
    title: "Cloud Computing",
    category: "Cloud Computing",
    level: "Beginner",
    lessons: ["Cloud Basics", "Cloud Services", "Deployment"],
  },
  {
    id: 7,
    title: "Cybersecurity Fundamentals",
    category: "Cybersecurity",
    level: "Beginner",
    lessons: ["Security Basics", "Network Security", "Common Threats"],
  },
  {
    id: 8,
    title: "UI/UX Design",
    category: "UI/UX Design",
    level: "Beginner",
    lessons: ["Design Principles", "Wireframes", "Prototyping"],
  },
  {
    id: 9,
    title: "Mobile App Development",
    category: "Mobile App Development",
    level: "Beginner",
    lessons: ["App Basics", "UI Components", "Navigation"],
  },
  {
    id: 10,
    title: "Game Development",
    category: "Game Development",
    level: "Beginner",
    lessons: ["Game Design", "Game Mechanics", "Build a Game"],
  },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  // Authentication
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  // Dashboard
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [interests, setInterests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [goals, setGoals] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [editingGoal, setEditingGoal] = useState(null);
  const [courseSearch, setCourseSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showCatalog, setShowCatalog] = useState(false);

  function storageKey(key, accountEmail = user?.email) {
    return `skillforge:${(accountEmail || "").toLowerCase()}:${key}`;
  }

  function notify(text, type = "error") {
    setMessage(text);
    setMessageType(type);
  }

  // Load saved learning data for the signed-in account.
  useEffect(() => {
    if (!user) return;

    setInterests(readStorage(storageKey("interests"), []));
    setCourses(readStorage(storageKey("courses"), []));
    setGoals(readStorage(storageKey("goals"), []));
    setProfileName(user.name);
  }, [user]);

  // Save learning data in this browser.
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(storageKey("interests"), JSON.stringify(interests));
  }, [interests, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(storageKey("courses"), JSON.stringify(courses));
  }, [courses, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(storageKey("goals"), JSON.stringify(goals));
  }, [goals, user]);

  // Register and login use the existing backend API.
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (page === "register") {
      if (!name.trim()) {
        notify("Please enter your name.");
        return;
      }

      if (password.length < 8) {
        notify("Password must contain at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        notify("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint =
        page === "register" ? "/api/auth/register" : "/api/auth/login";

      const body =
        page === "register"
          ? {
              name: name.trim(),
              email: email.trim(),
              password,
            }
          : {
              email: email.trim(),
              password,
            };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const raw = await response.text();
      let data = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data = { message: raw };
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            (response.status === 401
              ? "Invalid email or password."
              : `Request failed (${response.status}).`)
        );
      }

      if (page === "register") {
        notify("Registration successful! Please log in.", "success");
        setPage("login");
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const account = data.user || data.data || data;

      const loggedInUser = {
        name: account.name || name.trim() || email.split("@")[0],
        email: account.email || email.trim(),
      };

      setUser(loggedInUser);
      setActiveTab("Dashboard");
      setPassword("");
      notify("Login successful!", "success");
    } catch (error) {
      notify(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function switchAuth(nextPage) {
    setPage(nextPage);
    setMessage("");
    setPassword("");
    setConfirmPassword("");
  }

  function logout() {
    setUser(null);
    setPage("login");
    setActiveTab("Dashboard");
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setMessage("");
    setShowCatalog(false);
  }

  // Interests
  function toggleInterest(interest) {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  }

  // Courses
  function enrollCourse(course) {
    if (courses.some((item) => item.id === course.id)) {
      notify("You are already enrolled in this course.");
      return;
    }

    setCourses((current) => [
      ...current,
      {
        ...course,
        completedLessons: [],
      },
    ]);

    notify(`Successfully enrolled in ${course.title}!`, "success");
  }

  function toggleLesson(courseId, lessonIndex) {
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) return course;

        const completed = course.completedLessons || [];
        const updated = completed.includes(lessonIndex)
          ? completed.filter((index) => index !== lessonIndex)
          : [...completed, lessonIndex];

        return { ...course, completedLessons: updated };
      })
    );
  }

  // Career goals
  function saveGoal(event) {
    event.preventDefault();

    if (!newGoal.trim()) return;

    if (editingGoal) {
      setGoals((current) =>
        current.map((goal) =>
          goal.id === editingGoal
            ? {
                ...goal,
                title: newGoal.trim(),
                targetDate: goalDate,
              }
            : goal
        )
      );

      notify("Goal updated successfully.", "success");
    } else {
      setGoals((current) => [
        ...current,
        {
          id: makeId(),
          title: newGoal.trim(),
          targetDate: goalDate,
          completed: false,
        },
      ]);

      notify("Career goal added!", "success");
    }

    setNewGoal("");
    setGoalDate("");
    setEditingGoal(null);
  }

  function editGoal(goal) {
    setEditingGoal(goal.id);
    setNewGoal(goal.title);
    setGoalDate(goal.targetDate || "");
  }

  function deleteGoal(goalId) {
    setGoals((current) => current.filter((goal) => goal.id !== goalId));
    notify("Goal deleted.", "success");
  }

  function toggleGoal(goalId) {
    setGoals((current) =>
      current.map((goal) =>
        goal.id === goalId
          ? { ...goal, completed: !goal.completed }
          : goal
      )
    );
  }

  // Profile
  function saveProfile(event) {
    event.preventDefault();

    if (!profileName.trim()) {
      notify("Name cannot be empty.");
      return;
    }

    setUser((current) => ({
      ...current,
      name: profileName.trim(),
    }));

    notify("Profile updated successfully.", "success");
  }

  // Calculated statistics
  const enrolledIds = courses.map((course) => course.id);

  const completedLessons = courses.reduce(
    (total, course) =>
      total + (course.completedLessons || []).length,
    0
  );

  const totalLessons = courses.reduce(
    (total, course) => total + course.lessons.length,
    0
  );

  const learningProgress = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  const completedGoals = goals.filter((goal) => goal.completed).length;

  const achievements = [
    ...(courses.length ? ["First course enrolled"] : []),
    ...(completedLessons ? ["First lesson completed"] : []),
    ...(completedGoals ? ["Career goal achieved"] : []),
    ...(learningProgress === 100 && totalLessons
      ? ["All lessons completed"]
      : []),
  ];

  const recommendedCourses = COURSE_CATALOG.filter(
    (course) =>
      interests.includes(course.category) &&
      !enrolledIds.includes(course.id)
  );

  const filteredCourses = COURSE_CATALOG.filter((course) => {
    const searchMatch =
      course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      course.category.toLowerCase().includes(courseSearch.toLowerCase());

    const categoryMatch =
      categoryFilter === "All" || course.category === categoryFilter;

    return searchMatch && categoryMatch;
  });

  // Authentication screen
  if (!user) {
    return (
      <main className="auth-page">
        <div className="auth-decoration decoration-one" />
        <div className="auth-decoration decoration-two" />

        <section className="auth-card">
          <div className="brand">
            <div className="brand-icon">S</div>
            <span>SkillForge</span>
          </div>

          <div className="auth-heading">
            <p className="eyebrow">YOUR FUTURE STARTS HERE</p>
            <h1>
              {page === "login" ? "Welcome back!" : "Create your account"}
            </h1>
            <p className="subtitle">
              {page === "login"
                ? "Continue your learning journey and reach your goals."
                : "Join SkillForge and start building your future today."}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={page === "login" ? "auth-tab active" : "auth-tab"}
              onClick={() => switchAuth("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={page === "register" ? "auth-tab active" : "auth-tab"}
              onClick={() => switchAuth("register")}
            >
              Register
            </button>
          </div>

          {message && (
            <div
              className={`notice ${
                messageType === "success" ? "notice-success" : "notice-error"
              }`}
              role="status"
            >
              {message}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {page === "register" && (
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={
                  page === "register"
                    ? "At least 8 characters"
                    : "Enter your password"
                }
                autoComplete={
                  page === "login" ? "current-password" : "new-password"
                }
                minLength={page === "register" ? 8 : undefined}
                required
              />
            </div>

            {page === "register" && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : page === "login"
                  ? "Login to SkillForge →"
                  : "Create Account →"}
            </button>
          </form>

          <p className="auth-footer">
            {page === "login"
              ? "New to SkillForge? "
              : "Already have an account? "}

            <button
              type="button"
              className="text-button"
              onClick={() =>
                switchAuth(page === "login" ? "register" : "login")
              }
            >
              {page === "login" ? "Create an account" : "Login"}
            </button>
          </p>

          <p className="secure-note">Learn today. Grow tomorrow.</p>
        </section>
      </main>
    );
  }

  const navItems = [
    { name: "Dashboard", icon: "⌂" },
    { name: "My Courses", icon: "▤" },
    { name: "Career Goals", icon: "◎" },
    { name: "My Progress", icon: "↗" },
    { name: "My Profile", icon: "♙" },
  ];

  // Reusable course card
  function renderCourse(course, enrolled = false) {
    const savedCourse = courses.find((item) => item.id === course.id);
    const completed = savedCourse?.completedLessons || [];
    const percentage = enrolled
      ? Math.round((completed.length / course.lessons.length) * 100)
      : 0;

    return (
      <article className="interactive-card" key={course.id}>
        <span className="course-category">{course.category}</span>
        <h3>{course.title}</h3>
        <p>{course.level} · {course.lessons.length} lessons</p>

        {enrolled ? (
          <>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <p>{percentage}% completed</p>

            {course.lessons.map((lesson, index) => (
              <label className="interactive-lesson" key={lesson}>
                <input
                  type="checkbox"
                  checked={completed.includes(index)}
                  onChange={() => toggleLesson(course.id, index)}
                />
                {lesson}
              </label>
            ))}
          </>
        ) : (
          <button
            type="button"
            onClick={() => enrollCourse(course)}
          >
            Enroll in course
          </button>
        )}
      </article>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="brand sidebar-brand">
          <div className="brand-icon">S</div>
          <span>SkillForge</span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={
                activeTab === item.name ? "nav-item selected" : "nav-item"
              }
              onClick={() => {
                setActiveTab(item.name);
                setShowCatalog(false);
                setMessage("");
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-icon">✦</span>
            <strong>Keep growing!</strong>
            <p>Small steps lead to big achievements.</p>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            <span>↪</span> Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="topbar-caption">YOUR LEARNING SPACE</p>
            <h2>{activeTab}</h2>
          </div>

          <div className="user-chip">
            <div className="avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-chip-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {message && (
            <div
              className={`notice page-notice ${
                messageType === "success" ? "notice-success" : "notice-error"
              }`}
              role="status"
            >
              {message}
            </div>
          )}

          {activeTab === "Dashboard" && (
            <>
              <section className="welcome-banner">
                <div className="welcome-copy">
                  <p className="welcome-label">YOUR PERSONAL LEARNING HUB</p>
                  <h1>
                    Welcome back, {user.name.split(" ")[0]}! <span>✦</span>
                  </h1>
                  <p>
                    Build skills, explore your interests, and move closer to
                    your career goals.
                  </p>
                  <button
                    className="welcome-button"
                    onClick={() => setActiveTab("My Profile")}
                  >
                    Choose your interests →
                  </button>
                </div>

                <div className="welcome-art">
                  <div className="art-circle">S</div>
                  <span className="art-star star-one">✦</span>
                  <span className="art-star star-two">✧</span>
                </div>
              </section>

              <div className="section-heading">
                <div>
                  <h3>Your overview</h3>
                  <p>Track your learning journey at a glance.</p>
                </div>
              </div>

              <div className="stats-grid">
                <button
                  className="stat-card clickable-stat"
                  onClick={() => setActiveTab("My Courses")}
                >
                  <div className="stat-icon stat-purple">▤</div>
                  <p>Enrolled Courses</p>
                  <h2>{courses.length}</h2>
                  <span>Open My Courses →</span>
                </button>

                <button
                  className="stat-card clickable-stat"
                  onClick={() => setActiveTab("Career Goals")}
                >
                  <div className="stat-icon stat-green">◎</div>
                  <p>Career Goals</p>
                  <h2>{goals.length}</h2>
                  <span>{completedGoals} completed · View goals →</span>
                </button>

                <button
                  className="stat-card clickable-stat"
                  onClick={() => setActiveTab("My Progress")}
                >
                  <div className="stat-icon stat-orange">↗</div>
                  <p>Learning Progress</p>
                  <h2>{learningProgress}%</h2>
                  <span>View your progress →</span>
                </button>

                <button
                  className="stat-card clickable-stat"
                  onClick={() => setActiveTab("My Progress")}
                >
                  <div className="stat-icon stat-blue">✦</div>
                  <p>Achievements</p>
                  <h2>{achievements.length}</h2>
                  <span>View achievements →</span>
                </button>
              </div>

              <div className="section-heading">
                <div>
                  <h3>Recommended for you</h3>
                  <p>Based on your selected interests.</p>
                </div>
                <button
                  className="small-link"
                  onClick={() => {
                    setActiveTab("My Courses");
                    setShowCatalog(true);
                  }}
                >
                  Browse courses →
                </button>
              </div>

              {recommendedCourses.length ? (
                <div className="interactive-grid">
                  {recommendedCourses.slice(0, 3).map((course) =>
                    renderCourse(course)
                  )}
                </div>
              ) : (
                <div className="content-card interest-prompt">
                  <div className="empty-icon">✦</div>
                  <div>
                    <strong>Personalize your learning</strong>
                    <p>
                      Choose your interests to receive course recommendations.
                    </p>
                  </div>
                  <button
                    className="primary-button compact-button"
                    onClick={() => setActiveTab("My Profile")}
                  >
                    Add interests
                  </button>
                </div>
              )}

              <div className="dashboard-lower-grid">
                <article className="content-card">
                  <div className="card-heading">
                    <div>
                      <h3>My Courses</h3>
                      <p>Your active learning.</p>
                    </div>
                    <button
                      className="small-link"
                      onClick={() => setActiveTab("My Courses")}
                    >
                      View all →
                    </button>
                  </div>

                  {courses.length ? (
                    <div className="mini-list">
                      {courses.slice(0, 3).map((course) => (
                        <div className="mini-row" key={course.id}>
                          <span className="mini-icon">▤</span>
                          <div>
                            <strong>{course.title}</strong>
                            <p>
                              {course.completedLessons.length}/
                              {course.lessons.length} lessons completed
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">▤</div>
                      <strong>No courses yet</strong>
                      <p>Browse the catalog and enroll in a course.</p>
                      <button
                        className="small-link"
                        onClick={() => {
                          setActiveTab("My Courses");
                          setShowCatalog(true);
                        }}
                      >
                        Explore courses →
                      </button>
                    </div>
                  )}
                </article>

                <article className="content-card">
                  <div className="card-heading">
                    <div>
                      <h3>Career Goals</h3>
                      <p>Keep your future in focus.</p>
                    </div>
                    <button
                      className="small-link"
                      onClick={() => setActiveTab("Career Goals")}
                    >
                      View all →
                    </button>
                  </div>

                  {goals.length ? (
                    <div className="mini-list">
                      {goals.slice(0, 3).map((goal) => (
                        <div className="mini-row" key={goal.id}>
                          <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => toggleGoal(goal.id)}
                          />
                          <div>
                            <strong
                              className={
                                goal.completed ? "completed-text" : ""
                              }
                            >
                              {goal.title}
                            </strong>
                            <p>
                              {goal.completed ? "Completed" : "In progress"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon goal-empty">◎</div>
                      <strong>No goals added</strong>
                      <p>Add a career goal to keep yourself motivated.</p>
                      <button
                        className="small-link"
                        onClick={() => setActiveTab("Career Goals")}
                      >
                        Add a goal →
                      </button>
                    </div>
                  )}
                </article>
              </div>

              <div className="dashboard-tip">
                <span>💡</span>
                <div>
                  <strong>Your next step</strong>
                  <p>
                    Choose your interests, enroll in a course, and complete
                    lessons to build your progress.
                  </p>
                </div>
              </div>
            </>
          )}

          {activeTab === "My Courses" && (
            <>
              <div className="page-intro">
                <h1>My Courses</h1>
                <p>Discover courses and track your learning.</p>
              </div>

              <div className="course-toolbar">
                <input
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={(event) => setCourseSearch(event.target.value)}
                  aria-label="Search courses"
                />

                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Filter by category"
                >
                  <option value="All">All categories</option>
                  {INTEREST_OPTIONS.map((interest) => (
                    <option key={interest} value={interest}>
                      {interest}
                    </option>
                  ))}
                </select>

                <button
                  className="primary-button compact-button"
                  onClick={() => setShowCatalog((current) => !current)}
                >
                  {showCatalog ? "Show enrolled" : "Browse catalog"}
                </button>
              </div>

              {showCatalog ? (
                <>
                  <h3 className="subsection-title">Course catalog</h3>
                  <div className="interactive-grid">
                    {filteredCourses.map((course) => {
                      const enrolled = enrolledIds.includes(course.id);
                      return (
                        <article className="interactive-card" key={course.id}>
                          <span className="course-category">
                            {course.category}
                          </span>
                          <h3>{course.title}</h3>
                          <p>{course.level} · {course.lessons.length} lessons</p>
                          {enrolled ? (
                            <button
                              onClick={() => setShowCatalog(false)}
                            >
                              View enrolled courses
                            </button>
                          ) : (
                            <button onClick={() => enrollCourse(course)}>
                              Enroll in course
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                  {!filteredCourses.length && (
                    <p>No courses match your search.</p>
                  )}
                </>
              ) : (
                <>
                  <h3 className="subsection-title">
                    Enrolled courses ({courses.length})
                  </h3>
                  {courses.length ? (
                    <div className="interactive-grid">
                      {courses.map((course) => renderCourse(course, true))}
                    </div>
                  ) : (
                    <div className="content-card empty-page">
                      <div className="empty-icon">▤</div>
                      <h3>You haven't enrolled in a course yet</h3>
                      <p>Browse the catalog to discover your next skill.</p>
                      <button
                        className="primary-button compact-button"
                        onClick={() => setShowCatalog(true)}
                      >
                        Explore courses
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeTab === "Career Goals" && (
            <>
              <div className="page-intro">
                <h1>Career Goals</h1>
                <p>Set meaningful targets and track your achievements.</p>
              </div>

              <form className="goal-form content-card" onSubmit={saveGoal}>
                <h3>{editingGoal ? "Edit career goal" : "Add a career goal"}</h3>
                <label htmlFor="goalTitle">Goal title</label>
                <input
                  id="goalTitle"
                  placeholder="e.g. Become a Machine Learning Engineer"
                  value={newGoal}
                  onChange={(event) => setNewGoal(event.target.value)}
                  maxLength={120}
                  required
                />

                <label htmlFor="goalDate">Target date (optional)</label>
                <input
                  id="goalDate"
                  type="date"
                  value={goalDate}
                  onChange={(event) => setGoalDate(event.target.value)}
                />

                <div className="goal-form-actions">
                  <button className="primary-button compact-button" type="submit">
                    {editingGoal ? "Save changes" : "Add goal"}
                  </button>
                  {editingGoal && (
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => {
                        setEditingGoal(null);
                        setNewGoal("");
                        setGoalDate("");
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="section-heading">
                <div>
                  <h3>Your goals ({goals.length})</h3>
                  <p>Mark a goal when you achieve it.</p>
                </div>
              </div>

              {goals.length ? (
                <div className="goal-list">
                  {goals.map((goal) => (
                    <article className="goal-card" key={goal.id}>
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleGoal(goal.id)}
                        aria-label={`Complete ${goal.title}`}
                      />
                      <div className="goal-details">
                        <strong className={goal.completed ? "completed-text" : ""}>
                          {goal.title}
                        </strong>
                        <span>
                          {goal.targetDate
                            ? `Target date: ${goal.targetDate}`
                            : "No target date set"}
                        </span>
                        <span>
                          {goal.completed ? "✓ Completed" : "In progress"}
                        </span>
                      </div>
                      <div className="goal-actions">
                        <button
                          className="secondary-button"
                          onClick={() => editGoal(goal)}
                        >
                          Edit
                        </button>
                        <button
                          className="danger-button"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="content-card empty-page">
                  <div className="empty-icon goal-empty">◎</div>
                  <h3>No career goals yet</h3>
                  <p>Add your first goal using the form above.</p>
                </div>
              )}
            </>
          )}

          {activeTab === "My Progress" && (
            <>
              <div className="page-intro">
                <h1>My Progress</h1>
                <p>Your statistics update as you complete lessons and goals.</p>
              </div>

              <div className="progress-summary-grid">
                <article className="stat-card">
                  <div className="stat-icon stat-purple">▤</div>
                  <p>Lessons completed</p>
                  <h2>{completedLessons}</h2>
                  <span>Out of {totalLessons} lessons</span>
                </article>

                <article className="stat-card">
                  <div className="stat-icon stat-green">◎</div>
                  <p>Goals achieved</p>
                  <h2>{completedGoals}</h2>
                  <span>Out of {goals.length} goals</span>
                </article>

                <article className="stat-card">
                  <div className="stat-icon stat-blue">✦</div>
                  <p>Achievements</p>
                  <h2>{achievements.length}</h2>
                  <span>Milestones unlocked</span>
                </article>
              </div>

              <div className="content-card overall-progress">
                <h3>Overall course progress</h3>
                <div className="progress-big">{learningProgress}%</div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${learningProgress}%` }}
                  />
                </div>
                <p>
                  {completedLessons} of {totalLessons} lessons completed.
                </p>
              </div>

              <div className="content-card achievement-panel">
                <h3>Achievements</h3>
                {achievements.length ? (
                  achievements.map((achievement) => (
                    <div className="achievement-row" key={achievement}>
                      <span>🏆</span>
                      <div>
                        <strong>{achievement}</strong>
                        <p>Keep up the great work!</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="muted-text">
                    Complete a lesson or career goal to unlock your first
                    achievement.
                  </p>
                )}
              </div>
            </>
          )}

          {activeTab === "My Profile" && (
            <>
              <div className="page-intro">
                <h1>My Profile</h1>
                <p>Update your account and personalize your learning journey.</p>
              </div>

              <form className="content-card profile-edit-form" onSubmit={saveProfile}>
                <div className="profile-header">
                  <div className="profile-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                  </div>
                </div>

                <label htmlFor="profileName">Full name</label>
                <input
                  id="profileName"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                  maxLength={100}
                  required
                />

                <label htmlFor="profileEmail">Email address</label>
                <input id="profileEmail" value={user.email} readOnly />

                <button
                  className="primary-button compact-button"
                  type="submit"
                >
                  Save profile
                </button>
              </form>

              <section className="content-card interests-panel">
                <div className="card-heading">
                  <div>
                    <h3>Your learning interests</h3>
                    <p>
                      Select topics to receive personalized recommendations.
                    </p>
                  </div>
                </div>

                <div className="interest-grid">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      className={
                        interests.includes(interest)
                          ? "interest-chip chosen"
                          : "interest-chip"
                      }
                      onClick={() => toggleInterest(interest)}
                    >
                      <span>
                        {interests.includes(interest) ? "✓" : "+"}
                      </span>
                      {interest}
                    </button>
                  ))}
                </div>

                <p className="muted-text">
                  {interests.length} interest(s) selected.
                </p>

                <button
                  className="primary-button compact-button"
                  onClick={() => {
                    setActiveTab("Dashboard");
                    setMessage("");
                  }}
                >
                  Save interests & view recommendations
                </button>
              </section>

              <div className="content-card account-info">
                <h3>Account</h3>
                <p>
                  Signed in as <strong>{user.email}</strong>
                </p>
                <button className="danger-button" onClick={logout}>
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        <footer className="dashboard-footer">
          <span>© {new Date().getFullYear()} SkillForge</span>
          <span>Learn today. Grow tomorrow.</span>
        </footer>
      </main>
    </div>
  );
}
