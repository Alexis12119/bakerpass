import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import EmployeeProfileModal from "@/components/Employee/Visitors/Modals/EmployeeProfile";
import ConfirmationModal from "@/components/Modals/ConfirmationModal";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";
import { DualRingSpinner } from "@/components/common/DualRingSpinner";

interface Employee {
  id: string;
  name: string;
  department: string;
  profileImageUrl: string;
}

interface EmployeeWithDropdown extends Employee {
  isDropdownOpen: boolean;
}

const TopBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage: string;
  } | null>(null);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const formData = new FormData();
    formData.append("file", file);

    const query = new URLSearchParams({
      userId: user.id.toString(),
      role: user.role,
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
      showErrorToast("An error occurred while uploading the image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setIsUploading(false);
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
      } catch (error: any) {
        showErrorToast(`Error decoding token: ${error.message}`);
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

  const visitor: EmployeeWithDropdown = {
    id: user?.id || "",
    name: user?.firstName + " " + user?.lastName || "Guest",
    department: "Employee",
    profileImageUrl: user?.profileImage || "/jiro.png",
    isDropdownOpen: false,
  };
  const handleLogout = () => {
    setIsConfirmLogoutOpen(false); //Immediately close the modal
    setIsLoggingOut(true); // Start showing spinner

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
    }, 1000); // Optional delay for animation
  };

  console.log(user);
  return (
    <div className="sticky top-0 bg-white z-10 p-4 shadow-sm flex justify-between items-center mb-8">
      <div className="flex items-center space-x-2">
        <Image
          src="/images/logo.jpg"
          alt="Company Logo"
          width={100}
          height={80}
          className="rounded-full mr-3 h-auto w-auto"
        />
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          {isProfileModalOpen && (
            <div className="fixed inset-0 backdrop-blur-md z-10"></div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            {user?.profileImage?.trim() ? (
              <Image
                src={user.profileImage}
                alt=""
                width={42}
                height={42}
                className={`rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-200 ${
                  isUploading ? "opacity-50 animate-pulse" : ""
                }`}
                onClick={handleUploadClick}
                title="Click to change profile image"
              />
            ) : (
              <div
                className="w-[42px] h-[42px] rounded-full cursor-pointer border-2 border-gray-300 flex items-center justify-center bg-gray-100"
                onClick={handleUploadClick}
                title="Click to change profile image"
              >
                <User className="w-5 h-5 text-gray-400" />
              </div>
            )}
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          <div className="relative">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div>
                <div className="text-sm font-bold text-[#1C274C]">
                  {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                </div>
                <div className="text-xs text-gray-600">Employee</div>
              </div>
              <ChevronDownIcon className="h-5 w-5 text-black mr-4 ml-2" />
            </div>
            {isOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white border-b">
                <ul className="py-2 text-sm text-gray-700">
                  <li
                    onClick={() => setIsProfileModalOpen(true)}
                    className="px-4 py-2 hover:bg-gray-100 text-[#1C274C] text-md text-center font-semibold cursor-pointer"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <User className="w-5 h-5 text-[#221371]" />
                      <span>Profile</span>
                    </div>
                  </li>

                  <li
                    onClick={() => setIsConfirmLogoutOpen(true)}
                    className="px-4 py-2 hover:bg-gray-100 text-[#1C274C] text-sm text-center font-semibold cursor-pointer"
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
        </div>
      </div>

      {isConfirmLogoutOpen && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={handleLogout}
          onCancel={() => setIsConfirmLogoutOpen(false)}
        />
      )}

      <EmployeeProfileModal
        Visitor={visitor}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profileImageUrl={user?.profileImage}
        employeeId={user?.id || ""}
      />

      {isLoggingOut && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity">
          <DualRingSpinner message="Logging out..." />
        </div>
      )}
    </div>
  );
};

export default TopBar;
