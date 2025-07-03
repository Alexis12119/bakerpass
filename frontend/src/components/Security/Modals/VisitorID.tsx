import React, { useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import axios from "axios";
import { IDType, VisitorIDModalProps } from "@/types/Security";
import { XMarkIcon } from "@heroicons/react/24/solid";

const VisitorIDModal: React.FC<VisitorIDModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [idTypes, setIdTypes] = useState<IDType[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/valid-id-types`)
        .then((res) => setIdTypes(res.data))
        .catch(console.error);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <DialogTitle className="text-black text-lg font-semibold text-center mb-4">
            Please provide the visitor's valid ID type
          </DialogTitle>

          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            className="text-black w-full border border-gray-300 rounded-md px-4 py-2 mb-4"
          >
            <option value="" disabled>
              Select ID type (e.g., Driver’s License, Passport)
            </option>
            {idTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          <p className="text-xs text-gray-600 mb-5 text-center">
            Note: Ensure the ID matches the person before proceeding.
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => selectedId && onSubmit(selectedId)}
              disabled={!selectedId}
              className={`px-6 py-2 rounded-lg ${
                selectedId
                  ? "bg-[#1C274C] text-white hover:bg-[#1a2344]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Submit
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default VisitorIDModal;
