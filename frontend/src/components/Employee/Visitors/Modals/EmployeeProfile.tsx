"use client";

import Image from "next/image";
import { User } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { EmployeeProfileModalProps } from "@/types/Employee/Profile";

const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  Visitor: visitor,
  isOpen,
  onClose,
  profileImageUrl,
}) => {
  const isValidImage = profileImageUrl && profileImageUrl.trim() !== "";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full border border-black shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-gray-100 rounded-lg"
        >
          <XMarkIcon className="h-5 w-5 text-gray-700" />
        </button>

        <div className="bg-[#0D1F73] h-40 flex justify-center items-center">
          <div className="w-20 h-20 relative overflow-hidden rounded-full bg-white">
            {isValidImage ? (
              <Image
                src={profileImageUrl}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
        </div>

        <div className="p-5 text-center">
          <h2 className="text-xl font-bold text-black">{visitor.name}</h2>
          <p className="text-sm text-gray-500">{visitor.department}</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
