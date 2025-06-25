import React from "react";
import Image from "next/image";
import HighCareApprovalForm from "@/components/Nurse/Modals/HighCareApprovalForm";
import { User } from "lucide-react";

interface Visitor {
  id: string;
  name: string;
  purpose: string;
  host: string;
  department: string;
  expectedTime: string;
  timeIn: string | null;
  timeOut: string | null;
  status: "Checked In" | "Ongoing" | "Checked Out";
  approvalStatus:
    | "Waiting For Approval"
    | "Approved"
    | "Blocked"
    | "Cancelled"
    | "Nurse Approved";
  profileImageUrl: string;
}

interface VisitorWithDropdown extends Visitor {
  isDropdownOpen: boolean;
}

interface NurseTableProps {
  visitors: VisitorWithDropdown[];
  statusActionModalOpen: boolean;
  setStatusActionModalOpen: (open: boolean) => void;
  selectedVisitor: Visitor | null;
  setSelectedVisitor: (visitor: Visitor) => void;
  handleVisitorApproval: (action: "Yes" | "No", formData?: any) => void;
}

const NurseTable: React.FC<NurseTableProps> = ({
  visitors,
  statusActionModalOpen,
  setStatusActionModalOpen,
  selectedVisitor,
  setSelectedVisitor,
  handleVisitorApproval,
}) => {
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
              {/* STATUS BOX */}
              <div
                className={`relative inline-block text-center border rounded-lg px-3 py-1 cursor-pointer
                  ${
                    visitor.approvalStatus === "Approved"
                      ? "bg-[#1C274C]"
                      : visitor.approvalStatus === "Waiting For Approval"
                        ? "bg-yellow-400"
                        : visitor.approvalStatus === "Blocked"
                          ? "bg-red-600"
                          : visitor.approvalStatus === "Cancelled"
                            ? "bg-gray-400"
                            : "bg-white"
                  }
                `}
                onClick={() => {
                  if (visitor.approvalStatus === "Waiting For Approval") {
                    setSelectedVisitor(visitor);
                    setStatusActionModalOpen(true);
                  }
                  console.log("Visitor Status: ", visitor.status);
                }}
              >
                <span
                  className={`text-xs font-bold text-center block
                    ${
                      visitor.approvalStatus === "Approved"
                        ? "text-white"
                        : visitor.approvalStatus === "Waiting For Approval"
                          ? "text-black"
                          : "text-white"
                    }
                  `}
                >
                  {visitor.approvalStatus === "Approved"
                    ? visitor.status
                    : visitor.approvalStatus}
                </span>
              </div>

              {/* Visitor Info */}
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
              <div className="text-sm pt-2">
                {visitor.purpose || "Not specified"}
              </div>
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
      {statusActionModalOpen && selectedVisitor && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="max-w-xl w-full p-6">
            <HighCareApprovalForm
              onClose={() => setStatusActionModalOpen(false)}
              onSubmit={(formData) => {
                handleVisitorApproval("Yes", formData); // Pass form data
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseTable;
