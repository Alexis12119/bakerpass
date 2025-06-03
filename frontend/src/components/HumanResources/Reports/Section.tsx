import React, { useState, useEffect } from "react";
import SearchFilters from "@/components/HumanResources/Reports/SearchFilters";
import EmployeeReportCards from "@/components/HumanResources/Reports/Cards";

interface Employee {
  id: string;
  name: string;
  department: string;
  rating: number;
  total_visitors: number;
  avg_visitors: number;
}

const HumanResourcesReportSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [employees, setEmployees] = useState<Record<string, Employee[]>>({});
  const [departments, setDepartments] = useState<string[]>([]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/departments`,
      );
      const data = await res.json();
      const names = data.map((dept: { name: string }) => dept.name);
      setDepartments(names);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };
  const fetchEmployees = async () => {
    try {
      let url = `${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees?search=${searchQuery}&department=${selectedDepartment}`;
      const response = await fetch(url);
      const rawData = await response.json();

      // alert(JSON.stringify(rawData, null, 2));

      // Transform backend response into Employee format expected by frontend
      const formattedData: Employee[] = rawData.map((emp: any) => ({
        id: emp.id.toString(),
        name: emp.name,
        department: emp.department,
        rating: emp.rating ?? 0,
        total_visitors: emp.total_visitors ?? 0,
        avg_visitors: emp.avg_visitors ?? 0,
      }));

      // Transform into Record<string, Employee[]>
      const groupedEmployees: Record<string, Employee[]> = {};
      formattedData.forEach((employee) => {
        if (!groupedEmployees[employee.department]) {
          groupedEmployees[employee.department] = [];
        }
        groupedEmployees[employee.department].push(employee);
      });

      setEmployees(groupedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees({});
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, [searchQuery, selectedDepartment]);

  // Handle search input changes
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
        console.log("✅ WebSocket connected");
      };

      socket.onmessage = (event) => {
        console.log("📡 Update received: refreshing dashboard stats...");
        fetchStats();
      };

      socket.onerror = (e) => {
        console.error("❗WebSocket error", e);
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
        <div className="w-full">
          <EmployeeReportCards
            employees={employees}
            searchQuery={searchQuery}
            selectedDepartment={selectedDepartment}
          />
        </div>
      </div>
    </div>
  );
};

export default HumanResourcesReportSection;
