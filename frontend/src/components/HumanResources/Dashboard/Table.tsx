import React from "react";
import Image from "next/image";
import { User, Clock } from "lucide-react";
import { DashboardTableProps } from "@/types/HumanResources/Dashboard";
import { showErrorToast } from "@/utils/customToasts";
import { formatTimeForDisplay, getStatusLabel } from "@/utils/visitorUtils";

const DashboardTable: React.FC<DashboardTableProps> = ({ visitors }) => {
  return (
    <div className="bg-white shadow-md border border-gray-300 mt-3 text-center">
      <div className="hidden md:grid grid-cols-8 bg-gray-200 py-3 px-6 font-semibold text-sm text-black border-b border-gray-300">
        <div>Status</div>
        <div>Visitor's Name</div>
        <div>Purpose</div>
        <div>Employee Name</div>
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
              {/* Status */}
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
                    showErrorToast(
                      `Status is "${visitor.approvalStatus}". Only Authorized Personnel can modify this.`,
                    );
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
                <span className="text-sm font-medium">{visitor.name}</span>
              </div>

              {/* Purpose */}
              <div className="flex items-center justify-center text-sm">
                {visitor.purpose || "Not specified"}
              </div>

              {/* Employee Name */}
              <div className="flex items-center justify-center text-sm">
                {visitor.employee}
              </div>

              {/* Department */}
              <div className="flex items-center justify-center text-sm">
                {visitor.department}
              </div>

              {/* Expected Time */}
              <div className="flex items-center justify-center text-sm">
                {visitor.expectedTime}
              </div>

              {/* Time In */}
              <div className="flex items-center justify-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold w-full md:w-auto justify-center
                    ${
                      visitor.timeIn
                        ? "bg-[#1EA83C] text-white"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                >
                  <Clock className="w-4 h-4" />
                  <span className="whitespace-nowrap">
                    {formatTimeForDisplay(visitor.timeIn)}
                  </span>
                </div>
              </div>

              {/* Time Out */}
              <div className="flex items-center justify-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold w-full md:w-auto justify-center
                    ${
                      visitor.timeOut
                        ? "bg-[#C82020] text-white"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
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
    </div>
  );
};

export default DashboardTable;
