import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import NewVisitModal from "@/components/Security/Modals/NewVisit";
import SecurityProfileModal from "@/components/Security/Modals/SecurityProfile";
import ConfirmationModal from "@/components/Modals/ConfirmationModal";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { User, LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { TopBarProps, SecurityWithDropdown } from "@/types/Security";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";

const TopBar = ({ fetchVisitors }: TopBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    firstName: string;
    lastName: string;
    role: string;
    profileImage: string;
  } | null>(null);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  // ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger the hidden file input click
  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from opening when clicking profile image
    fileInputRef.current?.click();
  };

  // Alternative: Store profile image URL separately
  const updateProfileImageStorage = (
    newProfileImageUrl: string,
    userId: string,
  ) => {
    // Store profile image URL in a separate storage key
    const profileImageKey = `profileImage_${userId}`;
    sessionStorage.setItem(profileImageKey, newProfileImageUrl);
  };

  // Updated handleFileChange function
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // File validation
    const maxSize = 5 * 1024 * 1024; // 5MB
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
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000,
        },
      );

      const data = response.data;

      // Update user state with new profile image
      setUser((prev) => {
        if (!prev) return prev;
        return { ...prev, profileImage: data.imageUrl };
      });

      // Method 1: Update JWT token (not recommended for production)
      // updateJWTToken(data.imageUrl);

      // Method 2: Store profile image separately (recommended)
      updateProfileImageStorage(data.imageUrl, user.id.toString());

      showSuccessToast("Profile image updated successfully!");

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "An error occurred while uploading the image.";
      showErrorToast(message);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Function to get profile image URL (use this when loading user data)
  const getProfileImageUrl = (userId: string, defaultFromToken?: string) => {
    const profileImageKey = `profileImage_${userId}`;
    const storedProfileImage = sessionStorage.getItem(profileImageKey);
    return storedProfileImage || defaultFromToken || "";
  };

  // Use this in your user initialization code
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
          profileImage: profileImageUrl, // Use the updated URL if available
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token) as {
            id: number;
            firstName: string;
            lastName: string;
            role: string;
            profileImage: string;
          };
          setUser({
            id: decoded.id,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            role: decoded.role,
            profileImage: decoded.profileImage,
          });
        } catch (error) {
          console.error("Invalid token:", error);
          setUser(null);
          sessionStorage.removeItem("token");
        }
      } else {
        setUser(null);
      }
    }
  }, []);

  const security: SecurityWithDropdown = {
    id: user?.id?.toString() || "",
    name: user?.firstName + " " + user?.lastName || "Guest",
    isDropdownOpen: false,
    profileImageUrl: user?.profileImage || "",
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
    }, 1000); // Optional delay for animation
  };
  return (
    <>
      {/* 🔹 Top Bar (Full width) */}
      <div className="sticky top-0 z-50 bg-white w-full shadow-md">
        <div className="flex flex-wrap items-center justify-between px-4 md:px-6 py-4 border-b border-black">
          <div className="flex items-center space-x-2">
            <Image
              src="/images/logo.jpg"
              alt="Company Logo"
              width={100}
              height={80}
              className="rounded-full mr-3 h-auto w-auto"
            />
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              className="bg-[#221371] text-white px-3 md:text-xs md:px-4 py-2 rounded-lg shadow-md font-semibold text-sm"
              onClick={() => setIsNewVisitModalOpen(true)}
            >
              + NEW VISIT
            </button>

            <div className="flex items-center space-x-2">
              <div className="relative">
                {user?.profileImage?.trim() ? (
                  <Image
                    src={user.profileImage}
                    alt="Profile Image"
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
                {/* Hidden file input */}
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
                    <div className="text-xs text-gray-600">Security Guard</div>
                  </div>
                  <ChevronDownIcon className="h-5 w-5 text-black mr-4 ml-2" />
                </div>
                {isProfileModalOpen && (
                  <div className="fixed inset-0 backdrop-blur-md z-10"></div>
                )}
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
        </div>
      </div>

      {isConfirmLogoutOpen && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={handleLogout}
          onCancel={() => setIsConfirmLogoutOpen(false)}
        />
      )}

      {/* New Visit Modal */}
      <NewVisitModal
        isOpen={isNewVisitModalOpen}
        onClose={() => setIsNewVisitModalOpen(false)}
        fetchVisitors={fetchVisitors}
      />
      <SecurityProfileModal
        visitor={security}
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
    </>
  );
};

export default TopBar;
