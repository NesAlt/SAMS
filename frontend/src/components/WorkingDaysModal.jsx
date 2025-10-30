import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./WorkingDaysModal.css";

const WorkingDaysModal = ({ isOpen, onClose, mode, initialData, onSubmit }) => {
  const [semester, setSemester] = useState("");
  const [totalWorkingDays, setTotalWorkingDays] = useState("");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const extractedSemester = String(initialData.semester).replace(/\D/g, "");
      setSemester(extractedSemester);
      setTotalWorkingDays(initialData.totalWorkingDays);
    } else {
      setSemester("");
      setTotalWorkingDays("");
    }
  }, [mode, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!semester || !totalWorkingDays) {
      alert("All fields are required.");
      return;
    }
  const numericSemester = Number(semester);
  if (isNaN(numericSemester)) {
    alert("Semester must be a valid number (e.g., 1, 2, 3).");
    return;
  }
    const formattedSemester = `Sem${numericSemester}`;

    onSubmit({ semester:formattedSemester, totalWorkingDays: Number(totalWorkingDays) });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{mode === "edit" ? "Edit Working Days" : "Set Working Days"}</h3>

        <form onSubmit={handleSubmit}>
          <label>Semester</label>
          <input
            type="number"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="e.g., 1"
            required
          />

          <label>Total Working Days</label>
          <input
            type="number"
            min="1"
            value={totalWorkingDays}
            onChange={(e) => setTotalWorkingDays(e.target.value)}
            placeholder="Enter number of days"
            required
          />

          <div className="modal-buttons">
            <button type="submit" className="btn_save">
              {mode === "edit" ? "Update" : "Save"}
            </button>
            <button type="button" className="btn_cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

WorkingDaysModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['add', 'edit']),
  initialData: PropTypes.shape({
    semester: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    totalWorkingDays: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
  }),
  onSubmit: PropTypes.func.isRequired,
};

export default WorkingDaysModal;
