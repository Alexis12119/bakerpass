import React from "react";
import NursePage from "@/components/Nurse/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Nurse Dashboard | Appointment System"
        description="Manage and monitor visitors as a nurse."
        url="https://yourdomain.com/nurse"
      />

      <ProtectedRoute allowedRole="Nurse">
        <NursePage />;
      </ProtectedRoute>
    </>
  );
}
