import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { FiltersProps } from "@/types/Security";
import { showErrorToast } from "@/utils/customToasts";
import {
  fetchPurposes,
  fetchDepartments,
  fetchApprovalStatuses,
} from "@/utils/handleFilters";
import axios from "axios";

const Filters: React.FC<FiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedEmployee,
  setSelectedEmployee,
  selectedPurpose,
  setSelectedPurpose,
  selectedDepartment,
  setSelectedDepartment,
  selectedApprovalStatus,
  setSelectedApprovalStatus,
}) => {
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [purposes, setPurposes] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);
  const [approvalStatuses, setApprovalStatuses] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      try {
        // Employees are not covered by handleFilters yet → keep axios
        const employeeResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees/all`,
        );
        setEmployees(employeeResponse.data);

        // Use utils for the rest
        const [purposesData, departmentsData, approvalStatusesData] =
          await Promise.all([
            fetchPurposes(),
            fetchDepartments(),
            fetchApprovalStatuses(),
          ]);

        setPurposes(purposesData);
        setDepartments(departmentsData);
        setApprovalStatuses(approvalStatusesData);
      } catch (error: any) {
        showErrorToast(`Error fetching filters: ${error.message}`);
      }
    })();
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    filterType: string,
  ) => {
    const value = event.target.value;
    if (filterType === "employee") setSelectedEmployee(value);
    if (filterType === "purpose") setSelectedPurpose(value);
    if (filterType === "department") setSelectedDepartment(value);
    if (filterType === "approvalStatus") setSelectedApprovalStatus(value);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Visitor"
          className="border rounded-lg pl-10 pr-3 py-2 text-sm w-full md:w-60 focus:ring focus:ring-indigo-200 text-black"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Dropdown Filters */}
      {[
        {
          label: "Employee",
          options: employees,
          state: selectedEmployee,
          type: "employee",
        },
        {
          label: "Purpose",
          options: purposes,
          state: selectedPurpose,
          type: "purpose",
        },
        {
          label: "Department",
          options: departments,
          state: selectedDepartment,
          type: "department",
        },
        {
          label: "Approval Status",
          options: approvalStatuses,
          state: selectedApprovalStatus,
          type: "approvalStatus",
        },
      ].map(({ label, options, state, type }) => (
        <div key={label} className="relative">
          <select
            value={state}
            onChange={(e) => handleFilterChange(e, type)}
            className="border rounded-lg px-4 py-2 text-sm bg-white appearance-none pr-10 text-black"
          >
            <option value="All">{label}</option>
            {options.length > 0 ? (
              options.map((option) => (
                <option key={option.id} value={option.name}>
                  {option.name}
                </option>
              ))
            ) : (
              <option disabled>No {label}s available</option>
            )}
          </select>
          <ChevronDownIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      ))}
    </div>
  );
};

export default Filters;
