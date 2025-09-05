import React from "react";
import HumanResourcesReportsPage from "@/components/HumanResources/Reports/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Human Resources Reports | Appointment System"
        description="Monitor visitors as a human resources."
        url="https://yourdomain.com/hr/reports"
      />

      <ProtectedRoute allowedRole="Human Resources">
        <HumanResourcesReportsPage />;
      </ProtectedRoute>
    </>
  );
}
