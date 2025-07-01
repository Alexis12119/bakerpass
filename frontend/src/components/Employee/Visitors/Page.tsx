"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import TopBar from "@/components/Employee/Visitors/TopBar";
import VisitorsSection from "@/components/Employee/Visitors/Section";
import { format, addDays, subDays } from "date-fns";
import { jwtDecode } from "jwt-decode";
import { VisitorWithDropdown } from "@/types/Employee";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";

const EmployeeVisitorsPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => {
    const savedDate = sessionStorage.getItem("visitor_filter_date");
    if (savedDate) return savedDate;

    const today = new Date();
    sessionStorage.setItem("visitor_filter_date", format(today, "yyyy-MM-dd"));
    return format(today, "yyyy-MM-dd");
  });

  const [approvalStatuses, setApprovalStatuses] = useState<string[]>([]);
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("All");
  const [purposes, setPurposes] = useState<string[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState("All");
  const [visitors, setVisitors] = useState<VisitorWithDropdown[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const mapVisitorsData = (visitors: any[]) => {
    return visitors.map((visitor) => ({
      id: visitor.visit_id,
      name: `${visitor.visitorFirstName} ${visitor.visitorLastName}`,
      contactNumber: visitor.contact_number,
      address: visitor.address,
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
      employeeId: visitor.employee_id,
    }));
  };
  const fetchVisitorsByDate = async () => {
    const date = sessionStorage.getItem("visitor_filter_date");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors-date?date=${date}`,
      );
      const data = await res.json();

      const mappedVisitors = mapVisitorsData(data);
      setVisitors(mappedVisitors);
    } catch (error: any) {
      showErrorToast(`Error fetching visitors by date: ${error.message}`);
      setVisitors([]); // clear fallback
    }
  };

  useEffect(() => {
    fetchVisitorsByDate();
  }, [currentDate]);

  const handlePreviousDate = () => {
    setCurrentDate((prev: string) => {
      const newDate = format(subDays(new Date(prev), 1), "yyyy-MM-dd");
      sessionStorage.setItem("visitor_filter_date", newDate);
      return newDate;
    });
  };

  const handleNextDate = () => {
    setCurrentDate((prev: string) => {
      const newDate = format(addDays(new Date(prev), 1), "yyyy-MM-dd");
      sessionStorage.setItem("visitor_filter_date", newDate);
      return newDate;
    });
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

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket data received:", data);

          if (data.type === "update") {
            fetchVisitorsByDate();

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
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      socket.onerror = (e) => {
        console.error("WebSocket error", e);
        socket.close(); // triggers `onclose`
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        if (!isUnmounted) {
          console.log("Attempting to reconnect in 5s...");
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
    } catch (error: any) {
      showErrorToast(`Failed to fetch purposes: ${error.message}`);
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
    } catch (error: any) {
      showErrorToast(`Error fetching approval statuses: ${error.message}`);
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

      const visitorsData = mapVisitorsData(response.data);

      setVisitors(visitorsData);
    } catch (error: any) {
      showErrorToast(`Error fetching visitors: ${error.message}`);
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
  const groupedVisitors = filteredVisitors.reduce(
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
    </div>
  );
};

export default EmployeeVisitorsPage;
