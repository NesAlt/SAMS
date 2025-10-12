import axios from "../../utils/axiosInstance"
import { useEffect, useState } from "react";
import "./TeacherViewClass.css";

const TeacherClass = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

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

    const fetchStudents = async (className) => {
      try {
        const { data } = await axios.get(`/teacherUser/class/${className}/students`);
        setStudents(data);
        setSelectedClass(className);
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

  return (
    <div className="teacher-class">
      <h2>Your Assigned Classes</h2>

      <div className="assignment-list">
        {assignments.map((a) => (
          <div key={a._id} className="assignment-card" onClick={() => fetchStudents(a.class)}>
            <h4>{a.class}</h4>
            <p>{a.subject} — Semester {a.semester}</p>
          </div>
        ))}
      </div>

      {selectedClass && (
        <div className="student-list">
          <h3>Students in {selectedClass}</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td>{s.attendancePercentage || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeacherClass;