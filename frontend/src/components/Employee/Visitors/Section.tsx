import React from "react";
import SearchFilters from "@/components/Employee/Visitors/SearchFilters";
import VisitorsList from "@/components/Employee/Visitors/List";
import { VisitorsSectionProps } from "@/types/Employee";

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
  handlePreviousDate,
  handleNextDate,
  setCurrentDate,
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
        handlePreviousDate={handlePreviousDate}
        handleNextDate={handleNextDate}
        setCurrentDate={setCurrentDate}
      />

      <div className="bg-white p-8">
        <div className="w-full">
          <VisitorsList groupedVisitors={groupedVisitors} />
        </div>
      </div>
    </div>
  );
};

export default VisitorsSection;
