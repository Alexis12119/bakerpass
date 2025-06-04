import React from "react";
import VisitorCard from "@/components/Employee/Visitors/Cards";

interface Visitor {
  id: string;
  name: string;
  purpose: string;
  host: string;
  department: string;
  timeIn: string;
  timeOut: string;
  approval_status: string;
  profileImageUrl: string;
}

interface VisitorWithDropdown extends Visitor {
  isDropdownOpen: boolean;
}

interface VisitorsListProps {
  groupedVisitors: Record<string, VisitorWithDropdown[]>;
  fetchVisitors: () => void;
}
const VisitorsList: React.FC<VisitorsListProps> = ({ groupedVisitors, fetchVisitors }) => {
  return (
    <div className="bg-white p-4 max-h-[400px] overflow-y-auto w-full">
      {Object.keys(groupedVisitors).length > 0 ? (
        Object.entries(groupedVisitors).map(([timeRange, visitorGroup]) => (
          <div key={timeRange} className="mb-6">
            <h3 className="text-lg font-bold text-black mb-3">{timeRange}</h3>
            {/* Horizontal scrollable container */}
            <div className="overflow-x-auto max-w-[85vw] pb-4">
              <div className="flex space-x-4 min-w-full">
                {visitorGroup.map((visitor) => (
                  <div
                    key={visitor.id}
                    className="w-full min-w-[280px] max-w-xs flex-shrink-0"
                  >
                    <VisitorCard visitor={visitor} fetchVisitors={fetchVisitors} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No visitors found matching your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default VisitorsList;
