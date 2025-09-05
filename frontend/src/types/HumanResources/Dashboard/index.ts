export interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedEmployee: string;
  setSelectedEmployee: (host: string) => void;
  selectedPurpose: string;
  setSelectedPurpose: (purpose: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  employees: any[];
  purposes: any[];
  departments: any[];
  approvalStatuses: any[];
  selectedApprovalStatus: string;
  setSelectedApprovalStatus: (status: string) => void;
}

import { VisitorBase, VisitorWithDropdown } from "@/types/common/Visitor";

export type Visitor = VisitorBase;
export type VisitorWithDropdownHR = VisitorWithDropdown<Visitor>;

export interface DashboardTableProps {
  visitors: VisitorWithDropdown[];
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
