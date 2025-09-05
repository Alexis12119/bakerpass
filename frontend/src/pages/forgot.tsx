import React from "react";
import ForgotPasswordPage from "@/components/ForgotPasswordPage";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Forgot Password | Appointment System"
        description="Secure forgot password for managing appointments and visitors"
        url="https://yourdomain.com/security/forgot"
        image="/default-og-image.png"
        noIndex={true}
      />
      <ForgotPasswordPage />
    </>
  );
}
