import React from "react";
import SearchFilters from "@/components/Employee/Visitors/SearchFilters";
import VisitorsList from "@/components/Employee/Visitors/List";
interface Visitor {
  id: string;
  name: string;
  purpose: string;
  host: string;
  department: string;
  timeIn: string;
  timeOut: string;
  approval_status: string;
}

interface VisitorWithDropdown extends Visitor {
  isDropdownOpen: boolean;
}
interface VisitorsSectionProps {
  searchQuery: string;
  selectedPurpose: string;
  currentDate: string;
  purposes: string[];
  groupedVisitors: Record<string, VisitorWithDropdown[]>;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterChange: (
    event: React.ChangeEvent<HTMLSelectElement>,
    filterType: string,
  ) => void;
  selectedApprovalStatus: string;
  approvalStatuses: string[];
  fetchVisitors: () => void;
}

const VisitorsSection: React.FC<VisitorsSectionProps> = ({
  searchQuery,
  selectedPurpose,
  currentDate,
  purposes,
  groupedVisitors,
  handleSearchChange,
  handleFilterChange,
  selectedApprovalStatus,
  approvalStatuses,
  fetchVisitors,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-300">
      <SearchFilters
        searchQuery={searchQuery}
        selectedPurpose={selectedPurpose}
        currentDate={currentDate}
        purposes={purposes}
        handleSearchChange={handleSearchChange}
        handleFilterChange={handleFilterChange}
        selectedApprovalStatus={selectedApprovalStatus}
        approvalStatuses={approvalStatuses}
      />

      <div className="bg-white p-8">
        <div className="w-full">
          <VisitorsList groupedVisitors={groupedVisitors} fetchVisitors={fetchVisitors} />
        </div>
      </div>
    </div>
  );
};

export default VisitorsSection;
