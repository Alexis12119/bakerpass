import React from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";
import { format, addDays, subDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SearchFiltersProps {
  searchQuery: string;
  selectedPurpose: string;
  currentDate: string;
  purposes: string[];
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterChange: (
    event: React.ChangeEvent<HTMLSelectElement>,
    filterType: string,
  ) => void;
  selectedApprovalStatus: string;
  approvalStatuses: string[];
  handlePreviousDate: () => void;
  handleNextDate: () => void;
  setCurrentDate: (date: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  selectedPurpose,
  currentDate,
  purposes,
  handleSearchChange,
  handleFilterChange,
  selectedApprovalStatus,
  approvalStatuses,
  handlePreviousDate,
  handleNextDate,
  setCurrentDate,
}) => {
  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        {/* 🔍 Search & Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Search Input */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Visitor"
              className="border rounded-lg pl-10 pr-3 py-2 text-sm w-full md:w-auto focus:ring focus:ring-indigo-200 text-black"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Group both dropdowns side by side */}
          <div className="flex gap-2">
            {/* Purpose Dropdown */}
            <div className="relative">
              <select
                value={selectedPurpose}
                onChange={(e) => handleFilterChange(e, "purpose")}
                className="border rounded-lg px-4 py-2 text-sm bg-white appearance-none pr-10 text-black"
              >
                <option value="All">Purpose</option>
                {purposes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Approval Status Dropdown */}
            <div className="relative">
              <select
                value={selectedApprovalStatus}
                onChange={(e) => handleFilterChange(e, "approvalStatus")}
                className="border rounded-lg px-4 py-2 text-sm bg-white appearance-none pr-10 text-black"
              >
                <option value="All">Approval Status</option>
                {approvalStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 📅 Date Navigation */}
        <div className="flex items-center space-x-2">
          <ChevronLeftIcon
            className="h-5 w-5 text-gray-400 cursor-pointer hover:text-black"
            onClick={handlePreviousDate}
          />
          <DatePicker
            selected={new Date(currentDate)}
            onChange={(date: Date) =>
              setCurrentDate(format(date, "yyyy-MM-dd"))
            }
            dateFormat="MMMM dd, yyyy"
            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
          />
          <ChevronRightIcon
            className="h-5 w-5 text-gray-400 cursor-pointer hover:text-black"
            onClick={handleNextDate}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
