import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";
import { VisitorWithDropdownEmp } from "@/types/Employee";
import { VisitorBase, VisitorWithDropdown } from "@/types/common/Visitor";

/**
 * Map raw visitor data from API to UI-friendly format.
 */
export const mapVisitorsData = (visitors: any[]): VisitorWithDropdownEmp[] => {
  const formatTimeRange = (timeIn: string | null, timeOut: string | null) => {
    if (!timeIn || !timeOut) return "Not scheduled";
    const [hIn, mIn] = timeIn.split(":");
    const [hOut, mOut] = timeOut.split(":");
    return `${hIn}:${mIn} - ${hOut}:${mOut}`;
  };

  return visitors.map(
    (visitor): VisitorWithDropdownEmp => ({
      id: visitor.visit_id,
      name: `${visitor.visitorFirstName} ${visitor.visitorLastName}`,
      email: visitor.email,
      contactNumber: visitor.contact_number,
      address: visitor.address,
      purpose: visitor.purpose,
      employee: `${visitor.employeeFirstName} ${visitor.employeeLastName}`,
      department: visitor.employeeDepartment,
      expectedTime:
        visitor.expected_time ||
        formatTimeRange(visitor.time_in, visitor.time_out),
      timeIn: visitor.time_in || null,
      timeOut: visitor.time_out || null,
      status: visitor.status,
      approvalStatus: visitor.approval_status,
      profileImageUrl: visitor.profile_image_url,
      isDropdownOpen: false,
      employeeId: visitor.employee_id,
      isHighCare: visitor.is_high_care ?? undefined,
    }),
  );
};

/**
 * Fetch visitors by selected date.
 * Reads `visitor_filter_date` from sessionStorage.
 */
export const fetchNurseVisitorsByDate = async <
  T extends VisitorBase = VisitorBase,
>(): Promise<VisitorWithDropdown<T>[]> => {
  const date = sessionStorage.getItem("visitor_filter_date");

  try {
    const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_HOST}/nurse/high-care-visits?date=${date}`;

    const response = await axios.get(endpoint);
    return mapVisitorsData<T>(response.data);
  } catch (error) {
    console.error("Error fetching visitors:", error);
    return [];
  }
};

/**
 * Fetch visitors by selected date.
 * Reads `visitor_filter_date` from sessionStorage.
 */
export const fetchVisitorsByDate = async (
  employeeId: string | null,
): Promise<VisitorWithDropdown<VisitorBase>[]> => {
  const date = sessionStorage.getItem("visitor_filter_date");

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors-date`,
      {
        params: { date, employeeId },
      },
    );
    const data = res.data;
    return mapVisitorsData(data);
  } catch (error: any) {
    console.error("Error fetching visitors:", error);
    return [];
  }
};

/**
 * Toggle visitor's time in / time out status.
 */
export const toggleVisitorStatus = async (visitorId: number): Promise<void> => {
  try {
    await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_HOST}/update-visitor-status/${visitorId}`,
    );
  } catch (error) {
    console.error("Error toggling visitor status:", error);
    throw error;
  }
};

/**
 * Approve or reject a visitor.
 */
export const handleVisitorApproval = async (
  visitorId: number,
  approvalStatus: string,
): Promise<void> => {
  try {
    await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors/${visitorId}/approval`,
      { approvalStatus },
    );
  } catch (error) {
    console.error("Error handling visitor approval:", error);
    throw error;
  }
};

/**
 * Nurse-specific approval handler with multi-step flow:
 * 1. High care request (if Yes + formData provided)
 * 2. Health declaration (if Yes + healthData provided)
 * 3. Final approval
 */
export const handleNurseVisitorApproval = async (
  visitorId: number,
  action: "Yes" | "No",
  formData?: {
    selectedAreas: string[];
    equipment: string[];
    permissionType: string;
    comments: string;
  },
  healthData?: any,
): Promise<void> => {
  try {
    const token = sessionStorage.getItem("token") as string;
    const decoded = jwtDecode<{ id: number }>(token);
    const nurseId = decoded.id;

    if (!nurseId) {
      showErrorToast("Nurse ID not found.");
      return;
    }

    // Step 1: High care request
    if (action === "Yes" && formData) {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/highcare/${visitorId}/request`,
        {
          nurseId,
          areas: formData.selectedAreas,
          equipment: formData.equipment,
          permissionType: formData.permissionType,
          comments: formData.comments,
        },
      );
    }

    // Step 2: Health declaration
    if (action === "Yes" && healthData) {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/health/${visitorId}/submit`,
        {
          ...healthData,
          nurseId,
        },
      );
    }

    // Step 3: Final approval
    await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_HOST}/nurse/${visitorId}/approval`,
      { nurseId },
    );

    showSuccessToast("Successfully submitted.");
  } catch (error: any) {
    showErrorToast(`Failed to update approval: ${error.message}`);
    throw error;
  }
};
