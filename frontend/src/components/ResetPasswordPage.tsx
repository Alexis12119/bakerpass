"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmNewPasswordVisible, setConfirmNewPasswordVisible] =
    useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const roleParam = searchParams.get("role");
    if (emailParam && roleParam) {
      setEmail(emailParam);
      setRole(roleParam);
    }
  }, [searchParams]);
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showErrorToast("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/reset`,
        {
          email,
          role,
          newPassword,
        },
      );
      showSuccessToast(response.data.message);
      router.push("/login");
    } catch (error: any) {
      showErrorToast(error.response?.data?.message || "Something went wrong.");
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
          Reset Password
        </h2>
        <p className="mt-1 text-sm text-[#1C274C]">
          Hello! Welcome to{" "}
          <span className="font-semibold text-[#1C274C]">Franklin Baker</span>,
          where quality and innovation meet purpose.
        </p>

        <div className="mt-4 relative">
          <input
            type={newPasswordVisible ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="peer w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none text-black pr-10"
            placeholder=""
            autoComplete="new-password"
          />
          <label
            className={`absolute left-3 transition-all duration-300 ease-in-out bg-white px-1 text-[#1C274C]
      ${newPassword ? "top-[-10px] left-2 text-sm" : "top-3 peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-sm"}`}
          >
            New Password
          </label>
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black bg-transparent"
            onClick={() => setNewPasswordVisible(!newPasswordVisible)}
          >
            {newPasswordVisible ? (
              <EyeSlashIcon className="h-5 w-5 text-[#1C274C]" />
            ) : (
              <EyeIcon className="h-5 w-5 text-[#1C274C]" />
            )}
          </button>
        </div>

        <div className="mt-4 relative">
          <input
            type={confirmNewPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="peer w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none pr-10 text-black"
            placeholder=""
          />
          <label
            className={`absolute left-3 transition-all duration-300 ease-in-out bg-white px-1 text-[#1C274C]
      ${confirmPassword ? "top-[-10px] left-2 text-sm" : "top-3 peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-sm"}`}
          >
            Confirm New Password
          </label>
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black bg-transparent"
            onClick={() =>
              setConfirmNewPasswordVisible(!confirmNewPasswordVisible)
            }
          >
            {confirmNewPasswordVisible ? (
              <EyeSlashIcon className="h-5 w-5 text-[#1C274C]" />
            ) : (
              <EyeIcon className="h-5 w-5 text-[#1C274C]" />
            )}
          </button>
        </div>

        <button
          onClick={handleResetPassword}
          className="w-full bg-[#1C274C] text-white py-3 rounded-md mt-4 font-semibold transition"
        >
          Reset Password
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="text-center">
          <Link
            href="/forgot"
            className="text-sm text-[#1C274C] font-bold !hover:underline text-decoration-none"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
