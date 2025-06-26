import React from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { SearchFiltersProps } from "@/types/HumanResources/Reports";

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchQuery,
  selectedDepartment,
  departments,
  handleSearchChange,
  handleFilterChange,
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
      </div>
    </div>
  );
};

export default SearchFilters;
