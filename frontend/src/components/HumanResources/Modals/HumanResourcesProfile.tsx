import React from "react";
import Image from "next/image";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
interface HumanResources {
  id: string;
  name: string;
  department: string;
}

interface HumanResourcesWithDropdown extends HumanResources {
  isDropdownOpen: boolean;
}

interface HumanResourcesProfileModalProps {
  visitor: HumanResourcesWithDropdown;
  isOpen: boolean;
  onClose: () => void;
}

const HumanResourcesProfileModal: React.FC<HumanResourcesProfileModalProps> = ({
  visitor,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
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
          <div className="w-20 h-20 relative overflow-hidden">
            <Image
              src="/images/jiro.jpg"
              fill={true}
              alt=""
              className="w-full rounded-full"
            />{" "}
          </div>
        </div>

        {/* Visitor details */}
        <div className="p-5 text-center">
          <h2 className="text-xl font-bold text-black">{visitor.name}</h2>
          <p className="text-gray-600">{visitor.department}</p>
        </div>
      </div>
    </div>
  );
};

export default HumanResourcesProfileModal;
