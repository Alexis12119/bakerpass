import React from "react";
import HumanResourcesDashboardPage from "@/components/HumanResources/Dashboard/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Human Resources Dashboard | Appointment System"
        description="Monitor visitors as a human resources."
        url="https://yourdomain.com/hr"
      />

      <ProtectedRoute allowedRole="Human Resources">
        <HumanResourcesDashboardPage />;
      </ProtectedRoute>
    </>
  );
}
