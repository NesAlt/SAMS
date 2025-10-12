import DashboardLayout from "../../components/DashboardLayout";
import TeacherViewClass from "../Teacher/TeacherViewClass"
import TeacherAttendance from "../Teacher/TeacherAttendance"
import { useState } from "react";

const TeacherDashboard = () => {
  const menuItems = [
    "Dashboard Overview",
    "View Class",
    "Mark Attendance",
    "Approve/Reject Leave",
  ];

  const [activeSection,setActiveSection]=useState("Dashboard Overview");

  const renderContent = ()=>{
    switch(activeSection){
      case "Dashboard Overview":
        return (  
          <>
          <h1>Welcome, Teacher!</h1>
          <p>This is your dashboard where you can manage your classes and students.</p>
          </>
        );
      case "View Class":
        return <TeacherViewClass/>

      case "Mark Attendance":
        return <TeacherAttendance/>

      // case "Approve/Reject Leave":
      //   return <TeacherLeave/>

      default:
        return <div></div>
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}
    onMenuClick={(item)=>setActiveSection(item)}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default TeacherDashboard;