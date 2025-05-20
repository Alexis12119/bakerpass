 import React from "react";

interface StatusFiltersProps {
  selectedStatuses: string[];
  toggleStatus: (status: string) => void;
} 

const StatusFilters: React.FC<StatusFiltersProps> = ({
  selectedStatuses,
  toggleStatus,
}) => {
  const statuses = [
    "Approved",
    "Disapproved",
    "Canceled",
    "Blocked",
  ];

  return (
    <div className="p-4 flex space-x-2 bg-gray-100">
      {statuses.map((status) => (
        <label
          key={status}
          className="flex items-center space-x-2 text-black border p-2 bg-white border-gray-100 font-semibold text-sm"
        >
          <input
            type="checkbox"
            checked={selectedStatuses.includes(status)}
            onChange={() => toggleStatus(status)}
            className="form-checkbox rounded accent-[#1C274C] focus:ring-transparent"
          />
          <span>{status}</span>
        </label>
      ))}
    </div>
  );
};

export default StatusFilters;
