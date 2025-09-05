import React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { User, LogOut } from "lucide-react";
import { PlusIcon } from "@heroicons/react/24/solid";

type DropdownMenuProps = {
  user: { firstName: string; lastName: string; profileImage?: string } | null;
  role: string;
  isUploading: boolean;
  onLogoutClick: () => void;
  onUploadClick: () => void;
  onScheduleClick?: () => void;
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  user,
  role,
  isUploading,
  onUploadClick,
  onLogoutClick,
  onScheduleClick,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt="Profile"
            className={`w-[42px] h-[42px] rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500 ${
              isUploading ? "opacity-50 animate-pulse" : ""
            }`}
            onClick={onUploadClick}
          />
        ) : (
          <div
            className="w-[42px] h-[42px] rounded-full cursor-pointer border-2 border-gray-300 flex items-center justify-center bg-gray-100"
            onClick={onUploadClick}
          >
            <User className="w-5 h-5 text-gray-400" />
          </div>
        )}
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
            <div className="text-xs text-gray-600">{role}</div>
          </div>
          <ChevronDownIcon className="h-5 w-5 text-black mr-4 ml-2" />
        </div>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-60 bg-white border-b shadow">
            <ul className="py-2 text-sm text-gray-700">
              {/* Show Manage Schedule only for Employee */}
              {role === "Employee" && onScheduleClick && (
                <li
                  onClick={onScheduleClick}
                  className="px-4 py-2 hover:bg-gray-100 flex items-center justify-center gap-2 font-semibold text-[#1C274C] cursor-pointer"
                >
                  <PlusIcon className="w-5 h-5 text-[#221371]" />
                  Manage Schedule
                </li>
              )}

              {/* Logout */}
              <li
                onClick={onLogoutClick}
                className="px-4 py-2 hover:bg-gray-100 flex items-center justify-center gap-2 font-semibold text-[#1C274C] cursor-pointer"
              >
                <LogOut className="w-5 h-5 text-[#221371]" />
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
