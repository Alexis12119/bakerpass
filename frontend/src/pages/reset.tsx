import React from "react";
import ResetPasswordPage from "@/components/ResetPasswordPage";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Reset Password | Appointment System"
        description="Secure reset password for managing appointments and visitors"
        url="https://yourdomain.com/security/reset"
        image="/default-og-image.png"
        noIndex={true}
      />
      <ResetPasswordPage />
    </>
  );
}
