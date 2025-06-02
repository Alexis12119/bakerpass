import EmployeeVisitorsPage from "@/components/Employee/Visitors/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute allowedRole="Employee">
      <EmployeeVisitorsPage />
    </ProtectedRoute>
  );
}
