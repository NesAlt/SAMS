import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "../utils/axiosInstance";
import "./StudentLeaveModal.css";

const StudentLeaveModal = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
    isEventLeave: false,
    selectedEvent: "",
  });

  const [events, setEvents] = useState([]);

  // 🟢 Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        fromDate: "",
        toDate: "",
        reason: "",
        isEventLeave: false,
        selectedEvent: "",
      });
    }
  }, [isOpen]);

  // 🟢 Prefill data if editing an existing leave
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        fromDate: initialData.fromDate || "",
        toDate: initialData.toDate || "",
        reason: initialData.reason || "",
        isEventLeave: initialData.isEventLeave || false,
        selectedEvent: initialData.eventId || "",
      });
    }
  }, [initialData, isOpen]);

  // 🟢 Fetch events only when modal is opened
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get("/studentUser/get_events");
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    };
    if (isOpen) fetchEvents();
  }, [isOpen]);

  // 🟢 Handle inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "fromDate" && formData.toDate && value > formData.toDate) {
      setFormData((prev) => ({
        ...prev,
        fromDate: value,
        toDate: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // 🟢 When event is selected, auto-fill fields
  const handleEventSelect = (eventId) => {
    const selected = events.find((ev) => ev._id === eventId);
    if (selected) {
      setFormData({
        ...formData,
        isEventLeave: true,
        selectedEvent: eventId,
        fromDate: new Date(selected.date).toISOString().split("T")[0],
        toDate: selected.endDate
          ? new Date(selected.endDate).toISOString().split("T")[0]
          : new Date(selected.date).toISOString().split("T")[0],
        reason: selected.title,
      });
    }
  };

  // 🟢 Submit leave
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      fromDate: formData.fromDate,
      toDate: formData.toDate,
      reason: formData.reason,
      isEventLeave: formData.isEventLeave,
      eventId: formData.isEventLeave ? formData.selectedEvent : null,
    };

    onSubmit(payload);

    // ✅ Clear form immediately after submission
    setFormData({
      fromDate: "",
      toDate: "",
      reason: "",
      isEventLeave: false,
      selectedEvent: "",
    });
  };

  if (!isOpen) return null;
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{mode === "edit" ? "Edit Leave" : "Apply for Leave"}</h3>

        <form onSubmit={handleSubmit}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isEventLeave"
              checked={formData.isEventLeave}
              onChange={handleChange}
            />
            Event Leave
          </label>

          {formData.isEventLeave && (
            <div className="form-group">
              <label>Choose Event</label>
              <select
                name="selectedEvent"
                value={formData.selectedEvent}
                onChange={(e) => handleEventSelect(e.target.value)}
              >
                <option value="">-- Select an Event --</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title} ({new Date(ev.date).toLocaleDateString()} -{" "}
                    {ev.endDate
                      ? new Date(ev.endDate).toLocaleDateString()
                      : new Date(ev.date).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>From Date</label>
            <input
              type="date"
              name="fromDate"
              value={formData.fromDate}
              min={today}
              onChange={handleChange}
              disabled={formData.isEventLeave}
              required
            />
          </div>

          <div className="form-group">
            <label>To Date</label>
            <input
              type="date"
              name="toDate"
              value={formData.toDate}
              min={formData.fromDate || today}
              onChange={handleChange}
              disabled={formData.isEventLeave}
              required
            />
          </div>

          <div className="form-group">
            <label>Reason</label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              disabled={formData.isEventLeave}
              required
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="submit">
              {mode === "edit" ? "Update Leave" : "Submit Leave"}
            </button>
            <button
              type="button"
              className="btn_cancel"
              onClick={() => {
                // ✅ Reset before closing
                setFormData({
                  fromDate: "",
                  toDate: "",
                  reason: "",
                  isEventLeave: false,
                  selectedEvent: "",
                });
                onClose();
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

StudentLeaveModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  mode: PropTypes.oneOf(["add", "edit"]),
};

export default StudentLeaveModal;
