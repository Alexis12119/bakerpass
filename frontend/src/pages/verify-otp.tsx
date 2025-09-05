import React from "react";
import VerifyOtpPage from "@/components/VerifyOtp";
import SEO from "@/components/common/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="Verify OTP | Appointment System"
        description="Secure verify OTP for managing appointments and visitors"
        url="https://yourdomain.com/security/verify-otp"
        image="/default-og-image.png"
        noIndex={true}
      />
      <VerifyOtpPage />
    </>
  );
}
