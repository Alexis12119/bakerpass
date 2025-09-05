import { VisitorBase, VisitorWithDropdown } from "@/types/common/Visitor";

export interface Visitor extends VisitorBase {
  expectedTime: string;
  contactNumber?: string | null;
  address?: string | null;
  otp?: string | null;
  email?: string | null;
  employeeId?: string;
}

export type VisitorWithDropdownEmp = VisitorWithDropdown<Visitor>;

export interface SidebarProps {
  isSidebarOpen: boolean;
}

export interface StatusFiltersProps {
  selectedStatuses: string[];
  toggleStatus: (status: string) => void;
}

export interface SearchFiltersProps {
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

export interface VisitorsSectionProps {
  searchQuery: string;
  selectedPurpose: string;
  currentDate: string;
  purposes: string[];
  groupedVisitors: Record<string, VisitorWithDropdown[]>;
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

export interface VisitorProfileModalProps {
  visitor: Visitor;
  isOpen: boolean;
  onClose: () => void;
}

export interface VisitorsListProps {
  groupedVisitors: Record<string, VisitorWithDropdown[]>;
}
