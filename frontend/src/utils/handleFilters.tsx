import axios from "axios";

// Fetch purposes
export const fetchPurposes = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_HOST}/purposes`,
    );
    return response.data; // Let the caller handle setting state
  } catch (error) {
    console.error("Error fetching purposes:", error);
    return [];
  }
};

// Fetch departments
export const fetchDepartments = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_HOST}/departments`,
    );
    return response.data; // Let the caller handle setting state
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
};

// Fetch approval statuses
export const fetchApprovalStatuses = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_HOST}/approval_status`,
    );
    return response.data; // Let the caller handle setting state
  } catch (error) {
    console.error("Error fetching approval statuses:", error);
  }
};

