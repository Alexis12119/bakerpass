import HumanResourcesReportsPage from "@/components/HumanResources/Reports/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute allowedRole="Human Resources">
      <HumanResourcesReportsPage />;
    </ProtectedRoute>
  );
}
