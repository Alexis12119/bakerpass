"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";
import { handleAxiosError } from "@/utils/handleAxiosError";

const RegisterPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sex, setSex] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();
  const [department, setDepartment] = useState("");
  const [allDepartments, setAllDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/departments`,
        );
        setAllDepartments(res.data);
      } catch (err: any) {
        if (
          err.code === "ECONNREFUSED" ||
          err.message?.includes("Network Error")
        ) {
          showErrorToast(
            "Cannot connect to the server. Please try again later.",
          );
        } else {
          showErrorToast("Failed to load departments.");
        }
        console.error("Failed to load departments", err);
      }
    };

    fetchDepartments();
  }, []);
  const rolesDepartments: Record<string, string[]> = {
    Employee: ["IT", "Sales", "Marketing", "Finance"],
    "Human Resources": ["HR", "Finance"],
    Security: ["IT", "Sales", "Marketing", "Finance"],
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    setDepartment(""); // Reset department selection
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      showErrorToast("All fields are required!");
      return;
    }

    if (password !== confirmPassword) {
      showErrorToast("Passwords do not match!");
      return;
    }

    // Only include department if the role is 'Employee'
    const data = {
      email,
      password,
      firstName,
      lastName,
      role,
      departmentId: role === "Employee" ? parseInt(department) : undefined, // Send departmentId only if the role is Employee
    };
    setIsRegistering(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/register`,
        data,
      );

      showSuccessToast(response.data.message);
      router.push("/login");
    } catch (error: any) {
      handleAxiosError(error, {
        fallbackMessage: "Registration failed. Please try again.",
      });
    } finally {
      setIsRegistering(false);
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
        <h2 className="text-2xl font-semibold text-[#1C274C]">Register</h2>
        <p className="mt-1 text-sm text-[#1C274C]">
          Hello! Welcome to{" "}
          <span className="font-semibold text-[#1C274C]">Franklin Baker</span>,
          where quality and innovation meet purpose.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="mt-4 relative">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="peer w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none text-black"
              placeholder=""
            />
            <label
              className={`absolute left-3 text-[#1C274C] bg-white px-1 transition-all duration-300 ease-in-out 
                ${firstName ? "top-[-10px] left-2 text-sm" : "top-3 peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-sm"}`}
            >
              First Name
            </label>
          </div>

          {/* Last Name */}
          <div className="mt-4 relative">
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="peer w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none text-black"
              placeholder=""
            />
            <label
              className={`absolute left-3 text-[#1C274C] bg-white px-1 transition-all duration-300 ease-in-out 
                ${lastName ? "top-[-10px] left-2 text-sm" : "top-3 peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-sm"}`}
            >
              Last Name
            </label>
          </div>
        </div>

        {/* Email */}
        <div className="mt-4 relative">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="peer w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none text-black"
            placeholder=""
          />
          <label
            className={`absolute left-3 text-[#1C274C] bg-white px-1 transition-all duration-300 ease-in-out 
              ${email ? "top-[-10px] left-2 text-sm" : "top-3 peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-sm"}`}
          >
            Email
          </label>
        </div>

        {/* Password */}
        <div className="mt-4 relative">
          <input
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="peer w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none pr-10 text-black"
            placeholder=""
          />
          <label
            className={`absolute left-3 text-[#1C274C] bg-white px-1 transition-all duration-300 ease-in-out 
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

        {/* Confirm Password */}
        <div className="mt-4 relative">
          <input
            type={confirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="peer w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1C274C] focus:outline-none pr-10 text-black"
            placeholder=""
          />
          <label
            className={`absolute left-3 text-[#1C274C] bg-white px-1 transition-all duration-300 ease-in-out 
              ${confirmPassword ? "top-[-10px] left-2 text-sm" : "top-3 peer-focus:top-[-10px] peer-focus:left-2 peer-focus:text-sm"}`}
          >
            Confirm Password
          </label>
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black bg-transparent"
            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            {confirmPasswordVisible ? (
              <EyeSlashIcon className="h-5 w-5 text-[#1C274C]" />
            ) : (
              <EyeIcon className="h-5 w-5 text-[#1C274C]" />
            )}
          </button>
        </div>

        {/* Role Selection */}
        <div className="relative mt-4 mb-4">
          <select
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 appearance-none text-center"
            value={role}
            onChange={handleRoleChange}
          >
            <option value="" disabled selected>
              Select Your Role
            </option>
            {Object.keys(rolesDepartments).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* 
          Dropdown for the sex of the user
          */}
        <div className="relative mt-4 mb-4">
          <select
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 appearance-none text-center"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          >
            <option value="" disabled selected>
              Select Your Sex
            </option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <div className="absolute inset-y-0 right-2 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Department Selection (only show if role is Employee) */}
        {role === "Employee" && (
          <div className="relative mt-4 mb-4">
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 appearance-none text-center"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="" disabled>
                Select Your Department
              </option>
              {allDepartments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-2 flex items-center pr-2 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Register Button */}
        <button
          onClick={handleRegister}
          className="w-full bg-[#1C274C] text-white py-3 rounded-md mt-4 font-semibold transition-shadow flex items-center justify-center"
          disabled={isRegistering}
        >
          {isRegistering ? (
            <div className="relative w-5 h-5">
              <div className="absolute w-full h-full border-2 border-white border-t-transparent rounded-full animate-spin" />
              <div className="absolute w-full h-full border-2 border-dashed border-[#F3F6FB] border-t-transparent rounded-full animate-[spin_2s_linear_infinite]" />
            </div>
          ) : (
            "Register"
          )}
        </button>

        <div className="text-center mt-4">
          <Link
            href="/login"
            className="text-sm text-[#1C274C] font-bold hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
