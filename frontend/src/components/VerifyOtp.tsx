"use client";

import { useState } from "react"; // React hook for managing component state
import { useRouter, useSearchParams } from "next/navigation"; // Next.js hooks for routing and accessing URL search parameters
import axios from "axios"; // Library for making HTTP requests
import ErrorModal from "@/components/Modals/ErrorModal";

const VerifyOtpPage = () => {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const role = searchParams.get("role");
  const [errorMessage, setErrorMessage] = useState("");

  const handleVerifyOtp = async () => {
    if (!otp) {
      setErrorMessage("Please enter the OTP.");
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/verify-otp`, {
        email,
        otp,
        role,
      });

      router.push(`/reset?email=${email}&role=${role}`);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Invalid OTP.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F6FB]">
      {
        /* Error Modal */
        errorMessage && (
          <ErrorModal
            message={errorMessage}
            onClose={() => setErrorMessage("")}
          />
        )
      }
      <div className="w-[400px] bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-[#1C274C]">Verify OTP</h2>
        <p className="mt-1 text-sm text-[#1C274C]">
          Enter the OTP sent to your email.
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none text-black mt-4"
          placeholder="Enter OTP"
        />

        <button
          onClick={handleVerifyOtp}
          className="w-full bg-[#1C274C] text-white py-3 rounded-md mt-4 font-semibold transition"
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
