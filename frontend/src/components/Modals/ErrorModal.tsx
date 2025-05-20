"use client";

import { FC } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: FC<ErrorModalProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="relative bg-white border-l-4 border-red-600 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        {/* X Icon */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-red-600 transition"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-lg font-semibold text-red-600 mb-4">Error</h2>
        <p className="text-gray-800">{message}</p>
      </div>
    </div>
  );
};

export default ErrorModal;
