"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import HumanResourcesProfile from "@/components/HumanResources/Modals/HumanResourcesProfile";
import ConfirmationModal from "@/components/Modals/ConfirmationModal";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/router";
import {
  TopBarProps,
  HumanResourcesWithDropdown,
} from "@/types/HumanResources/Reports";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";

const TopBar: React.FC<TopBarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    profileImage: string;
    role: string;
  } | null>(null);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const updateProfileImageStorage = (
    newProfileImageUrl: string,
    userId: string,
  ) => {
    const profileImageKey = `profileImage_${userId}`;
    sessionStorage.setItem(profileImageKey, newProfileImageUrl);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showErrorToast("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showErrorToast(
        "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
      );
      return;
    }

    setIsUploading(true);
    document.body.style.overflow = "hidden";
    const formData = new FormData();
    formData.append("file", file);

    const query = new URLSearchParams({
      userId: user.id.toString(),
      role: "Human Resources",
    });

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/upload-profile-image?${query.toString()}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 60000,
        },
      );

      const data = response.data;
      setUser((prev) =>
        prev ? { ...prev, profileImage: data.imageUrl } : prev,
      );
      updateProfileImageStorage(data.imageUrl, user.id.toString());
      showSuccessToast("Profile image updated successfully!");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
      showErrorToast(
        error.response?.data?.message ||
          "An error occurred while uploading the image.",
      );
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
      document.body.style.overflow = "";
    }
  };

  const getProfileImageUrl = (userId: string, defaultFromToken?: string) => {
    const profileImageKey = `profileImage_${userId}`;
    const storedProfileImage = sessionStorage.getItem(profileImageKey);
    return storedProfileImage || defaultFromToken || "";
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token) as any;
        const profileImageUrl = getProfileImageUrl(
          decoded.id.toString(),
          decoded.profileImage,
        );
        setUser({
          id: decoded.id,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          role: decoded.role,
          profileImage: profileImageUrl,
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const profileImageKey = `profileImage_${user.id}`;
    const storedProfileImage = sessionStorage.getItem(profileImageKey);
    if (storedProfileImage && storedProfileImage !== user.profileImage) {
      setUser((prev) =>
        prev ? { ...prev, profileImage: storedProfileImage } : prev,
      );
    }
  }, [user]);

  const humanResources: HumanResourcesWithDropdown = {
    id: user?.id || 0,
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    profileImageUrl: user?.profileImage || "/default-profile.png",
    isDropdownOpen: false,
  };

  const handleLogout = () => {
    setIsConfirmLogoutOpen(false);
    setIsLoggingOut(true);
    setTimeout(() => {
      for (const key in sessionStorage) {
        if (key.startsWith("profileImage_")) {
          sessionStorage.removeItem(key);
        }
      }
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("lastValidRoute");
      sessionStorage.removeItem("role");
      sessionStorage.removeItem("visitor_filter_date");
      setUser(null);
      router.replace("/login");
    }, 1000);
  };

  return (
    <div className="sticky top-0 bg-white z-10 p-4 shadow-sm flex justify-between items-center mb-8">
      <button onClick={toggleSidebar} className="text-[#1C274C] bg-transparent">
        {isSidebarOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      <div className="relative min-w-max">
        <div
          className="flex items-center space-x-2"
          onClick={(e) => {
            // Only toggle dropdown if not clicking on profile image
            const target = e.target as HTMLElement;
            if (!target.closest("[data-profile-image]")) {
              setIsOpen((prev) => !prev);
            }
          }}
        >
          {/* Wrap profile image in its own relative container */}
          <div className="relative" data-profile-image>
            {user?.profileImage?.trim() ? (
              <Image
                src={user.profileImage}
                alt="Profile"
                width={42}
                height={42}
                className={`rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-200 ${
                  isUploading ? "opacity-50 animate-pulse" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUploadClick(e);
                }}
                title="Click to change profile image"
              />
            ) : (
              <div
                className="w-[42px] h-[42px] rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-100 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUploadClick(e);
                }}
                title="Click to change profile image"
              >
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}

            {/* Loading spinner positioned relative to profile image */}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Hidden file input - positioned to prevent scrolling */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />

          <div className="text-left">
            <div className="text-sm font-bold text-[#1C274C]">
              {user ? `${user.firstName} ${user.lastName}` : "Guest"}
            </div>
            <div className="text-xs text-gray-600">Human Resources</div>
          </div>

          <ChevronDownIcon className="h-5 w-5 text-black" />
        </div>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 shadow-md z-50">
            <ul className="py-2 text-sm text-gray-700">
              <li
                onClick={() => {
                  setIsOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="px-4 py-2 hover:bg-gray-100 text-[#1C274C] text-md font-semibold cursor-pointer"
              >
                <div className="flex items-center justify-center space-x-2">
                  <User className="w-5 h-5 text-[#221371]" />
                  <span>Profile</span>
                </div>
              </li>
              <li
                onClick={() => {
                  setIsOpen(false);
                  setIsConfirmLogoutOpen(true);
                }}
                className="px-4 py-2 hover:bg-gray-100 text-[#1C274C] text-sm font-semibold cursor-pointer"
              >
                <div className="flex items-center justify-center space-x-2">
                  <LogOut className="w-5 h-5 text-[#221371]" />
                  <span>Logout</span>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>

      {isConfirmLogoutOpen && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={handleLogout}
          onCancel={() => setIsConfirmLogoutOpen(false)}
        />
      )}
      <HumanResourcesProfile
        visitor={humanResources}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profileImageUrl={user?.profileImage ?? ""}
      />

      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity">
          <div className="relative w-14 h-14">
            <div className="absolute w-full h-full border-[5px] border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="absolute w-full h-full border-[5px] border-dashed border-[#1C274C] border-t-transparent rounded-full animate-[spin_2s_linear_infinite]" />
          </div>
          <span className="mt-4 text-[#1C274C] font-medium text-lg animate-pulse">
            Logging out...
          </span>
        </div>
      )}
    </div>
  );
};

export default TopBar;
