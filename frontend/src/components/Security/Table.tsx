import React from "react";
import Image from "next/image";
import StatusActionModal from "@/components/Modals/StatusAction";
import VisitorIDModal from "@/components/Security/Modals/VisitorID";
import { User } from "lucide-react";
import { SecurityTableProps } from "@/types/Security";

const SecurityTable: React.FC<SecurityTableProps> = ({
  visitors,
  onToggleStatus,
  validIdModalOpen,
  setValidIdModalOpen,
  statusActionModalOpen,
  setStatusActionModalOpen,
  selectedVisitor,
  setSelectedVisitor,
  setApprovalAction,
  handleVisitorApproval,
}) => {
  function toTitleCase(str?: string) {
    if (!str) return ""; // Return empty string if str is undefined/null/empty

    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
    );
  }

  function getStatusLabel(visitor) {
    const { approvalStatus, status } = visitor;

    if (["Approved", "Nurse Approved"].includes(approvalStatus)) {
      return toTitleCase(status);
    }

    if (approvalStatus === "Partial Approved") {
      return "Sent to Clinic";
    }

    return toTitleCase(approvalStatus);
  }

  const formatTimeForDisplay = (time: string | null) => {
    if (!time || time === "00:00:00") return "Pending";
    const [hoursStr, minutes] = time.split(":");
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white shadow-md border border-gray-300 mt-3 text-center">
      <div className="hidden md:grid grid-cols-8 bg-gray-200 py-3 px-6 font-semibold text-sm text-black border-b border-gray-300">
        <div>Status</div>
        <div>Visitor's Name</div>
        <div>Purpose</div>
        <div>Host Name</div>
        <div>Department</div>
        <div>Expected Time</div>
        <div>Time In</div>
        <div>Time Out</div>
      </div>

      {visitors.length > 0 ? (
        <div className="max-h-[400px] overflow-y-auto">
          {visitors.map((visitor) => (
            <div
              key={visitor.id}
              className="grid grid-cols-1 md:grid-cols-8 py-3 px-6 border-b border-gray-300 !text-black gap-4"
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
                          : visitor.approvalStatus === "Partial Approved"
                            ? "bg-blue-500"
                            : visitor.approvalStatus === "Nurse Approved"
                              ? "bg-green-800"
                              : visitor.approvalStatus === "Cancelled"
                                ? "bg-gray-400"
                                : "bg-white"
                  }
                `}
                onClick={() => {
                  const approvedStatuses = ["Approved", "Nurse Approved"];
                  const isApproved = approvedStatuses.includes(
                    visitor.approvalStatus,
                  );

                  if (isApproved) {
                    const isCheckedInWithoutTime =
                      visitor.status === "Checked In" && !visitor.timeIn;
                    const isOngoingOrCheckedOut =
                      visitor.status === "Ongoing" ||
                      (visitor.status === "Checked In" && visitor.timeOut);

                    if (isCheckedInWithoutTime) {
                      setSelectedVisitor(visitor);
                      setValidIdModalOpen(true);
                    } else if (isOngoingOrCheckedOut) {
                      onToggleStatus(visitor.id, 0); // You can pass 0 or previously selected ID here
                    }
                  } else if (
                    visitor.approvalStatus === "Waiting For Approval"
                  ) {
                    setSelectedVisitor(visitor);
                    setApprovalAction("Approved");
                    setStatusActionModalOpen(true);
                  }
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
                  {getStatusLabel(visitor)}
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

              {/* TIME IN */}
              <div
                className={`pt-2 text-sm font-bold ${
                  visitor.timeIn
                    ? "bg-[#1EA83C] text-white"
                    : "bg-gray-200 text-gray-500"
                } px-3 py-1 rounded-lg`}
              >
                {formatTimeForDisplay(visitor.timeIn)}
              </div>

              {/* TIME OUT */}
              <div
                className={`pt-2 text-sm font-bold ${
                  visitor.timeOut
                    ? "bg-[#C82020] text-white"
                    : "bg-gray-200 text-gray-500"
                } px-3 py-1 rounded-lg`}
              >
                {formatTimeForDisplay(visitor.timeOut)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 text-center text-gray-500">
          No visitors found matching your search criteria.
        </div>
      )}

      {/* ✅ Valid ID Modal */}
      {validIdModalOpen && selectedVisitor && (
        <VisitorIDModal
          isOpen={validIdModalOpen}
          onSubmit={(idType) => {
            if (selectedVisitor) {
              onToggleStatus(selectedVisitor.id, idType);
            }
            setValidIdModalOpen(false);
          }}
          onClose={() => setValidIdModalOpen(false)}
        />
      )}

      {/* ✅ Status Action Modal */}
      {statusActionModalOpen && selectedVisitor && (
        <StatusActionModal
          title={`Approve entry for ${selectedVisitor.name}?`}
          message="Choose how to proceed with this visitor's request."
          onConfirm={(action) => {
            setApprovalAction(action);
            handleVisitorApproval(action);
            setStatusActionModalOpen(false);
          }}
          onClose={() => setStatusActionModalOpen(false)}
        />
      )}
    </div>
  );
};

export default SecurityTable;
