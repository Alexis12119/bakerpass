import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BellIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import NewVisitModal from "@/components/Nurse/Modals/NewVisit";
import SecurityProfileModal from "@/components/Nurse/Modals/SecurityProfile";
import ConfirmationModal from "@/components/Modals/ConfirmationModal";
import { jwtDecode } from "jwt-decode";

interface Security {
  id: string;
  name: string;
  department: string;
}

interface SecurityWithDropdown extends Security {
  isDropdownOpen: boolean;
}

const TopBar = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);

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
            // add any other fields you have in your token payload
          };
          setUser({
            id: decoded.id,
            firstName: decoded.firstName,
            lastName: decoded.lastName,
            role: decoded.role,
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
    id: user?.id || "",
    name: user?.firstName + " " + user?.lastName || "Guest",
    isDropdownOpen: false, // Required property from VisitorWithDropdown
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
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
              alt=""
              width={150}
              height={100}
              className="rounded-full mr-3"
              // alt={`${visitor.name} profile`}
            />
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative"
              >
                <BellIcon className="h-6 w-6 text-yellow-500" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white border rounded-lg shadow-lg p-3">
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

            <div
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2"
            >
              <Image
                src="/images/jiro.jpg"
                alt=""
                width={42}
                height={42}
                className="rounded-full mr-3"
                // alt={`${visitor.name} profile`}
              />
              <div>
                <div className="relative">
                  <div className="flex items-center cursor-pointer">
                    <div>
                      <div className="text-sm font-bold text-[#1C274C]">
                        {user ? `${user.firstName} ${user.lastName}` : "Guest"}
                      </div>
                      <div className="text-xs text-gray-600">Nurse</div>
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
      </div>

      {isConfirmLogoutOpen && (
        <ConfirmationModal
          message="Are you sure you want to log out?"
          onConfirm={handleLogout}
          onCancel={() => setIsConfirmLogoutOpen(false)}
        />
      )}

      <SecurityProfileModal
        visitor={security}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};

export default TopBar;
