import { useAuth } from "../context/UseAuth";
import PropTypes from "prop-types";
import { useState } from "react";
import "./DashboardLayout.css";

const DashboardLayout = ({ menuItems, children }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="sidebar">
          <h2>Menu</h2>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </aside>
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          </div>

          <div className="header-actions">
            {/* Notifications */}
            <div className="dropdown-container">
              <button onClick={() => setNotifOpen(!notifOpen)}>🔔</button>
              {notifOpen && (
                <div className="dropdown-content">
                  <p>No notifications</p>
                  {/* Replace with dynamic notifications later */}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div className="dropdown-container">
              <button onClick={() => setUserDropdownOpen(!userDropdownOpen)}>
                {user?.name} ({user?.role})
              </button>
              {userDropdownOpen && (
                <div className="dropdown-content">
                  <button onClick={logout} style={{ width: "100%" }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  menuItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
