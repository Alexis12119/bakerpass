import React, { useState } from "react";
import Image from "next/image";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import EmployeeProfile from "@/components/Employee/Visitors/Modals/EmployeeProfile";
import VisitorProfileModal from "@/components/Employee/Visitors/Modals/VisitorProfile";
import axios from "axios";

interface Visitor {
  id: string;
  email: string;
  name: string;
  purpose: string;
  host: string;
  department: string;
  timeIn: string;
  timeOut: string;
  approval_status: string;
  profileImageUrl: string;
}

interface VisitorWithDropdown extends Visitor {
  isDropdownOpen: boolean;
}

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
  const [status, setStatus] = useState(visitor.approval_status);
  const handleStatusChange = async (newStatus: string) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visits/${visitor.id}/approval`,
        { statusName: newStatus },
      );
      setStatus(newStatus);
      fetchVisitors();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };
  return (
    <>
      <div className="bg-white border border-gray-300 rounded-2xl shadow-lg p-5 w-full max-w-xs sm:max-w-sm">
        {/* Profile Section */}
        <div className="flex items-start">
          <Image
            src={visitor.profileImageUrl}
            alt="Visitor"
            width={60}
            height={60}
            className="rounded-full border-2 border-gray-300 shadow-sm"
          />
          <div className="ml-4">
            <p className="text-sm text-gray-500 font-semibold">Name</p>
            <h4 className="text-sm text-gray-900">{visitor.name}</h4>

            <p className="text-sm text-gray-500 font-semibold mt-2">Purpose</p>
            <p className="text-sm text-gray-800">{visitor.purpose}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 space-y-2">
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

        {/* Status Badge */}
        {visitor.approval_status === "Approved" && (
          <div className="flex items-center mt-4 bg-green-500 text-white rounded-full py-1 px-4 w-fit">
            <CheckIcon className="h-4 w-4 mr-1" />
            <span className="text-xs font-semibold">APPROVED</span>
          </div>
        )}
      </div>

      {/* Visitor Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md z-10"></div>
      )}
      <EmployeeProfile
        visitor={visitor}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
