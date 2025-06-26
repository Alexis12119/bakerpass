"use client";

import { FC } from "react";
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HandThumbDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

interface StatusActionModalProps {
  title?: string;
  message: string;
  onConfirm: (
    action: "Approved" | "Blocked" | "Cancelled" | "Partial Approved",
  ) => void;
  onClose: () => void;
}

const StatusActionModal: FC<StatusActionModalProps> = ({
  title = "Action Required for Visitor Approval",
  message,
  onConfirm,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="relative bg-white border-l-4 border-blue-600 rounded-2xl shadow-2xl p-6 max-w-sm w-full">
        {/* Close Icon */}
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-blue-500 transition"
          onClick={onClose}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-blue-700 mb-3">{title}</h2>

        {/* Message */}
        <p className="text-gray-700 mb-6">{message}</p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onConfirm("Approved")}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            <CheckCircleIcon className="h-5 w-5" />
            Approve Visitor
          </button>

          <button
            onClick={() => onConfirm("Partial Approved")}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Move to Clinic
          </button>

          <button
            onClick={() => onConfirm("Blocked")}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            <HandThumbDownIcon className="h-5 w-5" />
            Block Visitor
          </button>

          <button
            onClick={() => onConfirm("Cancelled")}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500 transition"
          >
            <ExclamationTriangleIcon className="h-5 w-5" />
            Cancel Visit
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusActionModal;
