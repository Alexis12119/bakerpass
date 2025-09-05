import { VisitorWithDropdown } from "@/types/Security";

/**
 * Converts string into Title Case
 */
export function toTitleCase(str?: string): string {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );
}

/**
 * Returns a human-readable status label for a visitor
 */
export function getStatusLabel(visitor: VisitorWithDropdown): string {
  const { approvalStatus, status } = visitor;
  if (["Approved", "Nurse Approved"].includes(approvalStatus)) {
    return toTitleCase(status);
  }
  if (approvalStatus === "Partial Approved") {
    return "Sent to Clinic";
  }
  return toTitleCase(approvalStatus);
}

/**
 * Formats a DB time string (e.g. "14:30:00") into "2:30 PM".
 * Returns "Pending" if null/empty.
 */
export function formatTimeForDisplay(time: string | null): string {
  if (!time || time === "00:00:00") return "Pending";
  const [hoursStr, minutes] = time.split(":");
  let hours = parseInt(hoursStr, 10);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
