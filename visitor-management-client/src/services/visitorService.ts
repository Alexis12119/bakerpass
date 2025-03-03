import axios from "axios";
import { Visitor } from "../types/Visitor";

const API_URL = "https://trolley.proxy.rlwy.net:3001";

export const fetchVisitors = async (): Promise<Visitor[]> => {
  const response = await axios.get(`${API_URL}/visitors`);
  return response.data;
};

export const addVisitor = async (
  visitorData: Omit<Visitor, "id" | "timeIn" | "timeOut">,
): Promise<Visitor> => {
  const response = await axios.post(`${API_URL}/visitors`, visitorData);
  return response.data;
};

export const timeOutVisitor = async (id: number): Promise<Visitor> => {
  const response = await axios.put(`${API_URL}/visitors/${id}/timeout`);
  return response.data;
};
