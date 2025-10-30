import { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance";
import "./StudentAttendance.css";

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const { data } = await axios.get("/studentUser/attendance");
        setAttendance(data);
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) return <p>Loading attendance data...</p>;
  if (!attendance) return <p>No attendance data available.</p>;

  return (
    <div className="student-attendance">
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
            <td>{attendance.totalWorkingDays}</td>
            <td>{attendance.overallPercentage}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default StudentAttendance;