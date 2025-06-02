import NursePage from "@/components/Nurse/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute allowedRole="Nurse">
      <NursePage />;
    </ProtectedRoute>
  );
}
