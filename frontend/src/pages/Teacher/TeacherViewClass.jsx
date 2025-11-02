import axios from "../../utils/axiosInstance";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./TeacherViewClass.css";

const TeacherClass = () => {
  const [timetables, setTimetables] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [filteredTimetables, setFilteredTimetables] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceFilter, setAttendanceFilter] = useState("semester");

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const { data } = await axios.get("/teacherUser/my_timetable");
        setTimetables(data);
      } catch (err) {
        console.error("Error fetching teacher timetable:", err);
      }
    };
    fetchTimetables();
  }, []);

  const semesters = [...new Set(timetables.map((t) => t.semester))];

  useEffect(() => {
    if (selectedSemester) {
      setFilteredTimetables(
        timetables.filter((t) => t.semester === selectedSemester)
      );
    } else {
      setFilteredTimetables([]);
    }
  }, [selectedSemester, timetables]);

  const fetchStudents = async (className,timetableId) => {
    try {
      const { data } = await axios.get(
        `/teacherUser/class/${className}/students?timetableId=${timetableId}filter=${attendanceFilter}`
      );
      setStudents(data.students || []);
      setSelectedClass(className);
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
    doc.text(`Semester: ${selectedSemester}`, 14, 37);
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
      <h2>View Your Classes</h2>

      <div className="dropdown-container">
        <label>Select Semester: </label>
        <select
          value={selectedSemester}
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            setSelectedClass(null);
            setStudents([]);
          }}
        >
          <option value="">-- Select Semester --</option>
          {semesters.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>
      </div>

      {selectedSemester && filteredTimetables.length > 0 ? (
        <div className="assignment-list">
        {[...new Map(
          filteredTimetables.map((t) => [`${t.class}-${t.subject}`, t])
        ).values()].map((t) => (
          <div
            key={`${t.class}-${t.subject}`}
            className="assignment-card"
            onClick={() => fetchStudents(t.class,t._id)}
          >
            <h4>{t.class}</h4>
            <p>{t.subject}</p>
          </div>
        ))}
        </div>
      ) : (
        selectedSemester && <p>No classes found for this semester.</p>
      )}

      {selectedClass && (
        <div className="student-list">
          <div className="student-list-header">
            <h3>Students in {selectedClass}</h3>

            <div className="filter-section">
              <label>Filter by: </label>
              <select
                value={attendanceFilter}
                  onChange={(e) => {
                    setAttendanceFilter(e.target.value);
                    if (selectedClass) {
                      const selectedTimetable = filteredTimetables.find(
                        (t) => t.class === selectedClass
                      );
                      if (selectedTimetable) {
                        fetchStudents(selectedClass, selectedTimetable._id);
                      }
                    }
                  }}  
              >
                <option value="semester">Semester</option>
                <option value="month">Month</option>
              </select>
              <button className="download-btn" onClick={downloadPDF}>
                Download Report
              </button>
            </div>
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
