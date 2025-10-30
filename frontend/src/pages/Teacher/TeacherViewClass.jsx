import axios from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./TeacherViewClass.css";

const TeacherClass = () => {  
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [semester, setSemester] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await axios.get("/teacherUser/my_assignments");
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
      setStudents(data.students || []);
      setSelectedClass(data.className);
      if (data.students?.length > 0 && data.students[0].semester) {
        setSemester(data.students[0].semester);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

const downloadPDF = () => {
  if (!selectedClass || students.length === 0) {
    alert("No data available to generate PDF.");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Class Attendance Report", 14, 20);
  doc.setFontSize(12);
  doc.text(`Class: ${selectedClass}`, 14, 30);
  if (semester) doc.text(`Semester: ${semester}`, 14, 37);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 44);

  const tableColumn = ["Name", "Email", "Attendance %"];

  const tableRows = students.map(({ name, email, attendancePercentage }) => [
    name || "—",
    email || "—",
    attendancePercentage ?? "—",
  ]);

  autoTable(doc, {
    startY: 50,
    head: [tableColumn],
    body: tableRows,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save(`${selectedClass}_Attendance_Report.pdf`);
};

  return (
    <div className="teacher-class">
      <h2>Your Assigned Classes</h2>

      <div className="assignment-list">
        {assignments.map((a) => (
          <div
            key={a._id}
            className="assignment-card"
            onClick={() => fetchStudents(a.class)}
          >
            <h4>{a.class}</h4>
            <p>
              {a.subject} — Semester {a.semester}
            </p>
          </div>
        ))}
      </div>

      {selectedClass && (
        <div className="student-list">
          <div className="student-list-header">
            <h3>Students in {selectedClass}</h3>
            <button className="download-btn" onClick={downloadPDF}>
              📄 Download Report
            </button>
          </div>

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