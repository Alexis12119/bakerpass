import { showErrorToast } from "./customToasts";
import axios from "axios";

interface AxiosErrorOptions {
  fallbackMessage?: string;
  statusMessages?: Record<number, string>;
  connectionMessage?: string;
}

export function handleAxiosError(error: any, options: AxiosErrorOptions = {}) {
  const {
    fallbackMessage = "Something went wrong.",
    statusMessages = {},
    connectionMessage = "Cannot connect to the server. Please try again later.",
  } = options;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    // Custom status message map (like 401, 429, 502)
    if (status && statusMessages[status]) {
      showErrorToast(statusMessages[status]);
      return;
    }

    // Network errors
    if (
      error.code === "ECONNREFUSED" ||
      error.message?.includes("Network Error")
    ) {
      showErrorToast(connectionMessage);
      return;
    }

    // API-provided error
    if (error.response?.data?.message) {
      showErrorToast(error.response.data.message);
      return;
    }
  }

  // Fallback
  showErrorToast(error?.message || fallbackMessage);
}
