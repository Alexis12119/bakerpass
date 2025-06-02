import HumanResourcesDashboardPage from "@/components/HumanResources/Dashboard/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute allowedRole="Human Resources">
      <HumanResourcesDashboardPage />;
    </ProtectedRoute>
  );
}
