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

export interface NurseTableProps {
  visitors: VisitorWithDropdown[];
  statusActionModalOpen: boolean;
  setStatusActionModalOpen: (open: boolean) => void;
  selectedVisitor: Visitor | null;
  setSelectedVisitor: (visitor: Visitor) => void;
  handleVisitorApproval: (
    action: "Yes" | "No",
    formData?: any,
    healthData?: any,
  ) => void;
}

export interface Nurse {
  id: number;
  name: string;
  profileImageUrl: string;
}

export interface NurseProfileModalProps {
  visitor: NurseWithDropdown;
  isOpen: boolean;
  onClose: () => void;
  profileImageUrl: string;
}

export interface NurseWithDropdown extends Nurse {
  isDropdownOpen: boolean;
  profileImageUrl: string;
}

export interface HighCareApprovalFormProps {
  onClose: () => void;
  onSubmit: (formData: {
    selectedAreas: string[];
    equipment: string[];
    permissionType: string;
    comments: string;
  }) => void;
}

export interface HealthDeclarationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (healthData: HealthDeclarationData) => void;
}

export interface HealthDeclarationData {
  // Flat structure to match backend
  fever: boolean;
  cough: boolean;
  openWound: boolean;
  nausea: boolean;
  skinBoils: boolean;
  skinAllergies: boolean;
  diarrhea: boolean;
  openSores: boolean;
  otherAllergies: string;
  recentPlaces: string;
  mobilePhone: boolean;
  camera: boolean;
  medicines: boolean;
  notebook: boolean;
  earrings: boolean;
  necklace: boolean;
  ring: boolean;
  id_card: boolean;
  ballpen: boolean;
  wristwatch: boolean;
  otherProhibited: string;
}

export interface PrintableProps {
  formData: {
    selectedAreas: string[];
    equipment: string[];
    permissionType: string;
    comments: string;
  };
}

export interface StatusActionModalProps {
  title: string;
  message: string;
  onConfirm: (action: "Yes" | "No") => void;
  onClose: () => void;
}
