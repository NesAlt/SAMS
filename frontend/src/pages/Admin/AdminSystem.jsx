import axios from "../../utils/axiosInstance";
import { useState, useEffect } from "react";
import WorkingDaysModal from "../../components/WorkingDaysModal.jsx";
// import "./AdminSystem.css";

const AdminWorkingDaysManager = () => {
  const [workingDaysList, setWorkingDaysList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWorkingDays = async () => {
      try {
        const { data } = await axios.get("/adminUser/fetch_working_days");
        if (!isMounted) return;
        setWorkingDaysList(data);
      } catch (err) {
        console.error("Error fetching working days:", err);
      }
    };

    fetchWorkingDays();
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
          `/adminUser/update_working_days/${selectedRecord.semester}`,
          formData
        );
        updatedRecord = res.data.data || res.data;
      } else {
        const { data } = await axios.post("/adminUser/working_days", formData);
        updatedRecord = data.data || data;
      }

      setWorkingDaysList((prev) =>
        mode === "edit"
          ? prev.map((r) =>
              r._id === selectedRecord._id ? updatedRecord : r
            )
          : [...prev, updatedRecord]
      );

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving working days:", err);
      alert("Failed to save working days record.");
    }
  };

  return (
    <div className="admin-workingdays-manager">
      <h2>Working Days Manager</h2>

      <div className="button-group">
        <button onClick={openAddModal}>Set Working Days</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Semester</th>
            <th>Total Working Days</th>
            <th>Created By</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workingDaysList.map((record) => (
            <tr key={record._id}>
              <td>{record.semester}</td>
              <td>{record.totalWorkingDays}</td>
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

export default AdminWorkingDaysManager;
