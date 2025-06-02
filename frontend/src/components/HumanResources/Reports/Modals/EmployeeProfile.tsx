import React from "react";
import Image from "next/image";

interface Employee {
  id: string;
  name: string;
  department: string;
  total_visitors: number;
  avg_visitors: number;
}

interface EmployeeProfileModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

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
            className="absolute top-2 right-2 text-[#1C274C] bg-white p-2 rounded-lg"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Employee image with blue background */}
        <div className="bg-[#0D1F72] h-36 flex justify-center items-center">
          <div className="w-24 h-24 relative overflow-hidden">
            <Image
              src="/images/jiro.jpg"
              fill={true}
              alt=""
              className="w-full rounded-full"
            />{" "}
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
