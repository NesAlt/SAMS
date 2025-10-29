import axios from "../../utils/axiosInstance";
import { useState, useEffect } from "react";
import "./TeacherLeave.css";

const TeacherLeaveManager = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchLeaves = async () => {
      try {
        const { data } = await axios.get("/teacherUser/leaves");
        if (!isMounted) return;

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
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaves();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateLeaveStatus = async (id, status) => {
    try {
      console.log("Sending:", { id, status });
      const { data: updatedLeave } = await axios.put(`/teacherUser/leaves_status/${id}`, { status });

      const formattedLeave = {
        ...updatedLeave,
        fromDate: updatedLeave.fromDate
          ? new Date(updatedLeave.fromDate).toISOString().split("T")[0]
          : "",
        toDate: updatedLeave.toDate
          ? new Date(updatedLeave.toDate).toISOString().split("T")[0]
          : "",
        appliedAt: updatedLeave.appliedAt
          ? new Date(updatedLeave.appliedAt).toLocaleDateString()
          : "",
      };

      setLeaves((prev) =>
        prev.map((l) => (l._id === id ? formattedLeave : l))
      );
    } catch (err) {
      console.error("Error updating leave status:", err.response?.data || err.message);
      alert("Failed to update leave status.");
    }
  };

  if (loading) return <p>Loading leave data...</p>;

  return (
    <div className="teacher-leave-manager">
      <h2>Class Leave Requests</h2>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Class</th>
            <th>From</th>
            <th>To</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Applied At</th>
            <th>Reviewed By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No leave applications found.
              </td>
            </tr>
          ) : (
            leaves.map((l) => (
              <tr key={l._id}>
                <td>{l.studentId?.name || "—"}</td>
                <td>{l.studentId?.class || "—"}</td>
                <td>{l.fromDate ? new Date(l.fromDate).toLocaleDateString() : "-"}</td>
                <td>{l.toDate ? new Date(l.toDate).toLocaleDateString() : "-"}</td>
                <td>{l.reason}</td>
                <td className={`capitalize ${l.status}`}>{l.status}</td>
                <td>{l.appliedAt || "-"}</td>
                <td>{l.reviewedBy?.name || "—"}</td>
                <td>
                  {l.status === "pending" ? (
                    <div className="action-buttons">
                      <button
                        onClick={() => updateLeaveStatus(l._id, "approved")}
                        className="btn-approve"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(l._id, "denied")}
                        className="btn-reject"
                      >
                        Reject
                      </button>
                          {l.isEventLeave && (
                            <button
                              onClick={() => updateLeaveStatus(l._id, "duty_leave")}
                              className="btn-duty"
                            >
                              Duty Leave
                            </button>
                          )}
                    </div>
                  ) : (
                    <span>—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeacherLeaveManager;
