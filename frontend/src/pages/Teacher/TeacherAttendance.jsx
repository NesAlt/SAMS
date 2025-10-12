import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import './TeacherAttendance.css';

const TeacherAttendance = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await axios.get("/teacherUser/my-assignments");
        setAssignments(data);
      } catch (err) {
        console.error("Error fetching teacher assignments:", err);
      }
    };
    fetchAssignments();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedAssignment) return;

      try {
        const { data } = await axios.get(
          `/teacherUser/class/${selectedAssignment.class}/students`
        );
        setStudents(data);

        const initialAttendance = {};
        data.forEach((s) => {
          initialAttendance[s._id] = "present";
        });
        setAttendance(initialAttendance);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };
    fetchStudents();
  }, [selectedAssignment]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    if (!selectedAssignment) return;

    try {
      const payloads = students.map((s) => ({
        studentId: s._id,
        teacherAssignment: selectedAssignment._id,
        date,
        status: attendance[s._id],
        reason: "",
      }));

      await Promise.all(
        payloads.map((p) =>
          axios.post("/teacherUser/attendance", p)
        )
      );

      alert("Attendance marked successfully!");
    } catch (err) {
      console.error("Error marking attendance:", err);
      alert("Failed to mark attendance.");
    }
  };

return (
  <div className="teacher-attendance">
    <h2>Mark Attendance</h2>

    {/* Assignment selector */}
    <div className="form-group">
      <label>Choose Assignment:</label>
      <select
        value={selectedAssignment?._id || ""}
        onChange={(e) => {
          const assignment = assignments.find((a) => a._id === e.target.value);
          setSelectedAssignment(assignment);
        }}
      >
        <option value="">-- Select --</option>
        {assignments.map((a) => (
          <option key={a._id} value={a._id}>
            {a.title} ({a.class})
          </option>
        ))}
      </select>
    </div>

    {/* Date selector */}
    <div className="form-group">
      <label>Date:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </div>

    {/* Students list */}
    {students.length > 0 && (
      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>
                <select
                  value={attendance[s._id]}
                  onChange={(e) =>
                    handleAttendanceChange(s._id, e.target.value)
                  }
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="on_leave">On Leave</option>
                  <option value="duty_leave">Duty Leave</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}

    {/* Submit button */}
    {students.length > 0 && (
      <button className="submit-btn" onClick={submitAttendance}>
        Submit Attendance
      </button>
    )}
  </div>
);
};

export default TeacherAttendance;