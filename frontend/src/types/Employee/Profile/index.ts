export interface Visitor {
  id: string;
  name: string;
  department: string;
  profileImageUrl: string;
}

export interface TimeSlot {
  id: number;
  employeeId: string;
  start_time: string;
  end_time: string;
  date: string;
}

export interface EmployeeProfileModalProps {
  Visitor: Visitor;
  employeeId?: string;
  isOpen: boolean;
  onClose: () => void;
  profileImageUrl?: string;
}
