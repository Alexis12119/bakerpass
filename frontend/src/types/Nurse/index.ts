import { VisitorBase, VisitorWithDropdown } from "@/types/common/Visitor";

export type Visitor = VisitorBase;
export type VisitorWithDropdownNurse = VisitorWithDropdown<Visitor>;

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
  currentDate: string;
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
