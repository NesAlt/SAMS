import DashboardLayout from "../components/DashboardLayout";
import AdminUserManagement from "./AdminUserManagement";
import { useState } from "react";

const AdminDashboard = () => {
  const menuItems = [
    "Dashboard Overview",
    "Manage Users",
    "Assign Timetables",
    "Generate Reports",
    "System Settings",
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

      // case "Assign Timetables":
      //   return <AdminTimetables/>

      // case "Generate Reports":
      //   return <AdminGenReports/>
        
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