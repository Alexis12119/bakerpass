import { VisitorBase, VisitorWithDropdown } from "@/types/common/Visitor";

export type Visitor = VisitorBase;
export type VisitorWithDropdownSec = VisitorWithDropdown<Visitor>;

export interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedEmployee: string;
  setSelectedEmployee: (employee: string) => void;
  selectedPurpose: string;
  setSelectedPurpose: (purpose: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  selectedApprovalStatus: string;
  setSelectedApprovalStatus: (status: string) => void;
}

export interface SecurityTableProps {
  visitors: VisitorWithDropdown[];
  onToggleStatus: (visitorId: number, validIdType: number) => void;
  validIdModalOpen: boolean;
  setValidIdModalOpen: (open: boolean) => void;
  statusActionModalOpen: boolean;
  setStatusActionModalOpen: (open: boolean) => void;
  selectedVisitor: Visitor | null;
  setSelectedVisitor: (visitor: Visitor | null) => void;
  setApprovalAction: (
    action:
      | "Approved"
      | "Blocked"
      | "Cancelled"
      | "Nurse Approved"
      | "Partial Approved",
  ) => void;
  handleVisitorApproval: (
    visitorId: number,
    action:
      | "Approved"
      | "Blocked"
      | "Cancelled"
      | "Nurse Approved"
      | "Partial Approved",
  ) => void;
  currentDate: string;
}

export interface Security {
  id: string;
  name: string;
  profileImageUrl: string;
}

export interface SecurityWithDropdown extends Security {
  isDropdownOpen: boolean;
}

export interface TopBarProps {
  fetchVisitorsByDate: () => Promise<void>;
}
export interface Employee {
  id: string;
  name: string;
  department: string;
  profileImage: string;
}
export interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: {
    id: string;
    name: string;
    department: string;
    profileImage: string;
  };
  fetchVisitorsByDate: () => Promise<void>;
}

export interface IDType {
  id: number;
  name: string;
}

export interface VisitorIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (idTypeId: number) => void;
}

export interface Security {
  id: string;
  name: string;
  profileImageUrl: string;
}

export interface SecurityWithDropdown extends Security {
  isDropdownOpen: boolean;
}

export interface SecurityProfileModalProps {
  visitor: SecurityWithDropdown;
  isOpen: boolean;
  onClose: () => void;
  profileImageUrl: string;
}
