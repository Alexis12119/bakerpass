import { jwtDecode } from "jwt-decode";

export function getUserFromToken(): any | null {
  const token = sessionStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token) as any;
    return decoded;
  } catch {
    sessionStorage.removeItem("token");
    return null;
  }
}

export function clearSession() {
  for (const key in sessionStorage) {
    if (key.startsWith("profileImage_")) {
      sessionStorage.removeItem(key);
    }
  }
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("lastValidRoute");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("visitor_filter_date");
}
