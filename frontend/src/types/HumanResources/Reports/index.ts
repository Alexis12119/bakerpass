export interface EmployeeProfileModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  total_visitors: number;
  avg_visitors: number;
  profileImageUrl: string;
}

export interface SearchFiltersProps {
  searchQuery: string;
  selectedDepartment: string;
  departments: string[];
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFilterChange: (
    event: React.ChangeEvent<HTMLSelectElement>,
    filterType: string,
  ) => void;
}

export interface HumanResources {
  id: number;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
}

export interface HumanResourcesWithDropdown extends HumanResources {
  isDropdownOpen: boolean;
}
