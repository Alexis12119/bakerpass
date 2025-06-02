"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import ErrorModal from "@/components/Modals/ErrorModal";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (email: string, password: string) => {
    if (!email || !password) {
      setErrorMessage("All fields are required!");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/login`,
        { email, password },
      );

      const { token } = response.data;

      // Save token and user info in localStorage
      localStorage.setItem("token", token);
      const decoded: { role: string } = jwtDecode(token);

      // Redirect by role
      switch (decoded.role) {
        case "Human Resources":
          router.push("/hr");
          break;
        case "Security":
          router.push("/security");
          break;
        case "Employee":
          router.push("/employee");
          break;
        case "Visitor":
          router.push("/visitor");
          break;
        default:
          router.push("/nurse");
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F6FB] px-4">
      {/* Background Overlay for Blur Effect */}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}

      <div className="absolute top-6 left-6 sm:top-10 sm:left-10">
        <Image
          rel="icon"
          src="/images/franklin-logo.png"
          priority={true}
          alt=""
          width={150}
          height={100}
          className="rounded-full mr-3 !bg-transparent"
          // alt={`${visitor.name} profile`}
        />
      </div>
      <div className="w-[400px] bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-[#1C274C]">Sign In</h2>
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

        <div className="mt-4 relative">
          <input
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none text-black pr-10"
            placeholder=""
          />
          <label
            className={`absolute left-3 transition-all duration-300 ease-in-out bg-white px-1 text-[#1C274C]
      ${password ? "top-[-10px] left-2 text-sm" : "top-3 peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-sm"}`}
          >
            Password
          </label>
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black bg-transparent"
            onClick={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? (
              <EyeSlashIcon className="h-5 w-5 text-[#1C274C]" />
            ) : (
              <EyeIcon className="h-5 w-5 text-[#1C274C]" />
            )}
          </button>
        </div>

        <div className="mt-2">
          <Link
            href="/forgot"
            className="text-sm text-[#1C274C] font-bold hover:underline text-decoration-none"
          >
            Forgot password?
          </Link>
        </div>

        <button
          onClick={() => handleSignIn(email, password)}
          className="w-full bg-[#1C274C] text-white py-3 rounded-md mt-4 font-semibold transition"
        >
          Sign In
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="text-center">
          <Link
            href="/register"
            className="text-sm text-[#1C274C] font-bold hover:underline"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
