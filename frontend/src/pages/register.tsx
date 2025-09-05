import React from "react";
import RegisterPage from "@/components/RegisterPage";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Register | Appointment System"
        description="Secure registration for managing appointments and visitors"
        url="https://yourdomain.com/security/register"
        image="/default-og-image.png"
        noIndex={true}
      />
      <RegisterPage />
    </>
  );
}
