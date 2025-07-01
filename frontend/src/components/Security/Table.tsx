"use client";

import Image from "next/image";
import StatusActionModal from "@/components/Modals/StatusAction";
import VisitorIDModal from "@/components/Security/Modals/VisitorID";
import { User, Clock } from "lucide-react";
import { SecurityTableProps } from "@/types/Security";

function toTitleCase(str?: string) {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
}

function getStatusLabel(visitor: any) {
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
        <div className="max-h-[400px] min-h-[340px] overflow-y-auto">
          {visitors.map((visitor) => (
            <div
              key={visitor.id}
              className="grid grid-cols-1 md:grid-cols-8 px-6 py-4 border-b border-gray-300 text-black gap-4 items-center hover:bg-gray-100 transition-colors duration-200"
            >
              {/* STATUS BOX */}
              <div className="flex items-center justify-center">
                <div
                  className={`text-center rounded-full px-4 py-2 text-xs font-bold w-full md:w-auto transition-colors cursor-pointer
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
                        onToggleStatus(visitor.id, 0);
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
                  {getStatusLabel(visitor)}
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
                <span className="text-sm font-medium truncate">
                  {visitor.name}
                </span>
              </div>
              <div className="flex items-center text-sm">
                {visitor.purpose || "Not specified"}
              </div>
              <div className="flex items-center text-sm">{visitor.host}</div>
              <div className="flex items-center text-sm">
                {visitor.department}
              </div>
              <div className="flex items-center text-sm">
                {visitor.expectedTime}
              </div>

              {/* TIME IN */}
              <div className="flex items-center justify-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold w-full md:w-auto justify-center
                    ${
                      visitor.timeIn
                        ? "bg-[#1EA83C] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="whitespace-nowrap">
                    {formatTimeForDisplay(visitor.timeIn)}
                  </span>
                </div>
              </div>

              {/* TIME OUT */}
              <div className="flex items-center justify-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold w-full md:w-auto justify-center
                    ${
                      visitor.timeOut
                        ? "bg-[#C82020] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="whitespace-nowrap">
                    {formatTimeForDisplay(visitor.timeOut)}
                  </span>
                </div>
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

      {/* Valid ID Modal */}
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

      {/* Status Action Modal */}
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
