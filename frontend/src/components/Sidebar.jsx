import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { path: "/dashboard", icon: "🏠", label: "Dashboard" },
    { path: "/medical-records", icon: "📄", label: "Medical Records" },
    { path: "/timeline", icon: "📅", label: "Health Timeline" },
    { path: "/medications", icon: "💊", label: "Medications" },
    { path: "/appointments", icon: "🗓️", label: "Appointments" },
    { path: "/health-dashboard", icon: "📊", label: "Health Dashboard" },
    { path: "/secure-sharing", icon: "🔐", label: "Secure Sharing" },
    { path: "/assistant", icon: "🤖", label: "AI Assistant" },
    { path: "/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <aside className="sidebar glass-card">

      <div className="sidebar-logo">
        <div className="logo-icon">🩺</div>

        <div>
          <h2>MediTwin</h2>
          <span>Your Health, Your Priority</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Sidebar Options */}
      <div className="sidebar-bottom">

        <div
          className="sidebar-link"
          onClick={() => navigate("/settings")}
          style={{ cursor: "pointer" }}
        >
          <span className="sidebar-icon">⚙️</span>
          <span>Settings</span>
        </div>

        <div
          className="sidebar-link"
          onClick={() => {
            const confirmLogout = window.confirm(
              "Are you sure you want to logout?"
            );

            if (confirmLogout) {
              navigate("/");
            }
          }}
          style={{ cursor: "pointer" }}>
          <span className="sidebar-icon">↪️</span>
          <span>Logout</span>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;