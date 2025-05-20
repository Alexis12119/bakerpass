import React from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedHost: string;
  setSelectedHost: (host: string) => void;
  selectedPurpose: string;
  setSelectedPurpose: (purpose: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  hosts: any[];
  purposes: any[];
  departments: any[];
  approvalStatuses: any[];
  selectedApprovalStatus: string;
  setSelectedApprovalStatus: (status: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedHost,
  setSelectedHost,
  selectedPurpose,
  setSelectedPurpose,
  selectedDepartment,
  setSelectedDepartment,
  hosts,
  purposes,
  departments,
  approvalStatuses,
  selectedApprovalStatus,
  setSelectedApprovalStatus,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Visitor"
          className="border rounded-lg pl-10 pr-3 py-2 text-sm w-full md:w-60 focus:ring focus:ring-indigo-200 text-black"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Dropdown Filters */}

      {[
        {
          label: "Host",
          options: hosts.map((h) => h.name),
          state: selectedHost,
          setState: setSelectedHost,
        },
        {
          label: "Purpose",
          options: purposes.map((p) => p.name),
          state: selectedPurpose,
          setState: setSelectedPurpose,
        },
        {
          label: "Department",
          options: departments.map((d) => d.name),
          state: selectedDepartment,
          setState: setSelectedDepartment,
        },
        {
          label: "Approval Status",
          options: approvalStatuses.map((s) => s.name),
          state: selectedApprovalStatus,
          setState: setSelectedApprovalStatus,
        },
      ].map(({ label, options, state, setState }) => (
        <div key={label} className="relative">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border rounded-lg px-4 py-2 text-sm bg-white appearance-none pr-10 text-black"
          >
            <option value="All">{label}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      ))}
    </div>
  );
};

export default SearchFilters;
