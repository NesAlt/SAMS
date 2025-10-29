import DashboardLayout from "../../components/DashboardLayout";
import { useState } from "react";
import StudentAttendance from '../Student/StudentAttendance';
import StudentLeave from '../Student/StudentLeave';

const StudentDashboard = () => {
  const menuItems = [
    "Dashboard Overview",
    "View Attendance",
    "Leaves",
  ];

  const [activeSection,setActiveSection]=useState("Dashboard Overview");

  const renderContent=()=>{
    switch(activeSection){
      case "Dashboard Overview":
        return(
              <>
              <h1>Welcome, Student!</h1>
              <p>This is your dashboard where you can view student details.</p>
              </>
        );
      case "View Attendance":
        return <StudentAttendance/>
      
      case "Leaves":
        return <StudentLeave/>
      
      default:
        return <div></div>
    }

  }

  return (
    <DashboardLayout menuItems={menuItems}
    onMenuClick={(item)=>setActiveSection(item)}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default StudentDashboard;