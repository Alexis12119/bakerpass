"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";
import { handleAxiosError } from "@/utils/handleAxiosError";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleForgotPasswordSend = async () => {
    if (!email) {
      showErrorToast("Please enter your email.");
      return;
    }

    if(!email.includes("@")) {
      showErrorToast("Please enter a valid email address.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/forgot`,
        { email },
      );

      const { role } = response.data;

      if (!role) {
        throw new Error("No role returned from server.");
      }

      showSuccessToast("OTP Sent to your Email");
      router.push(`/verify-otp?email=${email}&role=${role}`);
    } catch (error: any) {
      // This if for forgot password page
      handleAxiosError(error, {
        fallbackMessage: "Forgot Password Failed. Please try again.",
        statusMessages: {
          400: "Email Not Found",
          502: "Server temporarily unavailable. Please try again later.",
        },
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F6FB] px-4 relative pt-28 sm:pt-0">
      <div className="absolute top-4 left-4 sm:top-10 sm:left-10 z-10">
        <Image
          src="/images/franklin-logo.png"
          alt="Franklin Baker Logo"
          priority
          width={160}
          height={100}
          className="w-28 sm:w-40 h-auto"
        />
      </div>

      <div className="w-[400px] bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-[#1C274C]">
          Forgot Password
        </h2>
        <p className="mt-1 text-sm text-[#1C274C]">
          Hello! Welcome to{" "}
          <span className="font-semibold text-[#1C274C]">Franklin Baker</span>,
          where quality and innovation meet purpose.
        </p>

        <div className="mt-5 relative">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none text-black"
            placeholder=""
          />
          <label
            className={`absolute left-3 transition-all duration-300 ease-in-out bg-white px-1 text-[#1C274C] 
      ${email ? "top-[-10px] left-2 text-sm" : "top-3 peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-sm"}`}
          >
            Email
          </label>
        </div>
        <button
          onClick={handleForgotPasswordSend}
          className="w-full bg-[#1C274C] text-white py-3 rounded-md mt-4 font-semibold transition"
        >
          Send
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-[#1C274C] font-bold !hover:underline text-decoration-none"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
