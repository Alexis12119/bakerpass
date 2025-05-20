"use client";

import { FC } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface StatusActionModalProps {
  title: string;
  message: string;
  onConfirm: (action: "Yes" | "No") => void;
  onClose: () => void;
}

const StatusActionModal: FC<StatusActionModalProps> = ({
  title = "Update Visitor Status",
  message,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="relative bg-white border-l-4 border-blue-500 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        {/* Close Icon */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-blue-500 transition"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-blue-600 mb-4">{title}</h2>

        {/* Message */}
        <p className="text-gray-800 mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            className="w-full px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
            onClick={onConfirm.bind(null, "Yes")}
          >
            Yes
          </button>
          <button
            className="w-full px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            onClick={onConfirm.bind(null, "No")}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusActionModal;
