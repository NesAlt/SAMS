import { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import "./StudentAttendance.css";

const StudentAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all subjects for the student
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const { data } = await axios.get("/studentUser/subjects");
        setSubjects(data);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch attendance data for the selected subject
  useEffect(() => {
    if (!selectedSubject) return;

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/studentUser/attendance?subject=${selectedSubject}`);
        setAttendance(data);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedSubject]);

  if (!subjects.length) return <p>Loading subjects...</p>;

  return (
    <div className="student-attendance">
      <h2>View Attendance by Subject</h2>

      <div className="subject-select">
        <label>Select Subject: </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">-- Choose Subject --</option>
          {subjects.map((subj, i) => (
            <option key={i} value={subj.subject}>
              {subj.subject} ({subj.class})
            </option>
          ))}
        </select>
      </div>

      {!selectedSubject ? (
        <p>Please select a subject to view attendance.</p>
      ) : loading ? (
        <p>Loading attendance data...</p>
      ) : !attendance ? (
        <p>No attendance data available.</p>
      ) : (
        <>
          <h2>Your Attendance Overview</h2>

          <div className="attendance-summary">
            <div className="card">
              <h4>Overall Attendance</h4>
              <p>{attendance.overallPercentage}%</p>
            </div>

            <div className="card">
              <h4>Required Minimum</h4>
              <p>{attendance.requiredPercentage}%</p>
            </div>

            <div
              className={`card ${
                attendance.status === "Above Required" ? "good" : "bad"
              }`}
            >
              <h4>Status</h4>
              <p>{attendance.status}</p>
            </div>
          </div>

          <h3>Daily Attendance</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.daily.map((d, index) => (
                <tr key={index}>
                  <td>{new Date(d.date).toLocaleDateString()}</td>
                  <td>{d.class}</td>
                  <td className={d.status === "present" ? "present" : "absent"}>
                    {d.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Monthly Attendance</h3>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Year</th>
                <th>Present</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {attendance.monthly.map((m, index) => (
                <tr key={index}>
                  <td>{m.month}</td>
                  <td>{m.year}</td>
                  <td>{m.present}</td>
                  <td>{m.totalClasses}</td>
                  <td>{m.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Semester Attendance</h3>
          <table>
            <thead>
              <tr>
                <th>Semester</th>
                <th>Present</th>
                <th>Total</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{attendance.semester || "N/A"}</td>
                <td>
                  {attendance.daily.filter((d) => d.status === "present").length}
                </td>
                <td>{attendance.totalSessions}</td>
                <td>{attendance.overallPercentage}%</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default StudentAttendance;
