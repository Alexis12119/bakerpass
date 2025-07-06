import React from "react";
import Image from "next/image";
import { EmployeeProfileModalProps } from "@/types/HumanResources/Reports";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { User } from "lucide-react";

const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  employee,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-10">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full border border-black">
        {/* Close button */}
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white bg-gray-100 p-1 rounded-lg"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        {/* Employee image with blue background */}
        <div className="bg-[#0D1F72] h-36 flex justify-center items-center">
          <div className="w-24 h-24 relative overflow-hidden">
            {employee.profileImageUrl?.trim() ? (
              <Image
                src={employee.profileImageUrl}
                alt="Profile Image"
                fill
                className="object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-full bg-gray-100 border-gray-300">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Employee details */}
        <div className="p-5 text-center">
          <h2 className="text-xl font-bold text-black">{employee.name}</h2>
        </div>

        {/* Stats section */}
        <div className="flex justify-around p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600">Visitors</p>

            <p className="text-xl font-bold text-black">
              {employee.total_visitors}
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-600">Avg Visitors</p>

            <p className="text-xl font-bold text-black">
              {employee.avg_visitors}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
