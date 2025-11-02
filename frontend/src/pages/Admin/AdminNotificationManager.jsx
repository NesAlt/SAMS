import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import "./AdminNotifications.css";

const AdminNotifications = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [to, setTo] = useState("");
  const [specificUser, setSpecificUser] = useState("");
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get("/adminUser/get-all-users");
        setUsers(data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get("/notifications");
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const sendNotification = async () => {
    if (!message.trim()) return alert("Message cannot be empty.");
    if (!type) return alert("Select a notification type.");
    if (!to) return alert("Select a recipient type.");

    const payload = {
      to,
      type,
      message,
    };

    if (to === "specific") {
      if (!specificUser) return alert("Select a specific user.");
      payload.toSpecific = specificUser;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/notifications", payload);
      alert(data.message);
      setMessage("");
      setTo("");
      setType("");
      setSpecificUser("");
      fetchNotifications();
    } catch (err) {
      console.error("Error sending notification:", err);
      alert("Failed to send notification.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-notifications">
      <h2>Admin Notifications</h2>

      <div className="notification-form">
        <h3>Send a Notification</h3>

        <select value={to} onChange={(e) => setTo(e.target.value)}>
          <option value="">-- Select Recipient --</option>
          <option value="all">All Users</option>
          <option value="teachers">All Teachers</option>
          <option value="students">All Students</option>
          <option value="specific">Specific User</option>
        </select>

        {to === "specific" && (
          <select
            value={specificUser}
            onChange={(e) => setSpecificUser(e.target.value)}
          >
            <option value="">-- Select User --</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        )}

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">-- Select Type --</option>
          <option value="announcement">Announcement</option>
          <option value="reminder">Reminder</option>
          <option value="warning">Warning</option>
          <option value="leave">Leave Notice</option>
        </select>

        <textarea
          placeholder="Enter notification message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={sendNotification} disabled={loading}>
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </div>

      <div className="notification-list">
        <h3>Sent Notifications</h3>

        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Message</th>
                <th>Type</th>
                <th>To</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n._id}>
                  <td>{n.message}</td>
                  <td>{n.type}</td>
                  <td>
                    {n.to === "specific"
                      ? `${n.toSpecific?.name || "User"}`
                      : n.to.toUpperCase()}
                  </td>
                  <td>{new Date(n.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
