"use client";

import { FC } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ConfirmationModalProps {
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  title = "Are you sure?",
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="relative bg-white border-l-4 border-blue-500 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        {/* Close Icon */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-blue-500 transition"
          onClick={onCancel}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold text-blue-600 mb-4">{title}</h2>

        {/* Message */}
        <p className="text-gray-800 mb-6">{message}</p>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          <button
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
