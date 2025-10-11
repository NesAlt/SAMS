import DashboardLayout from "../components/DashboardLayout";

const TeacherDashboard = () => {
  const menuItems = [
    "Mark Attendance",
    "View Students",
    "Approve/Reject Leave",
    "Class Performance",
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
      <h1>Welcome, Teacher!</h1>
      <p>This is your dashboard where you can manage your classes and students.</p>
    </DashboardLayout>
  );
};

export default TeacherDashboard;