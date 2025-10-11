import { useState, useEffect } from 'react';
import PropTypes from "prop-types";

import './UserFormModal.css';

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData = {}, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    class: '',
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '', // Blank out password when editing
        role: initialData.role || 'student',
        class: initialData.class || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'student',
        class: '',
      });
    }
  }, [initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{mode === 'edit' ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {mode === 'add' && (
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          )}
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>

          {formData.role === 'student' && (
            <input
              name="class"
              placeholder="Class"
              value={formData.class}
              onChange={handleChange}
              required
            />
          )}

          <div className="modal-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

UserFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    role: PropTypes.oneOf(['student', 'teacher', 'admin']),
    class: PropTypes.string,
  }),
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default UserFormModal;
