import React from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { User } from "lucide-react";
import { VisitorProfileModalProps } from "@/types/Employee";

const VisitorProfileModal: React.FC<VisitorProfileModalProps> = ({
  visitor,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full border border-black shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-gray-100 rounded-lg"
        >
          <XMarkIcon className="h-5 w-5 text-gray-700" />
        </button>

        {/* Header */}
        <div className="bg-[#0D1F73] h-40 flex justify-center items-center">
          <div className="w-20 h-20 relative overflow-hidden rounded-full">
            {visitor.profileImageUrl?.trim() ? (
              <Image
                src={visitor.profileImageUrl}
                alt="Visitor"
                width={60}
                height={60}
                className="rounded-full border-2 border-gray-300 shadow-sm object-cover"
              />
            ) : (
              <div className="w-[80px] h-[80px] rounded-full border-2 border-gray-300 shadow-sm flex items-center justify-center bg-gray-100">
                <User className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 text-center text-black">
          <h2 className="text-xl font-bold">{visitor.name}</h2>
          <p>
            <strong>Email:</strong> {visitor.email}
          </p>

          <div className="mt-3 space-y-2 text-sm text-left">
            {visitor.contactNumber && (
              <p>
                <strong>Contact Number:</strong> {visitor.contactNumber}
              </p>
            )}
            {visitor.address && (
              <p>
                <strong>Address:</strong> {visitor.address}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorProfileModal;
