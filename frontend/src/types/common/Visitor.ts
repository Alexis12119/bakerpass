export type VisitorStatus = "Checked In" | "Ongoing" | "Checked Out";

export type VisitorApprovalStatus =
  | "Waiting For Approval"
  | "Approved"
  | "Blocked"
  | "Cancelled"
  | "Partial Approved"
  | "Nurse Approved";

export interface VisitorBase {
  id: number;
  name: string;
  purpose: string;
  employee: string;
  department: string;
  expectedTime: string;
  timeIn: string | null;
  timeOut: string | null;
  status: VisitorStatus | string; // allow string for Employee side
  approvalStatus: VisitorApprovalStatus | string; // same here
  profileImageUrl: string;
}

export interface VisitorWithDropdown<T extends VisitorBase = VisitorBase>
  extends T {
  isDropdownOpen: boolean;
}
