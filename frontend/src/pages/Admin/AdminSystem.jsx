import axios from "../../utils/axiosInstance";
import { useState, useEffect } from "react";
import WorkingDaysModal from "../../components/WorkingDaysModal.jsx";

const AdminSessionManager = () => {
  const [sessionList, setSessionList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSessions = async () => {
      try {
        const { data } = await axios.get("/adminUser/fetch_total_sessions");
        if (!isMounted) return;
        setSessionList(data);
      } catch (err) {
        console.error("Error fetching total sessions:", err);
      }
    };

    fetchSessions();
    return () => {
      isMounted = false;
    };
  }, []);

  const openAddModal = () => {
    setSelectedRecord(null);
    setMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (record) => {
    setSelectedRecord(record);
    setMode("edit");
    setIsModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    try {
      let updatedRecord;

      if (mode === "edit") {
        const res = await axios.put(
          `/adminUser/update_total_sessions/${selectedRecord.semester}`,
          formData
        );
        updatedRecord = res.data.data || res.data;
      } else {
        const { data } = await axios.post("/adminUser/total_sessions", formData);
        updatedRecord = data.data || data;
      }

      setSessionList((prev) =>
        mode === "edit"
          ? prev.map((r) =>
              r._id === selectedRecord._id ? updatedRecord : r
            )
          : [...prev, updatedRecord]
      );

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving total sessions:", err);
      alert("Failed to save record.");
    }
  };

  return (
    <div className="admin-session-manager">
      <h2>Semester Session Manager</h2>

      <div className="button-group">
        <button onClick={openAddModal}>Set Total Sessions</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Semester</th>
            <th>Total Sessions</th>
            <th>Created By</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessionList.map((record) => (
            <tr key={record._id}>
              <td>{record.semester}</td>
              <td>{record.totalSessions}</td>
              <td>{record.createdBy?.name || "—"}</td>
              <td>{new Date(record.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => openEditModal(record)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <WorkingDaysModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={mode}
        initialData={selectedRecord}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AdminSessionManager;
