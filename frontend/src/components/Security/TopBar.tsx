import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { BellIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import NewVisitModal from "@/components/Security/Modals/NewVisit";
import SecurityProfileModal from "@/components/Security/Modals/SecurityProfile";
import ConfirmationModal from "@/components/Modals/ConfirmationModal";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface Security {
  id: string;
  name: string;
  profileImage: string;
}

interface SecurityWithDropdown extends Security {
  isDropdownOpen: boolean;
}

interface TopBarProps {
  fetchVisitors: () => Promise<void>;
}

const TopBar = ({ fetchVisitors }: TopBarProps) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
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

  // ref for hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trigger the hidden file input click
  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dropdown from opening when clicking profile image
    fileInputRef.current?.click();
  };

  // Helper function to update JWT token
  const updateJWTToken = (newProfileImageUrl: string) => {
    try {
      const currentToken = sessionStorage.getItem("token");
      if (!currentToken) return;

      const decoded = jwtDecode(currentToken) as any;

      // Create updated payload
      const updatedPayload = {
        ...decoded,
        profileImage: newProfileImageUrl,
        // Update the issued at time to current time
        iat: Math.floor(Date.now() / 1000),
      };

      // Note: This creates a "fake" token that won't be validated by the backend
      // But it will persist the profile image URL for frontend display
      const updatedTokenString = btoa(
        JSON.stringify({
          header: { alg: "HS256", typ: "JWT" },
          payload: updatedPayload,
          signature: "frontend-updated", // Placeholder signature
        }),
      );

      // Store the updated token
      sessionStorage.setItem("token", updatedTokenString);

      return true;
    } catch (error) {
      console.error("Error updating JWT token:", error);
      return false;
    }
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
      alert("File size must be less than 5MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
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

      alert("Profile image updated successfully!");

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      const message =
        error.response?.data?.message ||
        "An error occurred while uploading the image.";
      alert(message);

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
    return storedProfileImage || defaultFromToken || "/default-profile.png";
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
  };

  const handleLogout = () => {
    // Clear all session storage keys that start with "profileImage_"
    for (const key in sessionStorage) {
      if (key.startsWith("profileImage_")) {
        sessionStorage.removeItem(key);
      }
    }

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("lastValidRoute");
    sessionStorage.removeItem("role");

    setUser(null);
    window.location.href = "/login";
    setIsConfirmLogoutOpen(false);
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
              width={150}
              height={100}
              className="rounded-full mr-3"
            />
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <button
              className="bg-[#221371] text-white px-3 md:text-xs md:px-4 py-2 rounded-lg shadow-md font-semibold text-sm"
              onClick={() => setIsNewVisitModalOpen(true)}
            >
              + NEW VISIT
            </button>

            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative"
              >
                <BellIcon className="h-6 w-6 text-yellow-500" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg p-3 z-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Notifications
                  </h3>
                  <ul className="text-sm text-gray-600">
                    <li className="py-2 border-b">New visitor checked in.</li>
                    <li className="py-2 border-b">
                      Package delivered at the front desk.
                    </li>
                    <li className="py-2">
                      Security alert: Unusual activity detected.
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Image
                  src={user?.profileImage}
                  alt="Profile Image"
                  width={42}
                  height={42}
                  className={`rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all duration-200 ${
                    isUploading ? "opacity-50 animate-pulse" : ""
                  }`}
                  onClick={handleUploadClick}
                  title="Click to change profile image"
                />
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
                        className="px-4 py-2 hover:bg-gray-100 text-[#1C274C] text-md text-center font-semibold"
                      >
                        <div className="flex items-center flex-row space-x-2 ml-13">
                          <svg
                            width="20"
                            height="19"
                            viewBox="0 0 20 19"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="mr-2"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M13.7504 5.69999C13.7504 3.60429 12.019 1.89999 9.88997 1.89999C7.76096 1.89999 6.02956 3.60429 6.02956 5.69999C6.02956 7.7957 7.76096 9.49999 9.88997 9.49999C12.019 9.49999 13.7504 7.7957 13.7504 5.69999ZM17.4023 19H15.6806C15.1478 19 14.7155 18.5744 14.7155 18.05C14.7155 17.5256 15.1478 17.1 15.6806 17.1H16.0946C16.7624 17.1 17.2556 16.4378 17.0028 15.8289C15.834 13.0131 13.0893 11.4 9.88997 11.4C6.69066 11.4 3.94591 13.0131 2.77717 15.8289C2.52431 16.4378 3.0175 17.1 3.68535 17.1H4.09936C4.63209 17.1 5.06446 17.5256 5.06446 18.05C5.06446 18.5744 4.63209 19 4.09936 19H2.37762C1.17124 19 0.22158 17.9141 0.477332 16.7542C1.17992 13.5631 3.37361 11.2081 6.26313 10.1393C4.9448 9.09526 4.09936 7.4955 4.09936 5.69999C4.09936 2.32654 7.07574 -0.361972 10.5839 0.039878C13.126 0.330578 15.2318 2.32458 15.613 4.81643C15.9411 6.96439 15.0484 8.92616 13.5168 10.1393C16.4063 11.2081 18.6 13.5631 19.3026 16.7542C19.5584 17.9141 18.6087 19 17.4023 19ZM12.7853 18.05C12.7853 18.5744 12.3529 19 11.8202 19H7.95977C7.42703 19 6.99466 18.5744 6.99466 18.05C6.99466 17.5256 7.42703 17.1 7.95977 17.1H11.8202C12.3529 17.1 12.7853 17.5256 12.7853 18.05Z"
                              fill="#221371"
                            />
                          </svg>
                          Profile
                        </div>
                      </li>
                      <li>
                        <li
                          onClick={() => setIsConfirmLogoutOpen(true)}
                          className="block px-4 py-2 hover:bg-gray-100 text-[#1C274C] text-sm text-center font-semibold"
                        >
                          <div className="flex items-center flex-row space-x-2 ml-13">
                            <svg
                              width="14"
                              height="9"
                              viewBox="0 0 14 9"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="mr-2"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.26739 8.69227C5.59804 8.34446 5.59804 7.78054 5.26739 7.43274L3.32612 5.39063L12.571 5.39063C13.0387 5.39063 13.4177 4.99187 13.4177 4.5C13.4177 4.00814 13.0387 3.60938 12.571 3.60938L3.32612 3.60938L5.26739 1.56723C5.59804 1.21942 5.59804 0.655591 5.26739 0.307772C4.93673 -0.0400467 4.40073 -0.0400467 4.07007 0.307772L0.683364 3.87027C0.352708 4.21809 0.352708 4.78192 0.683364 5.12973L4.07007 8.69227C4.40073 9.04008 4.93673 9.04008 5.26739 8.69227Z"
                                fill="#1C274C"
                              />
                            </svg>
                            Logout
                          </div>
                        </li>
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
        profileImageUrl={user?.profileImage}
      />
    </>
  );
};

export default TopBar;
