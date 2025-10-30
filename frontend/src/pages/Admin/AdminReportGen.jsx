import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminReportGen.css";

const AdminReports = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [reportType, setReportType] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [semester, setSemester] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await axios.get("/adminUser/classes");
        setClasses(data.classes || []);
      } catch (err) {
        console.error("Error fetching classes:", err);
      }
    };
    fetchClasses();
  }, []);

  const generateReport = async () => {
    if (!selectedClass) return alert("Please select a class first.");
    if (!reportType) return alert("Please choose a report type.");

    let endpoint = "";
    if (reportType === "monthly") {
      if (!month || !year) return alert("Enter month and year.");
      endpoint = `/adminUser/reports/monthly/${selectedClass}/${month}/${year}`;
    } else if (reportType === "semester") {
      if (!semester) return alert("Enter semester number.");
      endpoint = `/adminUser/reports/semester/${selectedClass}/Sem${semester}`;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(endpoint);
      setReportData(data.report || []);
    } catch (err) {
      console.error("Error generating report:", err);
      alert("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (reportData.length === 0) {
      alert("No data to export.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Class Attendance Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Class: ${selectedClass}`, 14, 28);
    doc.text(`Type: ${reportType.toUpperCase()}`, 14, 34);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

    const tableColumn = ["Student Name", "Subject", "Present Days", "Total Days", "Percentage"];
    const tableRows = reportData.map((r) => [
      r.studentName || "N/A",
      r.subject || "N/A",
      r.presentDays || 0,
      r.totalDays || 0,
      `${r.percentage || 0}%`,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`${selectedClass}_${reportType}_report.pdf`);
  };

  return (
    <div className="admin-reports">
      <h2>Admin Attendance Reports</h2>

      <div className="class-selection">
        <h3>Select a Class</h3>
        <ul>
          {classes.map((cls, idx) => (
            <li key={idx}>
              <button
                className={selectedClass === cls ? "active" : ""}
                onClick={() => {
                  setSelectedClass(cls);
                  setReportType("");
                  setReportData([]);
                }}
              >
                {cls}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedClass && (
        <div className="report-options">
          <h3>Generate Report for {selectedClass}</h3>
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setReportData([]);
            }}
          >
            <option value="">-- Select Report Type --</option>
            <option value="monthly">Monthly</option>
            <option value="semester">Semester</option>
          </select>

          {reportType === "monthly" && (
            <div className="month-inputs">
              <input
                type="number"
                placeholder="Month (1–12)"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
              <input
                type="number"
                placeholder="Year (e.g. 2025)"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          )}

          {reportType === "semester" && (
            <input
              type="number"
              placeholder="Semester (1–6)"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            />
          )}

          <button onClick={generateReport} disabled={loading}>
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      )}

      {reportData.length > 0 && (
        <div className="report-table">
          <h3>Report for {selectedClass}</h3>
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Subject</th>
                <th>Present Days</th>
                <th>Total Days</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.studentName || "N/A"}</td>
                  <td>{row.subject || "N/A"}</td>
                  <td>{row.presentDays || 0}</td>
                  <td>{row.totalDays || 0}</td>
                  <td>{`${row.percentage || 0}%`}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="download-btn" onClick={downloadPDF}>
            Download PDF
          </button>
        </div>
      )}

      {!loading && reportData.length === 0 && selectedClass && (
        <p className="no-data">No data yet. Choose filters and generate a report.</p>
      )}
    </div>
  );
};

export default AdminReports;