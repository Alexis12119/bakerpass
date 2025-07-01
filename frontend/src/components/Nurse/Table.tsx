"use client";

import React, { useState } from "react";
import Image from "next/image";
import HighCareApprovalForm from "@/components/Nurse/Modals/HighCareApprovalForm";
import HealthDeclarationModal from "@/components/Nurse/Modals/HealthDeclaration";
import { User } from "lucide-react";
import { NurseTableProps } from "@/types/Nurse";

function toTitleCase(str?: string) {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
}

const NurseTable: React.FC<NurseTableProps> = ({
  visitors,
  statusActionModalOpen,
  setStatusActionModalOpen,
  selectedVisitor,
  setSelectedVisitor,
  handleVisitorApproval,
}) => {
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [tempHealthData, setTempHealthData] = useState<any>(null);

  return (
    <div className="bg-white shadow-md border border-gray-300 mt-3 text-center">
      <div className="hidden md:grid grid-cols-6 bg-gray-200 py-3 px-6 font-semibold text-sm text-black border-b border-gray-300">
        <div>Status</div>
        <div>Visitor's Name</div>
        <div>Purpose</div>
        <div>Host Name</div>
        <div>Department</div>
        <div>Expected Time</div>
      </div>

      {visitors.length > 0 ? (
        <div className="max-h-[400px] min-h-[340px] overflow-y-auto">
          {visitors.map((visitor) => (
            <div
              key={visitor.id}
              className="grid grid-cols-1 md:grid-cols-6 px-6 py-4 border-b border-gray-300 text-black gap-4 items-center hover:bg-gray-100 transition-colors duration-200"
            >
              {/* STATUS */}
              <div className="flex items-center justify-center">
                <div
                  className={`text-center rounded-full px-4 py-2 text-xs font-bold min-w-[140px] max-w-[160px] text-pretty transition-colors cursor-pointer
                  ${
                    visitor.approvalStatus === "Approved"
                      ? "bg-[#1C274C] text-white"
                      : visitor.approvalStatus === "Waiting For Approval"
                        ? "bg-yellow-400 text-black"
                        : visitor.approvalStatus === "Blocked"
                          ? "bg-red-600 text-white"
                          : visitor.approvalStatus === "Partial Approved"
                            ? "bg-blue-500 text-white"
                            : visitor.approvalStatus === "Nurse Approved"
                              ? "bg-green-800 text-white"
                              : visitor.approvalStatus === "Cancelled"
                                ? "bg-gray-400 text-white"
                                : "bg-white text-black"
                  }`}
                  onClick={() => {
                    if (visitor.approvalStatus === "Partial Approved") {
                      setSelectedVisitor(visitor);
                      setHealthModalOpen(true);
                    }
                  }}
                >
                  {["Approved", "Nurse Approved"].includes(
                    visitor.approvalStatus,
                  )
                    ? toTitleCase(visitor.status)
                    : toTitleCase(visitor.approvalStatus)}
                </div>
              </div>

              {/* Visitor Info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {visitor.profileImageUrl?.trim() ? (
                    <Image
                      src={visitor.profileImageUrl}
                      alt="Visitor"
                      width={48}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-500" />
                  )}
                </div>
                <span className="text-sm font-medium">{visitor.name}</span>
              </div>

              <div className="flex items-center justify-center text-sm">
                {visitor.purpose || "Not specified"}
              </div>
              <div className="flex items-center justify-center text-sm">
                {visitor.host}
              </div>
              <div className="flex items-center justify-center text-sm">
                {visitor.department}
              </div>
              <div className="flex items-center justify-center text-sm">
                {visitor.expectedTime}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-[340px] flex flex-col items-center justify-center border-t border-gray-300 px-4 py-6">
          <div className="w-full max-w-5xl space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-8 gap-4 bg-white py-4 px-6 border-b border-gray-200"
              >
                {Array.from({ length: 8 }).map((_, j) => (
                  <div
                    key={j}
                    className={`h-4 rounded bg-gray-100 ${j % 2 === 0 ? "w-3/4" : "w-2/3"}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">
            No visitors found matching your search criteria.
          </div>
        </div>
      )}

      {/* Modals */}
      {healthModalOpen && selectedVisitor && (
        <HealthDeclarationModal
          isOpen={true}
          onClose={() => setHealthModalOpen(false)}
          onSubmit={(healthData) => {
            setTempHealthData(healthData);
            setHealthModalOpen(false);
            setStatusActionModalOpen(true);
          }}
        />
      )}

      {statusActionModalOpen && selectedVisitor && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="max-w-xl w-full p-6">
            <HighCareApprovalForm
              onClose={() => setStatusActionModalOpen(false)}
              onSubmit={(formData) => {
                handleVisitorApproval("Yes", formData, tempHealthData);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseTable;
