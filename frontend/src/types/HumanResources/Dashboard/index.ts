export interface SearchFiltersProps {
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

export interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export interface Visitor {
  id: string;
  name: string;
  purpose: string;
  host: string;
  department: string;
  expectedTime: string;
  timeIn: string | null;
  timeOut: string | null;
  status: "Checked In" | "Ongoing" | "Checked Out";
  approvalStatus:
    | "Waiting For Approval"
    | "Approved"
    | "Blocked"
    | "Cancelled"
    | "Partial Approved"
    | "Nurse Approved";
  profileImageUrl: string;
}

export interface VisitorWithDropdown extends Visitor {
  isDropdownOpen: boolean;
}

export interface DashboardTableProps {
  visitors: VisitorWithDropdown[];
}

export interface TopBarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
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
