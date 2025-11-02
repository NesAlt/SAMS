import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { CheckCircle } from "lucide-react";
import "./TeacherAttendance.css";

const MarkAttendance = () => {
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [category, setCategory] = useState("regular_class");
  const [attendanceData, setAttendanceData] = useState({});
  const [copyToNext, setCopyToNext] = useState(false);
  const [copiedAttendance, setCopiedAttendance] = useState(null);
  const [nextTimetableId, setNextTimetableId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const res = await axiosInstance.get("/teacherUser/my_timetable");
        const uniqueSems = [...new Set(res.data.map((t) => t.semester))];
        setSemesters(uniqueSems);
      } catch (err) {
        console.error("Error fetching semesters:", err);
      }
    };
    fetchSemesters();
  }, []);

  useEffect(() => {
    if (!selectedSemester) return;
    const fetchUpcoming = async () => {
      try {
        const res = await axiosInstance.get(
          `/teacherUser/upcoming/${selectedSemester}`
        );
        setUpcomingClasses(res.data);
      } catch (err) {
        console.error("Error fetching upcoming classes:", err);
      }
    };
    fetchUpcoming();
  }, [selectedSemester]);

  const handleSelectClass = async (classData) => {
    try {
      const statusRes = await axiosInstance.get(
        `/teacherUser/attendance/status/${classData._id}`
      );
      const alreadyMarked = statusRes.data.marked;

      const res = await axiosInstance.get(
        `/teacherUser/class/${classData.class}/students?timetableId=${classData._id}`
      );

      let initialAttendance = {};
      if (copiedAttendance && copiedAttendance.nextTimetableId === classData._id) {
        initialAttendance = { ...copiedAttendance.data };
      } else {
        res.data.students.forEach((s) => {
          initialAttendance[s._id] = s.existingStatus || "absent";
        });
      }

      setStudents(res.data.students || []);
      setAttendanceData(initialAttendance);
      setSelectedClass({ ...classData, alreadyMarked });

      if (copiedAttendance && copiedAttendance.nextTimetableId === classData._id) {
        setCopiedAttendance(null);
      }
      
      const currentIndex = upcomingClasses.findIndex(
        (c) => c._id === classData._id
      );
      setNextTimetableId(
        currentIndex !== -1 ? upcomingClasses[currentIndex + 1]?._id : null
      );
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const toggleAttendance = (id) => {
    if (selectedClass?.alreadyMarked) return;
    setAttendanceData((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const markAll = (status) => {
    if (selectedClass?.alreadyMarked) return;
    const updated = {};
    students.forEach((s) => (updated[s._id] = status));
    setAttendanceData(updated);
  };

  const handleSubmit = async () => {
    if (!selectedClass || selectedClass.alreadyMarked) {
      alert("Attendance already marked for this class!");
      return;
    }

    setLoading(true);
    try {
      const studentsPayload = students.map((s) => ({
        studentId: s._id,
        status: attendanceData[s._id] || "absent",
      }));

      const payload = {
        timetable: selectedClass._id,
        date: new Date(),
        students: studentsPayload,
        category,
      };

      if (copyToNext && nextTimetableId) {
        setCopiedAttendance({
          nextTimetableId,
          data: { ...attendanceData },
        });      
      }

      await axiosInstance.post("/teacherUser/attendance/bulk", payload);
      alert("Attendance marked successfully!");

      setSelectedClass({ ...selectedClass, alreadyMarked: true });

      setUpcomingClasses((prev) =>
        prev.map((cls) =>
          cls._id === selectedClass._id ? { ...cls, isMarked: true } : cls
        )
      );
    } catch (err) {
      console.error("Error submitting attendance:", err);
      alert("Failed to mark attendance!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mark-attendance-container">
      <h2>Mark Attendance</h2>

      <div className="semester-select">
        <label>Select Semester:</label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
        >
          <option value="">-- Choose Semester --</option>
          {semesters.map((s, i) => (
            <option key={i} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {selectedSemester && (
        <div className="upcoming-classes">
          <h3>Upcoming Classes</h3>
          <div className="class-grid">
            {upcomingClasses.map((cls) => (
              <div
                key={cls._id}
                className={`class-card ${
                  cls.isMarked ? "marked" : ""
                } ${selectedClass?._id === cls._id ? "active" : ""}`}
                onClick={() => handleSelectClass(cls)}
              >
                <h4>{cls.class}</h4>
                <p>{cls.subject}</p>
                <p>
                  {cls.dayOfWeek} ({cls.startTime} - {cls.endTime})
                </p>
                <p className="class-date">
                  {new Date(cls.date).toLocaleDateString()}
                </p>

                {cls.isMarked && (
                  <div className="marked-indicator">
                    <CheckCircle size={20} color="green" />
                    <span>Attendance Marked</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedClass && (
        <div className="attendance-section">
          <h3>
            {selectedClass.class} - {selectedClass.subject}
          </h3>

          <div className="control-buttons">
            <button
              className="btn btn-present"
              onClick={() => markAll("present")}
              disabled={selectedClass.alreadyMarked}
            >
              Mark All Present
            </button>
            <button
              className="btn btn-absent"
              onClick={() => markAll("absent")}
              disabled={selectedClass.alreadyMarked}
            >
              Mark All Absent
            </button>

            <label className="copy-control">
              <input
                type="checkbox"
                checked={copyToNext}
                onChange={() => setCopyToNext(!copyToNext)}
                disabled={selectedClass.alreadyMarked}
              />
              Copy to Next Hour
            </label>

            <select
              className="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={selectedClass.alreadyMarked}
            >
              <option value="regular_class">Regular Class</option>
              <option value="revision">Revision</option>
              <option value="extra">Extra</option>
            </select>
          </div>

          <div className="student-grid">
            {students.map((student) => (
              <div
                key={student._id}
                className={`student-card ${
                  attendanceData[student._id] === "present" ? "present" : "absent"
                }`}
                onClick={() =>
                  !selectedClass.alreadyMarked && toggleAttendance(student._id)
                }
              >
                <span className="name">{student.name}</span>
                <span className="status">
                  {selectedClass.alreadyMarked ? (
                    attendanceData[student._id] === "present" ? "✅ Present" : "❌ Absent"
                  ) : (
                    attendanceData[student._id]
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="submit-area">
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading || selectedClass.alreadyMarked}
            >
              {selectedClass.alreadyMarked
                ? "Already Marked ✅"
                : loading
                ? "Submitting..."
                : "Submit Attendance"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;