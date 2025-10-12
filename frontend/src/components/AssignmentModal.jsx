import { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import './AssignmentModal.css';

const AssignmentFormModal = ({ isOpen, onClose, onSubmit, initialData, mode, teachers}) => {
  const [formData, setFormData] = useState({
    teacher: '',
    class: '',
    subject: '',
    semester: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        teacher: initialData.teacher?._id || '',
        class: initialData.class || '',
        subject: initialData.subject || '',
        semester: initialData.semester || ''
      });
    } else {
      setFormData({ teacher: '', class: '', subject: '', semester: '' });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>{mode === 'edit' ? 'Edit Assignment' : 'Add New Assignment'}</h3>

        <form onSubmit={handleSubmit}>
          <label>Teacher:</label>
          <select name="teacher" value={formData.teacher} onChange={handleChange} required>
            <option value="">Select a teacher</option>
            {teachers.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>

          <label>Class:</label>
          <input name="class" value={formData.class} onChange={handleChange} required />

          <label>Subject:</label>
          <input name="subject" value={formData.subject} onChange={handleChange} required />

          <label>Semester:</label>
          <input name="semester" value={formData.semester} onChange={handleChange} required />

          <div className="modal-buttons">
            <button type="submit">{mode === 'edit' ? 'Update' : 'Add'}</button>
            <button type="button" className="btn_cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

AssignmentFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  teachers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })).isRequired,
  initialData: PropTypes.shape({
    teacher: PropTypes.string,
    subject: PropTypes.string,
    semester: PropTypes.string,
    role: PropTypes.oneOf(['student', 'teacher', 'admin']),
    class: PropTypes.string,
  }),
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default AssignmentFormModal;