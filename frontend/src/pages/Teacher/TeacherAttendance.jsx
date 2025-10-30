import axios from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import "./TeacherAttendance.css";

const MarkAttendance = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await axios.get("/teacherUser/my_assignments");
        setAssignments(data);
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    };
    fetchAssignments();
  }, []);

  const fetchStudents = async (className) => {
    try {
      const { data } = await axios.get(
        `/teacherUser/class/${className}/students?date=${date}`
      );
      setStudents(data.students || []);
      setSelectedClass(className);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const toggleStatus = (id) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === id && !s.onLeave
          ? { ...s, status: s.status === "present" ? "absent" : "present" }
          : s
      )
    );
  };

  const handleSubmit = async () => {
    if (!selectedClass || students.length === 0) return;

    setIsSubmitting(true);
    const selectedAssignment = assignments.find((a) => a.class === selectedClass);

    const payload = {
      teacherAssignment: selectedAssignment?._id,
      date,
      students: students.map((s) => ({
        studentId: s._id,
        status: s.onLeave ? "present" : s.status || "absent",
      })),
    };

    try {
      await axios.post("/teacherUser/attendance/bulk", payload);
      alert("Attendance successfully submitted!");
    } catch (err) {
      console.error("Error submitting attendance:", err);
      alert("Failed to submit attendance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mark-attendance">
      <h2>Mark Attendance</h2>

      <div className="assignment-list">
        {assignments.map((a) => (
          <div
            key={a._id}
            className={`assignment-card ${
              selectedClass === a.class ? "selected" : ""
            }`}
            onClick={() => fetchStudents(a.class)}
          >
            <h4>{a.class}</h4>
            <p>{a.subject} — Semester {a.semester}</p>
          </div>
        ))}
      </div>

      {selectedClass && (
        <div className="attendance-section">

          <div className="attendance-header">
            <h3>Class: {selectedClass}</h3>
            <label>
              Date:
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <div className="student-grid">
            {students.map((s) => (
              <div
                key={s._id}
                className={`student-card ${
                  s.onLeave ? "on-leave" : s.status === "present" ? "present" : "absent"
                }`}
                onClick={() => !s.onLeave && toggleStatus(s._id)}
              >
                <div className="student-name">{s.name}</div>
                <div className="status-indicator">
                  {s.onLeave ? " Leave" : s.status === "present" ? " Present" : " Absent"}
                </div>
              </div>
            ))}
          </div>

          <button
            className="submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Attendance"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;