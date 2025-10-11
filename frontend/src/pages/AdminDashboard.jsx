import DashboardLayout from "../components/DashboardLayout";

const TeacherDashboard = () => {
  const menuItems = [
    "Dashboard Overview",
    "Manage Users",
    "Assign Timetables",
    "Generate Reports",
    "System Settings",
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
      <h1>Welcome, Admin!</h1>
      <p>This is your dashboard where you can manage the system.</p>
    </DashboardLayout>
  );
};

export default TeacherDashboard;