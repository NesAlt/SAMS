import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import "./AdminTimetableManager.css";

const AdminTimetableManager = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [semester, setSemester] = useState("");
  const [timetable, setTimetable] = useState([]);
  const [formData, setFormData] = useState({
    subject: "",
    teacher: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    fetchClassesAndTeachers();
  }, []);

  const fetchClassesAndTeachers = async () => {
    try {
      const [classRes, userRes] = await Promise.all([
        axios.get("/adminUser/classes"),
        axios.get("/adminUser/get-all-users"),
      ]);
      const classes = classRes.data.classes || [];
      const allUsers =
        userRes.data?.users ||
        userRes.data?.data ||
        userRes.data ||
        [];
      const teachers = allUsers.filter((u) => u.role === "teacher");

      setClasses(classes);
      setTeachers(teachers);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchTimetable = async () => {
    if (!selectedClass || !semester) return;
    try {
      const { data } = await axios.get(
        `/adminUser/timetable/${selectedClass}/${semester}`
      );
      setTimetable(data.timetable || []);
    } catch (err) {
      console.error("Error fetching timetable:", err);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedClass || !semester) {
      alert("Select class and semester first");
      return;
    }

    try {
      const newEntry = {
        class: selectedClass,
        semester,
        ...formData,
      };

      await axios.post("/adminUser/timetableAdd", newEntry);
      fetchTimetable();
      setFormData({
        subject: "",
        teacher: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
      });
    } catch (err) {
      console.error("Error adding timetable entry:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this timetable entry?"))
      return;
    try {
      await axios.delete(`/adminUser/timetable/${id}`);
      setTimetable((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("Error deleting timetable:", err);
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timetableByDay = daysOfWeek.map((day) => ({
    day,
    entries: timetable
      .filter((t) => t.dayOfWeek === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <div className="admin-timetable">
      <h2>Timetable Manager</h2>

      <div className="filters">
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Select Class</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <select
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        >
          <option value="">Select Semester</option>
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <option key={num} value={`Sem${num}`}>
              Sem {num}
            </option>
          ))}
        </select>

        <button onClick={fetchTimetable}>Load Timetable</button>
      </div>

      {selectedClass && semester && (
        <>
          <form className="add-timetable-form" onSubmit={handleAdd}>
            <input
              type="text"
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
            />
            <select
              value={formData.teacher}
              onChange={(e) =>
                setFormData({ ...formData, teacher: e.target.value })
              }
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
            <select
              value={formData.dayOfWeek}
              onChange={(e) =>
                setFormData({ ...formData, dayOfWeek: e.target.value })
              }
              required
            >
              <option value="">Day</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) =>
                setFormData({ ...formData, startTime: e.target.value })
              }
              required
            />
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) =>
                setFormData({ ...formData, endTime: e.target.value })
              }
              required
            />
            <button type="submit">Add</button>
          </form>

          <div className="timetable-grid">
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Schedule</th>
                </tr>
              </thead>
              <tbody>
                {timetableByDay.map(({ day, entries }) => (
                  <tr key={day}>
                    <td className="day-cell">{day}</td>
                    <td>
                      {entries.length === 0 ? (
                        <span className="empty-cell">No classes</span>
                      ) : (
                        <div className="day-schedule">
                          {entries.map((entry) => (
                            <div key={entry._id} className="entry-card">
                              <strong>{entry.subject}</strong> <br />
                              {entry.teacher?.name || "—"} <br />
                              <small>
                                {entry.startTime} - {entry.endTime}
                              </small>
                              <button
                                className="btn_del"
                                onClick={() => handleDelete(entry._id)}
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminTimetableManager;