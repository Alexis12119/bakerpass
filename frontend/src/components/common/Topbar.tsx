"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { DualRingSpinner } from "@/components/common/DualRingSpinner";
import ConfirmationModal from "@/components/Modals/ConfirmationModal";
import { getUserFromToken, clearSession } from "@/hooks/authUtils";
import { User, LogOut } from "lucide-react";
import {
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";

interface TopBarProps {
  role: "Human Resources" | "Employee" | "Security";
  showNewVisitButton?: boolean;
  onNewVisitClick?: () => void;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  role,
  showNewVisitButton = false,
  onNewVisitClick,
  isSidebarOpen = false,
  toggleSidebar,
}) => {
  const [user, setUser] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle clicking profile image to open file dialog
  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  // Persist profile image in sessionStorage
  const updateProfileImageStorage = (newUrl: string, userId: string) => {
    sessionStorage.setItem(`profileImage_${userId}`, newUrl);
  };

  // Upload file to backend (GCS)
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validation
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) return showErrorToast("File size must be <5MB");

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type))
      return showErrorToast("Invalid file type");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const query = new URLSearchParams({
        userId: user.id.toString(),
        role: user.role,
      });
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/upload-profile-image?${query.toString()}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 },
      );

      const newUrl = response.data.imageUrl;

      setUser((prev) => (prev ? { ...prev, profileImage: newUrl } : prev));
      updateProfileImageStorage(newUrl, user.id.toString());
      showSuccessToast("Profile image updated!");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Error uploading image. Please try again.";
      showErrorToast(msg);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
    }
  };

  // Load user from token on mount
  useEffect(() => {
    const tokenUser = getUserFromToken();
    if (tokenUser) {
      // Override profileImage if sessionStorage has it
      const storedImage = sessionStorage.getItem(
        `profileImage_${tokenUser.id}`,
      );
      if (storedImage) tokenUser.profileImage = storedImage;
      setUser(tokenUser);
    }
  }, []);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      clearSession();
      setUser(null);
      router.replace("/login");
    }, 1000);
  };

  const isHR = role === "Human Resources";

  return (
    <>
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="flex justify-between px-4 md:px-6 py-4 border-b border-black items-center">
          {isHR && toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="text-[#1C274C] bg-transparent mr-4"
            >
              {isSidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          )}

          <Image src="/images/logo.jpg" alt="Logo" width={100} height={80} />

          <div className="flex items-center gap-3 ml-auto">
            {showNewVisitButton && onNewVisitClick && (
              <button
                className="bg-[#221371] text-white px-4 py-2 rounded-lg shadow-md font-semibold text-sm"
                onClick={onNewVisitClick}
              >
                + NEW VISIT
              </button>
            )}

            {/* Profile */}
            <div className="relative">
              <div
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
              >
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile"
                    width={42}
                    height={42}
                    className={`rounded-full border-2 border-transparent hover:border-blue-500 transition-all duration-200 ${
                      isUploading ? "opacity-50 animate-pulse" : ""
                    }`}
                    onClick={handleUploadClick}
                  />
                ) : (
                  <div
                    className="w-[42px] h-[42px] rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-100"
                    onClick={handleUploadClick}
                  >
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
                <div className="text-center mt-1">
                  <div className="text-sm font-bold text-[#1C274C]">
                    {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                  </div>
                  <div className="text-xs text-gray-600">{role}</div>
                </div>
                <ChevronDownIcon className="h-5 w-5 text-black" />
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 shadow-md z-50">
                  <ul className="flex flex-col items-center py-2 text-sm text-gray-700">
                    <li
                      onClick={() => setIsConfirmLogoutOpen(true)}
                      className="w-full px-4 py-2 hover:bg-gray-100 text-[#1C274C] font-semibold cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-5 h-5 text-[#221371]" />
                      <span>Logout</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>
      </div>

      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <DualRingSpinner message="Logging out..." />
        </div>
      )}

      {isConfirmLogoutOpen && (
        <ConfirmationModal
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          onConfirm={() => {
            setIsConfirmLogoutOpen(false);
            handleLogout();
          }}
          onCancel={() => setIsConfirmLogoutOpen(false)}
        />
      )}
    </>
  );
};

export default TopBar;
