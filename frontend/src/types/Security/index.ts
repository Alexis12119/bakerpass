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

export interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedHost: string;
  setSelectedHost: (host: string) => void;
  selectedPurpose: string;
  setSelectedPurpose: (purpose: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  selectedApprovalStatus: string;
  setSelectedApprovalStatus: (status: string) => void;
}

export interface SecurityTableProps {
  visitors: VisitorWithDropdown[];
  onToggleStatus: (visitorId: string, validIdType: number) => void;
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
    action:
      | "Approved"
      | "Blocked"
      | "Cancelled"
      | "Nurse Approved"
      | "Partial Approved",
  ) => void;
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
  fetchVisitors: () => Promise<void>;
}
export interface Host {
  id: string;
  name: string;
  department: string;
  profileImage: string;
}
export interface HostDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: {
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
