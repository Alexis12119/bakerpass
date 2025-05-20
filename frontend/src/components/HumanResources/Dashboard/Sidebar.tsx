import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  const router = useRouter();
  return (
    <div
      className={`fixed h-full bg-white text-[#1C274C] transition-all duration-100 ${
        isSidebarOpen ? "w-30" : "w-0 p-0 overflow-hidden"
      }`}
    >
      <div className="p-2">
        <div className="sticky top-0">
          <div className="flex items-center mb-2">
            <Image
              src="/images/logo.jpg"
              alt="Company Logo"
              width={150}
              height={100}
              className="rounded-full mr-3"
            />
          </div>
          <nav>
            <div 
            onClick={() => router.push("/hr")}
            className="mb-4 bg-white p-3 rounded-lg flex flex-col items-center md:hover:bg-[#1C274C] text-[#1C274C] md:hover:text-white w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-8 mr-2"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.04 16.5.5-1.5h6.42l.5 1.5H8.29Zm7.46-12a.75.75 0 0 0-1.5 0v6a.75.75 0 0 0 1.5 0v-6Zm-3 2.25a.75.75 0 0 0-1.5 0v3.75a.75.75 0 0 0 1.5 0V9Zm-3 2.25a.75.75 0 0 0-1.5 0v1.5a.75.75 0 0 0 1.5 0v-1.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-md">Dashboard</span>
            </div>
            <div 
            onClick={() => router.push("/hr/reports")}
            className="flex-col bg-white md:hover:bg-[#1C274C] text-[#1C274C] md:hover:text-white mb-4 p-3 flex items-center rounded-lg w-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-8 mr-2"
              >
                <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
              </svg>
              <span className="text-md">Reports</span>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
