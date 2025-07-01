import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { LayoutDashboard, BarChart2, X } from "lucide-react";
import { SidebarProps } from "@/types/HumanResources/Dashboard";

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const router = useRouter();

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white text-[#1C274C]
        shadow-xl transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.jpg"
              alt="Company Logo"
              width={100}
              height={60}
              className="rounded-full object-cover"
            />
          </div>
          <button
            onClick={toggleSidebar}
            className="text-[#1C274C] hover:text-red-500"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          <SidebarLink
            icon={LayoutDashboard}
            label="Dashboard"
            onClick={() => router.push("/hr")}
          />
          <SidebarLink
            icon={BarChart2}
            label="Reports"
            onClick={() => router.push("/hr/reports")}
          />
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 text-xs text-gray-500">
          © {new Date().getFullYear()} HR Department
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

interface SidebarLinkProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon: Icon,
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left text-sm font-medium hover:bg-[#1C274C] hover:text-white transition-colors"
  >
    <Icon className="w-5 h-5 text-[#1C274C] group-hover:text-white transition-colors" />
    <span>{label}</span>
  </button>
);
