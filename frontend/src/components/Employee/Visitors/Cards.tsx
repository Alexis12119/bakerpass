import React, { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import EmployeeProfile from "@/components/Employee/Visitors/Modals/EmployeeProfile";
import VisitorProfileModal from "@/components/Employee/Visitors/Modals/VisitorProfile";
import axios from "axios";
import { VisitorWithDropdown } from "@/types/Employee";
import { showErrorToast } from "@/utils/customToasts";

interface VisitorCardProps {
  visitor: VisitorWithDropdown;
  fetchVisitors: () => void;
}

const VisitorCard: React.FC<VisitorCardProps> = ({
  visitor,
  fetchVisitors,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVisitorProfileModalOpen, setIsVisitorProfileModalOpen] =
    useState(false);
  const [_status, setStatus] = useState(visitor.approvalStatus);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visits/${visitor.id}/approval`,
        { statusName: newStatus },
      );
      setStatus(newStatus);
    } catch (error: any) {
      showErrorToast(`Failed to update status: ${error.message}`);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-300 rounded-2xl shadow-lg p-5 w-full max-w-xs sm:max-w-sm h-[220px] flex flex-col justify-between">
        {/* Profile Section */}
        <div className="flex items-start">
          {visitor.profileImageUrl?.trim() ? (
            <Image
              src={visitor.profileImageUrl}
              alt="Visitor"
              width={60}
              height={60}
              className="rounded-full border-2 border-gray-300 shadow-sm object-cover"
            />
          ) : (
            <div className="w-[60px] h-[60px] rounded-full border-2 border-gray-300 shadow-sm flex items-center justify-center bg-gray-100">
              <User className="w-6 h-6 text-gray-400" />
            </div>
          )}
          <div className="ml-4">
            <p className="text-sm text-gray-500 font-semibold">Name</p>
            <h4 className="text-sm text-gray-900">{visitor.name}</h4>

            <p className="text-sm text-gray-500 font-semibold mt-2">Purpose</p>
            <p className="text-sm text-gray-800">{visitor.purpose}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4">
          {_status === "Approved" ||
          _status === "Blocked" ||
          _status === "Cancelled" ? (
            // Centered 2-button layout
            <div className="flex flex-col justify-center items-center h-full pt-6 pb-[42px]">
              <div className="flex justify-between gap-3">
                <button
                  className="bg-[#1C274C] text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  onClick={() => setIsVisitorProfileModalOpen(true)}
                >
                  View Profile
                </button>
                <div
                  className={`
            px-4 py-2 rounded-lg text-sm font-semibold flex justify-center items-center
            ${
              _status === "Approved"
                ? "bg-green-100 text-green-700"
                : _status === "Blocked"
                  ? "bg-gray-200 text-gray-700"
                  : "bg-red-100 text-red-700"
            }
          `}
                >
                  {_status}
                </div>
              </div>
            </div>
          ) : (
            // 4-button layout
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="bg-[#1C274C] text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  onClick={() => setIsVisitorProfileModalOpen(true)}
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleStatusChange("Blocked")}
                  className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Block
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange("Approved")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg flex justify-center items-center"
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleStatusChange("Cancelled")}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg flex justify-center items-center"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visitor Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md z-10"></div>
      )}
      <EmployeeProfile
        Visitor={visitor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileImageUrl={visitor.profileImageUrl}
        employeeId={visitor.id}
      />
      {isVisitorProfileModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md z-10"></div>
      )}
      <VisitorProfileModal
        visitor={visitor}
        isOpen={isVisitorProfileModalOpen}
        onClose={() => setIsVisitorProfileModalOpen(false)}
      />
    </>
  );
};

export default VisitorCard;
