import { useAuth } from "../context/UseAuth";
import PropTypes from "prop-types";
import { useState } from "react";
import "./DashboardLayout.css";

const DashboardLayout = ({ menuItems, children, onMenuClick }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <div className="dashboard-container">
      {sidebarOpen && (
        <aside className="sidebar">
          <h2>Menu</h2>
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}
              onClick={()=>onMenuClick && onMenuClick(item)}
              style={{cursor:"pointer"}}
              >
                {item}</li>
            ))}
          </ul>
        </aside>
      )}

      <div className="main-content">
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

        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

DashboardLayout.propTypes = {
  menuItems: PropTypes.arrayOf(PropTypes.string).isRequired,
  children: PropTypes.node.isRequired,
  onMenuClick:PropTypes.func,
};

export default DashboardLayout;
