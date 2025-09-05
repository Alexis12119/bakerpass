"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import TopBar from "@/components/common/Topbar";
import VisitorsSection from "@/components/Employee/Visitors/Section";
import { format, addDays, subDays } from "date-fns";
import { VisitorWithDropdownEmp } from "@/types/Employee";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";
import { jwtDecode } from "jwt-decode";
import { getPreviousDate, getNextDate } from "@/utils/handleDates";
import { initVisitorSocket } from "@/utils/visitorSocket";
import { fetchPurposes, fetchApprovalStatuses } from "@/utils/handleFilters";
import { fetchVisitorsByDate } from "@/utils/handleVisitors";

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
  const [visitors, setVisitors] = useState<VisitorWithDropdownEmp[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const mapVisitorsData = (visitors: any[]) => {
    return visitors.map((visitor) => ({
      id: visitor.visit_id,
      name: `${visitor.visitorFirstName} ${visitor.visitorLastName}`,
      email: visitor.email,
      contactNumber: visitor.contact_number,
      address: visitor.address,
      purpose: visitor.purpose,
      employee: `${visitor.employeeFirstName} ${visitor.employeeLastName}`,
      department: visitor.employeeDepartment,
      expectedTime: visitor.expected_time,
      timeIn: visitor.time_in || null,
      timeOut: visitor.time_out || null,
      status: visitor.status,
      profileImageUrl: visitor.profile_image_url,
      approvalStatus: visitor.approval_status,
      isDropdownOpen: false,
      employeeId: visitor.employee_id,
    }));
  };

  const getEmployeeId = () => {
    const token = sessionStorage.getItem("token"); // or sessionStorage
    if (!token) return null;

    try {
      const decoded = jwtDecode(token) as { id: string };
      return decoded.id;
    } catch (err) {
      console.error("Invalid token:", err);
      return null;
    }
  };

  const loadVisitors = async () => {
    try {
      const employeeId = getEmployeeId();
      const data = await fetchVisitorsByDate(employeeId);
      setVisitors(data);
    } catch (error: any) {
      showErrorToast(`Error fetching visitors: ${error.message}`);
      setVisitors([]);
    }
  };

  useEffect(() => {
    loadVisitors();
  }, [currentDate]);

  const handlePreviousDate = () => {
    const newDate = getPreviousDate(currentDate);
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = getNextDate(currentDate);
    setCurrentDate(newDate);
  };

  useEffect(() => {
    const cleanup = initVisitorSocket({
      onVisitorsUpdate: setVisitors,
    });

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const purposesData = await fetchPurposes();
      const purposeNames = purposesData.map((p: { name: string }) => p.name);
      setPurposes(purposeNames);

      const approvalData = await fetchApprovalStatuses();
      const approvalNames = approvalData.map((a: { name: string }) => a.name);
      setApprovalStatuses(approvalNames);
    })();
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
          visitor.employee,
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
      const timeRange = `${visitor.expectedTime}`;
      if (!acc[timeRange]) {
        acc[timeRange] = [];
      }
      acc[timeRange].push(visitor);
      return acc;
    },
    {} as Record<string, VisitorWithDropdownEmp[]>,
  );

  console.log(groupedVisitors);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Main */}
      <div className="flex-1 transition-all duration-300 bg-gray-100">
        {/* TopBar */}
        <TopBar role="Employee" />

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
