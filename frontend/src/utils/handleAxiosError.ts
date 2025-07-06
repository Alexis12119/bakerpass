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

    // Handle 429 Rate Limit with dynamic retry time
    if (status === 429) {
      const errorMessage = error.response?.data?.message || error.message;

      // Extract retry time from Fastify's error message
      const retryMatch = errorMessage.match(/retry in (\d+) minutes?/);
      if (retryMatch) {
        const minutes = parseInt(retryMatch[1]);
        const message = `Too many attempts. Please try again in ${minutes} minute/s.`;
        showErrorToast(message);
        return;
      }

      // Fallback for 429 if no retry time found
      showErrorToast(
        statusMessages[429] || "Too many attempts. Please wait and try again.",
      );
      return;
    }

    // Custom status message map (like 401, 502)
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
