import HumanResourcesReportsPage from "@/components/HumanResources/Reports/Page"; // Component for displaying HR reports
import ProtectedRoute from "@/components/common/ProtectedRoute"; // Wrapper component to enforce role-based access control

export default function Home() {
  return (
    <ProtectedRoute allowedRole="Human Resources">
      <HumanResourcesReportsPage />; {/* Render HR reports within a protected route */}
    </ProtectedRoute>
  );
}
