import React from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

interface SearchFiltersProps {
  searchQuery: string;
  selectedDepartment: string;
  departments: string[];
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterChange: (
    event: React.ChangeEvent<HTMLSelectElement>,
    filterType: string,
  ) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  selectedDepartment,
  departments,
  handleSearchChange,
  handleFilterChange,
}) => {
  const currentDate = new Date().toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

          {/* Dropdown Filters */}
          <div className="relative">
            <select
              value={selectedDepartment}
              onChange={(e) => handleFilterChange(e, "department")}
              className="border rounded-lg px-4 py-2 text-sm bg-white appearance-none pr-10 text-black"
            >
              <option value="All">Department</option>
              {departments.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* 📅 Date Navigation */}
        <div className="flex items-center space-x-2">
          <ChevronLeftIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
          <span className="text-gray-500" suppressHydrationWarning>
            {currentDate}
          </span>
          <ChevronRightIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
