import SecurityGuardPage from "@/components/Security/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute allowedRole="Security">
      <SecurityGuardPage />;
    </ProtectedRoute>
  );
}
