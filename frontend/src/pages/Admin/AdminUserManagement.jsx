import axios from '../../utils/axiosInstance';
import { useState, useEffect } from "react";
import UserFormModal from '../../components/UserFormModal';
import CSVUploadModal from '../../components/CSVModal';
import './AdminUserManagement.css';

const AdminUserManagement = () => {

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, students: 0, teachers: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('add');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);


  const openAddModal = () => {
    setSelectedUser(null);
    setMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setMode('edit');
    setIsModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      try {
        const { data } = await axios.get('/adminUser/get-all-users');
        if (isMounted) {
          const { users, total, students, teachers } = data;
          setUsers(users);
          setStats({ total, students, teachers });
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await axios.delete(`/adminUser/delete-user/${userId}`);
      // Remove the deleted user from the users state
      setUsers(prevUsers => prevUsers.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Failed to delete user:', err.response?.data?.error || err.message);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleCsvUpload = async (formData) => {
  const res = await axios.post('/adminUser/upload-users', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Refresh users
    const { data } = await axios.get('/adminUser/get-all-users');
    setUsers(data.users);
    setStats({ total: data.total, students: data.students, teachers: data.teachers });

    return res.data;
  };

  return (
    <div className="admin-user-management">
      <h2>User Statistics</h2>
      <div className="stats">
        <div>Total: {stats.total}</div>
        <div>Students: {stats.students}</div>
        <div>Teachers: {stats.teachers}</div>
      </div>

      <h2>User Management</h2>
      <div className="button-group">
        <button onClick={openAddModal}>Add New User</button>
        <button onClick={()=>setIsCSVModalOpen(true)}>Upload CSV</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Class</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.class || '-'}</td>
              <td>
                <button onClick={()=>openEditModal(u)}>Edit</button>
                <button className="btn_del" onClick={()=>deleteUser(u._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        <CSVUploadModal
          isOpen={isCSVModalOpen}
          onClose={() => setIsCSVModalOpen(false)}
          onUpload={handleCsvUpload}
        />
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(formData) => {
            if (mode === 'edit') {

              console.log("Updating user with ID:", selectedUser._id);
              axios.put(`/adminUser/update-user/${selectedUser._id}`, formData)
                .then(() => {

                  setUsers(prev => prev.map(u => u._id === selectedUser._id ? { ...u, ...formData } : u));
                  setIsModalOpen(false);
                }).catch(err => console.error(err));
            } else {

              axios.post('/adminUser/add-user', formData)
                .then(res => {
                  setUsers(prev => [...prev, res.data]);
                  setIsModalOpen(false);
                }).catch(err => console.error(err));
            }
          }}
          initialData={selectedUser}
          mode={mode}
        />
    </div>
  );
};

export default AdminUserManagement;
