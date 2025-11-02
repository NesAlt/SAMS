import DashboardLayout from "../../components/DashboardLayout";
// import AdminTeacherAssignment from "./AdminTeacherAssignment";
import AdminUserManagement from "./AdminUserManagement";
import AdminEventManager from './AdminEventManager';
import AdminTimetableManager from './AdminTimeTableManager';
// import AdminSystem from './AdminSystem';
import AdminNotificationManager from './AdminNotificationManager';
import AdminReportGen from './AdminReportGen';
import { useState } from "react";

const AdminDashboard = () => {
  const menuItems = [
    "Dashboard Overview",
    "Manage Users",
    // "Assign Teachers",
    "Event Manager",
    "Timetable Manager",
    "Generate Reports",
    "Notification Manager"
    // "System Settings",
  ];

  const [activeSection,setActiveSection]=useState("Dashboard Overview");

  const renderContent = ()=>{
    switch(activeSection){
      case "Dashboard Overview":
        return (  
          <>
          <h1>Welcome, Admin!</h1>
          <p>This is your dashboard where you can manage the system.</p>
          </>
        );

      case "Manage Users":
        return <AdminUserManagement/>

      // case "Assign Teachers":
      //   return <AdminTeacherAssignment/>

      case "Event Manager":
        return <AdminEventManager/>
      
      case "Timetable Manager":
        return <AdminTimetableManager/>

      case "Generate Reports":
        return <AdminReportGen/>
      
      case "Notification Manager":
        return <AdminNotificationManager/>
      // case "System Settings":
      //   return <AdminSystem/>

      default:
        return null;
    }
  };

  return(
    <DashboardLayout
      menuItems={menuItems}
      onMenuClick={(item)=>setActiveSection(item)}
      >
        {renderContent()}
      </DashboardLayout>
  );
};
export default AdminDashboard;