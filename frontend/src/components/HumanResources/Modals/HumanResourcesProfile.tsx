import React from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { HumanResourcesProfileModalProps } from "@/types/HumanResources";
import { User } from "lucide-react";

const HumanResourcesProfileModal: React.FC<HumanResourcesProfileModalProps> = ({
  visitor,
  isOpen,
  onClose,
  profileImageUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full border border-black shadow-lg">
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

        {/* Visitor image with blue background */}
        <div className="bg-[#0D1F73] h-40 flex justify-center items-center">
          <div className="w-24 h-24 relative rounded-full overflow-hidden border-4 border-white">
            {profileImageUrl?.trim() ? (
              <Image
                src={profileImageUrl}
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

        {/* Visitor details */}
        <div className="p-5 text-center">
          <h2 className="text-xl font-bold text-black">
            {visitor.firstName} {visitor.lastName}
          </h2>
          <p className="text-gray-600">Human Resources</p>
        </div>
      </div>
    </div>
  );
};

export default HumanResourcesProfileModal;
