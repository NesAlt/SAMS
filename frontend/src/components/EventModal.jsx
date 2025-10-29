import{ useState, useEffect } from "react";
import PropTypes from "prop-types";

import "./EventModal.css";

const EventModal = ({ isOpen, onClose, mode, initialData, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    type: "event",
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        description: "",
        date: "",
        endDate: "",
        type: "event",
      });
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        date: initialData.date?.split("T")[0] || "",
        endDate: initialData.endDate?.split("T")[0] || "",
        type: initialData.type || "event",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        date: "",
        endDate: "",
        type: "event",
      });
    }
  }, [mode, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "date" && formData.endDate && value > formData.endDate) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        endDate: value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{mode === "edit" ? "Edit Event" : "Add Event"}</h3>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Event Title"
            required
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description"
          />

          <label>Start Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            min={today}
            onChange={handleChange}
            required
          />

          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            min={formData.date||today}
            onChange={handleChange}
          />

          <label>Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="event">Event</option>
            <option value="holiday">Holiday</option>
          </select>

          <div className="modal-buttons">
            <button type="submit">
              {mode === "edit" ? "Save Changes" : "Create Event"}
            </button>
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    date: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    type: PropTypes.string,
  }),
  mode: PropTypes.oneOf(['add', 'edit']),
};


export default EventModal;
