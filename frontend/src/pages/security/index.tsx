import React from "react";
import SecurityGuardPage from "@/components/Security/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Security Dashboard | Appointment System"
        description="Manage and monitor visitors as a security guard."
        url="https://yourdomain.com/security"
      />

      <ProtectedRoute allowedRole="Security">
        <SecurityGuardPage />
      </ProtectedRoute>
    </>
  );
}
