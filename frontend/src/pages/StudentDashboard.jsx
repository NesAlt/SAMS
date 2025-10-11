import DashboardLayout from "../components/DashboardLayout";

const TeacherDashboard = () => {
  const menuItems = [
    "View Attendance",
    "Leaves",
    "Class Performance",
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
      <h1>Welcome, Student!</h1>
      <p>This is your dashboard where you can view student details.</p>
    </DashboardLayout>
  );
};

export default TeacherDashboard;