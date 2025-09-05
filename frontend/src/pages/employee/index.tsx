import React from "react";
import EmployeeVisitorsPage from "@/components/Employee/Visitors/Page";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Employee Dashboard | Appointment System"
        description="Manage and monitor visitors as an employee."
        url="https://yourdomain.com/employee"
      />

      <ProtectedRoute allowedRole="Employee">
        <EmployeeVisitorsPage />
      </ProtectedRoute>
    </>
  );
}
