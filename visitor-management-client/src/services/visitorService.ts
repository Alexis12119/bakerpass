import axios from "axios";
import { Visitor } from "../types/Visitor";

const API_URL = "http://trolley.proxy.rlwy.net:3001";

// Configure axios with better defaults
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request/response interceptors for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    return Promise.reject(error);
  },
);

export const fetchVisitors = async (): Promise<Visitor[]> => {
  try {
    const response = await apiClient.get("/visitors");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch visitors:", error);
    throw error;
  }
};

export const addVisitor = async (
  visitorData: Omit<Visitor, "id" | "timeIn" | "timeOut">,
): Promise<Visitor> => {
  try {
    const response = await apiClient.post("/visitors", visitorData);
    return response.data;
  } catch (error) {
    console.error("Failed to add visitor:", error);
    throw error;
  }
};

export const timeOutVisitor = async (id: number): Promise<Visitor> => {
  try {
    const response = await apiClient.put(`/visitors/${id}/timeout`);
    return response.data;
  } catch (error) {
    console.error("Failed to time out visitor:", error);
    throw error;
  }
};

// Health check to verify API is accessible
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get("/health");
    return response.status === 200;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
};
