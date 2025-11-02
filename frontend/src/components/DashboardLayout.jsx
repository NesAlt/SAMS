import { useAuth } from "../context/UseAuth";
import PropTypes from "prop-types";
import { useState,useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./DashboardLayout.css";

const DashboardLayout = ({ menuItems, children, onMenuClick }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axiosInstance.get("/notifications");
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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
            <div className="dropdown-container">
              <button onClick={() => setNotifOpen(!notifOpen)}>🔔</button>
              {notifOpen && (
                <div className="dropdown-content notifications-dropdown">
                  {loading ? (
                    <p>Loading...</p>
                  ) : notifications.length === 0 ? (
                    <p>No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`notification-item ${n.readStatus ? "read" : "unread"}`}
                      >
                        <p><strong>{n.type.toUpperCase()}</strong></p>
                        <p>{n.message}</p>
                        <small>{new Date(n.createdAt).toLocaleString()}</small>
                      </div>
                    ))
                  )}
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
