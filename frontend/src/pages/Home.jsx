import { useAuth } from "../context/UseAuth";
import AdminDashboard from "./AdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";

export default function Home() {
  const { user } = useAuth();

  if (!user) return <div>Unauthorized</div>;

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    default:
      return <div>Role not recognized</div>;
  }
}