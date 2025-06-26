"use client";

import React, { useState } from "react";
import Image from "next/image";
import HighCareApprovalForm from "@/components/Nurse/Modals/HighCareApprovalForm";
import HealthDeclarationModal from "@/components/Nurse/Modals/HealthDeclaration";
import { User } from "lucide-react";
import { NurseTableProps } from "@/types/Nurse";

function toTitleCase(str?: string) {
  if (!str) return ""; // Return empty string if str is undefined/null/empty

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
        <div className="max-h-[400px] overflow-y-auto">
          {visitors.map((visitor) => (
            <div
              key={visitor.id}
              className="grid grid-cols-1 md:grid-cols-6 py-3 px-6 border-b border-gray-300 !text-black gap-4"
            >
              <div
                className={`relative inline-block text-center border rounded-lg px-3 py-1 cursor-pointer ${
                  visitor.approvalStatus === "Approved"
                    ? "bg-[#1C274C]"
                    : visitor.approvalStatus === "Waiting For Approval"
                      ? "bg-yellow-400"
                      : visitor.approvalStatus === "Blocked"
                        ? "bg-red-600"
                        : visitor.approvalStatus === "Partial Approved"
                          ? "bg-blue-500"
                          : visitor.approvalStatus === "Nurse Approved"
                            ? "bg-green-800"
                            : visitor.approvalStatus === "Cancelled"
                              ? "bg-gray-400"
                              : "bg-white"
                }`}
                onClick={() => {
                  if (visitor.approvalStatus === "Partial Approved") {
                    setSelectedVisitor(visitor);
                    setHealthModalOpen(true);
                  }
                }}
              >
                <span
                  className={`text-xs font-bold text-center block ${
                    visitor.approvalStatus === "Approved"
                      ? "text-white"
                      : visitor.approvalStatus === "Waiting For Approval"
                        ? "text-black"
                        : "text-white"
                  }`}
                >
                  {["Approved", "Nurse Approved"].includes(
                    visitor.approvalStatus,
                  )
                    ? toTitleCase(visitor.status)
                    : toTitleCase(visitor.approvalStatus)}
                </span>
              </div>

              <div className="flex items-center">
                {visitor.profileImageUrl?.trim() ? (
                  <Image
                    src={visitor.profileImageUrl}
                    alt="Visitor"
                    width={32}
                    height={32}
                    className="rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className="w-16 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <User className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <span className="text-sm font-medium">{visitor.name}</span>
              </div>
              <div className="text-sm pt-2">{visitor.purpose}</div>
              <div className="text-sm pt-2">{visitor.host}</div>
              <div className="text-sm pt-2">{visitor.department}</div>
              <div className="text-sm pt-2">{visitor.expectedTime}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-gray-500">
          No visitors found matching your search criteria.
        </div>
      )}

      {/* Health Declaration First */}
      {healthModalOpen && selectedVisitor && (
        <HealthDeclarationModal
          isOpen={true}
          onClose={() => {
            setHealthModalOpen(false);
          }}
          onSubmit={(healthData) => {
            setTempHealthData(healthData);
            setHealthModalOpen(false);
            setStatusActionModalOpen(true);
          }}
        />
      )}

      {/* High Care Approval Modal */}
      {statusActionModalOpen && selectedVisitor && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="max-w-xl w-full p-6">
            <HighCareApprovalForm
              onClose={() => {
                setStatusActionModalOpen(false);
              }}
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
