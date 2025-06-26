import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { LayoutDashboard, BarChart2 } from "lucide-react";

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
              className="rounded-full mr-3 h-auto w-auto"
            />
          </div>
          <nav>
            <div
              onClick={() => router.push("/hr")}
              className="mb-4 bg-white p-3 rounded-lg flex flex-col items-center md:hover:bg-[#1C274C] text-[#1C274C] md:hover:text-white w-full"
            >
              <LayoutDashboard className="size-8 mb-1" />
              <span className="text-md">Dashboard</span>
            </div>
            <div
              onClick={() => router.push("/hr/reports")}
              className="flex-col bg-white md:hover:bg-[#1C274C] text-[#1C274C] md:hover:text-white mb-4 p-3 flex items-center rounded-lg w-full"
            >
              <BarChart2 className="size-8 mb-1" />
              <span className="text-md">Reports</span>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
