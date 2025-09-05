import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchFilters from "@/components/HumanResources/Reports/SearchFilters";
import EmployeeReportCards from "@/components/HumanResources/Reports/Cards";
import { Employee } from "@/types/HumanResources/Reports";
import { showErrorToast } from "@/utils/customToasts";

const HumanResourcesReportSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [employees, setEmployees] = useState<Record<string, Employee[]>>({});
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/departments`,
      );
      const names = data.map((dept: { name: string }) => dept.name);
      setDepartments(names);
    } catch (error: any) {
      showErrorToast(
        `Failed to fetch departments: ${
          error?.response?.data?.message || error.message
        }`,
      );
    }
  };

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedDepartment !== "All") {
        params.append("department", selectedDepartment);
      }

      const { data: rawData } = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees?${params.toString()}`,
      );

      if (!Array.isArray(rawData)) {
        showErrorToast("Unexpected employee data format.");
        setEmployees({});
        return;
      }

      const formattedData: Employee[] = rawData.map((emp: any) => ({
        id: emp.id.toString(),
        name: emp.name,
        department: emp.department,
        total_visitors: emp.total_visitors ?? 0,
        avg_visitors: emp.avg_visitors ?? 0,
        profileImageUrl: emp.profileImage,
      }));

      const grouped: Record<string, Employee[]> = {};
      formattedData.forEach((emp) => {
        const dept = emp.department || "Unassigned";
        if (!grouped[dept]) grouped[dept] = [];
        grouped[dept].push(emp);
      });

      setEmployees(grouped);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Error fetching employees.";
      showErrorToast(message);
      setEmployees({});
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [searchQuery, selectedDepartment]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    filterType: string,
  ) => {
    if (filterType === "department") {
      setSelectedDepartment(e.target.value);
    }
  };

  useEffect(() => {
    let socket: WebSocket;
    let reconnectTimer: NodeJS.Timeout;
    let isUnmounted = false;

    const connect = () => {
      socket = new WebSocket(
        `${process.env.NEXT_PUBLIC_BACKEND_WS}/ws/updates`,
      );

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = () => {
        console.log("Update received: refreshing employee stats...");
        fetchEmployees();
      };

      socket.onerror = (e) => {
        console.error("WebSocket error", e);
        socket.close();
      };

      socket.onclose = () => {
        console.log("WebSocket closed. Reconnecting in 5s...");
        if (!isUnmounted) {
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    };

    connect();

    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimer);
      socket.close();
    };
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-300">
      <SearchFilters
        searchQuery={searchQuery}
        selectedDepartment={selectedDepartment}
        departments={departments}
        handleSearchChange={handleSearchChange}
        handleFilterChange={handleFilterChange}
      />
      <div className="bg-white p-4">
        <EmployeeReportCards employees={employees} loading={isLoading} />
      </div>
    </div>
  );
};

export default HumanResourcesReportSection;
