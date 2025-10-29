import axios from "../../utils/axiosInstance";
import { useState, useEffect } from "react";
import LeaveModal from "../../components/StudentLeaveModal.jsx";
import "./StudentLeave.css";

const StudentLeaveManager = () => {
  const [leaves, setLeaves] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add");
  const [selectedLeave, setSelectedLeave] = useState(null);

  const fetchLeaves = async () => {
    try {
      const { data } = await axios.get("/studentUser/Leaves");

      const formatted = data.map((leave) => ({
        ...leave,
        fromDate: leave.fromDate
          ? new Date(leave.fromDate).toISOString().split("T")[0]
          : "",
        toDate: leave.toDate
          ? new Date(leave.toDate).toISOString().split("T")[0]
          : "",
        appliedAt: leave.appliedAt
          ? new Date(leave.appliedAt).toLocaleDateString()
          : "",
      }));

      setLeaves(formatted);
    } catch (err) {
      console.error("Error fetching leaves:", err);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const openAddModal = () => {
    setSelectedLeave(null);
    setMode("add");
    setIsModalOpen(true);
  };

  const deleteLeave = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return;
    try {
      await axios.delete(`/studentUser/cancel_leave/${id}`);
      await fetchLeaves();
    } catch (err) {
      console.error("Failed to delete leave:", err);
      alert("Failed to cancel leave. Try again.");
    }
  };

  return (
    <div className="student-leave-manager">
      <h2>Leave Manager</h2>

      <div className="button-group">
        <button onClick={openAddModal}>Apply for Leave</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Applied At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No leave applications yet.
              </td>
            </tr>
          ) : (
            leaves.map((l) => (
              <tr key={l._id}>
                <td>{l.fromDate ? new Date(l.fromDate).toLocaleDateString() : "-"}</td>
                <td>{l.toDate ? new Date(l.toDate).toLocaleDateString() : "-"}</td>
                <td>{l.reason}</td>
                <td className={`capitalize ${l.status}`}>{l.status}</td>
                <td>{l.appliedAt ? l.appliedAt : "-"}</td>
                <td>
                  {l.status === "pending" && (
                    <button className="btn_del" onClick={() => deleteLeave(l._id)}>
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <LeaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={mode}
        initialData={selectedLeave}
        onSubmit={async (formData) => {
          try {
            await axios.post("/studentUser/send_leave", formData);

            await fetchLeaves();
            setIsModalOpen(false);
          } catch (err) {
            console.error("Error applying leave:", err);
            alert("Failed to apply leave.");
          }
        }}
      />
    </div>
  );
};

export default StudentLeaveManager;
