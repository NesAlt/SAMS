import axios from "../../utils/axiosInstance";
import { useState, useEffect } from "react";
import AssignmentFormModal from '../../components/AssignmentModal';
import './AdminTeacherAssignment.css'; 

const AdminTeacherAssignment = ()=>{
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  useEffect(() => {
  let isMounted = true;

  const fetchAssignments = async () => {
    try {
      const { data } = await axios.get('/adminUser/all');
      if (isMounted) setAssignments(data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } 
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await axios.get('/adminUser/get-all-users');
      if (isMounted) {
        const teacherList = data.users.filter(u => u.role === 'teacher');
        setTeachers(teacherList);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    }
  };

  fetchAssignments();
  fetchTeachers();

  return () => {
    isMounted = false;
  };
}, []);
 const openAddModal = () => {
    setSelectedAssignment(null);
    setMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setMode('edit');
    setIsModalOpen(true);
  };

  // Delete Assignment
  const deleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await axios.delete(`/adminUser/delete/${id}`);
      setAssignments(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to delete assignment:', err);
      alert('Failed to delete assignment. Please try again.');
    }
  };

  return (
    <div className="admin-teacher-assignment">
      <h2>Teacher Assignments</h2>

      <div className="button-group">
        <button onClick={openAddModal}>Add New Assignment</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Teacher</th>
            <th>Class</th>
            <th>Subject</th>
            <th>Semester</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a._id}>
              <td>{a.teacher?.name || '—'}</td>
              <td>{a.class}</td>
              <td>{a.subject}</td>
              <td>{a.semester}</td>
              <td>
                <button onClick={() => openEditModal(a)}>Edit</button>
                <button className="btn_del" onClick={() => deleteAssignment(a._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <AssignmentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={mode}
        teachers={teachers}
        initialData={selectedAssignment}
        onSubmit={async (formData) => {
          try {
            if (mode === 'edit') {
              await axios.put(`/adminUser/update/${selectedAssignment._id}`, formData);
              setAssignments(prev =>
                prev.map(a => a._id === selectedAssignment._id ? { ...a, ...formData } : a)
              );
            } else {
              const { data: newAssignment } = await axios.post('/adminUser/add', formData);
              setAssignments(prev => [...prev, newAssignment]);
            }
            setIsModalOpen(false);
          } catch (err) {
            console.error('Error saving assignment:', err);
            alert('Failed to save assignment.');
          }
        }}
      />
    </div>
  );
};

export default AdminTeacherAssignment;