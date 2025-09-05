import { fetchVisitorsByDate } from "@/utils/handleVisitors";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";
import { VisitorWithDropdown } from "@/types/Security";

export type VisitorSocketCallbacks = {
  onVisitorsUpdate?: (visitors: VisitorWithDropdown[]) => void;
};

export const initVisitorSocket = (
  callbacks: VisitorSocketCallbacks,
): (() => void) => {
  let socket: WebSocket;
  let reconnectTimer: NodeJS.Timeout;
  let isUnmounted = false;

  const connect = () => {
    socket = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_WS}/ws/updates`);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📡 WebSocket data received:", data);

        if (data.type === "update") {
          const visitors = await fetchVisitorsByDate();
          callbacks.onVisitorsUpdate?.(visitors);

          if (data.notify) {
            const { status, message } = data.notify;
            if (status === "success") showSuccessToast(message);
            else if (status === "error") showErrorToast(message);
          }
        } else if (data.type === "notification") {
          const { status, message } = data;
          if (status === "success") showSuccessToast(message);
          else if (status === "error") showErrorToast(message);
        }
      } catch (err) {
        console.error("❗ Failed to parse WebSocket message:", err);
      }
    };

    socket.onerror = (e) => {
      console.error("❗ WebSocket error", e);
      socket.close(); // triggers onclose
    };

    socket.onclose = () => {
      console.log("❌ WebSocket connection closed");
      if (!isUnmounted) {
        console.log("🔄 Attempting to reconnect in 5s...");
        reconnectTimer = setTimeout(connect, 5000);
      }
    };
  };

  connect();

  // cleanup function
  return () => {
    isUnmounted = true;
    clearTimeout(reconnectTimer);
    socket.close();
  };
};
