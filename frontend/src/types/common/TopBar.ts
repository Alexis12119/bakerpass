export interface TopBarProps {
  role: "Human Resources" | "Employee" | "Security";
  showNewVisitButton?: boolean;
  onNewVisitClick?: () => void;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
}
