import React from "react";
import LoginPage from "@/components/LoginPage";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Login | Appointment System"
        description="Secure login for managing appointments and visitors"
        url="https://yourdomain.com/security/login"
        image="/default-og-image.png"
        noIndex={true}
      />
      <LoginPage />
    </>
  );
}
