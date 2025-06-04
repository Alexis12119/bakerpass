"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import TopBar from "@/components/Employee/Visitors/TopBar";
import VisitorsSection from "@/components/Employee/Visitors/Section";
import ErrorModal from "@/components/Modals/ErrorModal";
import { format, addDays, subDays } from "date-fns";
import { jwtDecode } from "jwt-decode";

interface Visitor {
  id: string;
  name: string;
  purpose: string;
  host: string;
  department: string;
  expected_time: string;
  timeIn: string;
  timeOut: string;
  status: string;
  approvalStatus: string;
  profileImageUrl: string;
}

interface VisitorWithDropdown extends Visitor {
  isDropdownOpen: boolean;
}

const EmployeeVisitorsPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  });

  const [approvalStatuses, setApprovalStatuses] = useState<string[]>([]);
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("All");
  const [purposes, setPurposes] = useState<string[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState("All");
  const [visitors, setVisitors] = useState<VisitorWithDropdown[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const mapVisitorsData = (visitors: any[]) => {
    return visitors.map((visitor) => ({
      id: visitor.visit_id,
      name: `${visitor.visitorFirstName} ${visitor.visitorLastName}`,
      purpose: visitor.purpose,
      host: `${visitor.employeeFirstName} ${visitor.employeeLastName}`,
      department: visitor.employeeDepartment,
      expected_time: visitor.expected_time,
      timeIn: visitor.time_in || null,
      timeOut: visitor.time_out || null,
      status: visitor.status,
      profileImageUrl: visitor.profile_image_url,
      approvalStatus: visitor.approval_status,
      isDropdownOpen: false,
      isHighCare: visitor.is_high_care ?? undefined,
    }));
  };
  const fetchVisitorsByDate = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors-date?date=${currentDate}`,
      );
      const data = await res.json();

      const mappedVisitors = mapVisitorsData(data);
      setVisitors(mappedVisitors); // <-- set visitors here
    } catch (error) {
      console.error("Error fetching visitors by date:", error);
      setVisitors([]); // clear fallback
    }
  };

  useEffect(() => {
    fetchVisitorsByDate();
  }, [currentDate]);
  const handlePreviousDate = () => {
    setCurrentDate((prev: string) =>
      format(subDays(new Date(prev), 1), "yyyy-MM-dd"),
    );
  };

  const handleNextDate = () => {
    setCurrentDate((prev: string) =>
      format(addDays(new Date(prev), 1), "yyyy-MM-dd"),
    );
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

      socket.onmessage = () => {
        console.log("📡 Update received: refreshing visitors...");
        fetchVisitorsByDate();
      };

      socket.onerror = (e) => {
        console.error("❗WebSocket error", e);
        socket.close(); // triggers `onclose`
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

  const fetchPurposes = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/purposes`,
      );
      const data = await res.json();
      const names = data.map((p: { name: string }) => p.name);
      setPurposes(names);
    } catch (error) {
      // console.error("Failed to fetch purposes:", error);
      setErrorMessage("Failed to fetch purposes");
    }
  };

  const fetchApprovalStatuses = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/approval_status`,
      );
      const data = await res.json();
      const names = data.map((p: { name: string }) => p.name);
      setApprovalStatuses(names);
    } catch (error) {
      console.error("Failed to fetch approval statuses:", error);
    }
  };
  const fetchVisitors = async () => {
    try {
      const token = sessionStorage.getItem("token") as string;
      const decoded = jwtDecode(token) as {
        id: number;
      };
      const employeeId = decoded.id;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors`,
        {
          params: { employeeId }, // only filters if logged in as employee
        },
      );

      console.log(response.data);

      const visitorsData = mapVisitorsData(response.data);

      setVisitors(visitorsData);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  };

  useEffect(() => {
    fetchPurposes();
    fetchApprovalStatuses();
    fetchVisitorsByDate();
  }, []);

  const handleFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    filterType: string,
  ) => {
    const value = event.target.value;
    if (filterType === "purpose") setSelectedPurpose(value);
    if (filterType === "approvalStatus") setSelectedApprovalStatus(value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredVisitors = useMemo(() => {
    let filtered = visitors.filter((visitor) => {
      const purposeMatches =
        selectedPurpose === "All" ||
        visitor.purpose.toLowerCase() === selectedPurpose.toLowerCase();

      const approvalStatusMatches =
        selectedApprovalStatus === "All" ||
        visitor.approvalStatus.toLowerCase() ===
          selectedApprovalStatus.toLowerCase();

      return purposeMatches && approvalStatusMatches;
    });

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((visitor) =>
        [
          visitor.name,
          visitor.purpose,
          visitor.host,
          visitor.department,
          visitor.status,
          visitor.approvalStatus,
        ].some((field) => field && field.toLowerCase().includes(query)),
      );
    }

    return filtered;
  }, [visitors, searchQuery, selectedPurpose, selectedApprovalStatus]);

  // Group visitors by time ranges
  const groupedVisitors = visitors.reduce(
    (acc, visitor) => {
      const timeRange = `${visitor.expected_time}`;
      if (!acc[timeRange]) {
        acc[timeRange] = [];
      }
      acc[timeRange].push(visitor);
      return acc;
    },
    {} as Record<string, VisitorWithDropdown[]>,
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main */}
      <div className="flex-1 transition-all duration-300 bg-gray-100">
        {/* TopBar */}
        <TopBar />

        <div className="px-4 md:px-8 flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-black mb-4">Visitors List</h1>

          {/* VisitorsSection */}
          <VisitorsSection
            searchQuery={searchQuery}
            selectedPurpose={selectedPurpose}
            currentDate={currentDate}
            purposes={purposes}
            groupedVisitors={groupedVisitors}
            handleSearchChange={handleSearchChange}
            handleFilterChange={handleFilterChange}
            selectedApprovalStatus={selectedApprovalStatus}
            approvalStatuses={approvalStatuses}
            fetchVisitors={fetchVisitors}
            handlePreviousDate={handlePreviousDate}
            handleNextDate={handleNextDate}
            setCurrentDate={setCurrentDate}
          />
        </div>
      </div>
      {/* Error Modal */}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}
    </div>
  );
};

export default EmployeeVisitorsPage;
