export interface HumanResources {
  id: number;
  firstName: string;
  lastName: string;
}

export interface HumanResourcesWithDropdown extends HumanResources {
  isDropdownOpen: boolean;
}

export interface HumanResourcesProfileModalProps {
  visitor: HumanResourcesWithDropdown;
  isOpen: boolean;
  onClose: () => void;
  profileImageUrl: string;
}

