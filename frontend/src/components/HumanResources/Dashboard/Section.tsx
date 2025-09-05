"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SearchFilters from "@/components/HumanResources/Dashboard/SearchFilters";
import DashboardTable from "@/components/HumanResources/Dashboard/Table";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, subDays } from "date-fns";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";
import { fetchVisitorsByDate } from "@/utils/handleVisitors";
import { initVisitorSocket } from "@/utils/visitorSocket";
import axios from "axios";

import { VisitorWithDropdownHR } from "@/types/HumanResources/Dashboard";

const VisitorsSection: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => {
    const savedDate = sessionStorage.getItem("visitor_filter_date");
    if (savedDate) return savedDate;

    const today = new Date();
    sessionStorage.setItem("visitor_filter_date", format(today, "yyyy-MM-dd"));
    return format(today, "yyyy-MM-dd");
  });

  const [approvalStatuses, setApprovalStatuses] = useState<
    { id: string; name: string }[]
  >([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [purposes, setPurposes] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<
    { id: string; name: string }[]
  >([]);

  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("All");
  const [selectedEmployee, setSelectedEmployee] = useState("All");
  const [selectedPurpose, setSelectedPurpose] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [visitors, setVisitors] = useState<VisitorWithDropdown[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const updateCurrentDate = (newDate: string) => {
    setCurrentDate(newDate);
    sessionStorage.setItem("visitor_filter_date", newDate);
    window.dispatchEvent(new CustomEvent("dateChanged"));
  };

  const handlePreviousDate = () => {
    const newDate = format(subDays(new Date(currentDate), 1), "yyyy-MM-dd");
    updateCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = format(addDays(new Date(currentDate), 1), "yyyy-MM-dd");
    updateCurrentDate(newDate);
  };

  const loadVisitors = async () => {
    try {
      const data = await fetchVisitorsByDate(null); // HR sees all employees
      setVisitors(data);
    } catch (error: any) {
      showErrorToast(`Failed to fetch visitors: ${error.message}`);
    }
  };

  const fetchData = async () => {
    try {
      const [employeesRes, purposesRes, departmentsRes, approvalRes] =
        await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees/all`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/purposes`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/departments`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/approval_status`),
        ]);

      setEmployees(employeesRes.data);
      setPurposes(purposesRes.data);
      setDepartments(departmentsRes.data);
      setApprovalStatuses(approvalRes.data);
    } catch (error: any) {
      showErrorToast(`Failed to fetch data: ${error.message}`);
    }
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
    fetchData();
  }, []);

  useEffect(() => {
    loadVisitors();
  }, [currentDate]);

  const filteredVisitors = useMemo(() => {
    let filtered = visitors.filter((visitor) => {
      const purposeMatches =
        selectedPurpose === "All" ||
        visitor.purpose.toLowerCase() === selectedPurpose.toLowerCase();
      const approvalMatches =
        selectedApprovalStatus === "All" ||
        visitor.approvalStatus.toLowerCase() ===
          selectedApprovalStatus.toLowerCase();
      return (
        (selectedEmployee === "All" || visitor.employee === selectedEmployee) &&
        purposeMatches &&
        (selectedDepartment === "All" ||
          visitor.department === selectedDepartment) &&
        approvalMatches
      );
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((visitor) =>
        [
          visitor.name,
          visitor.purpose,
          visitor.employee,
          visitor.department,
          visitor.status,
          visitor.approvalStatus,
        ].some((field) => field?.toLowerCase().includes(q)),
      );
    }

    return filtered;
  }, [
    visitors,
    searchQuery,
    selectedEmployee,
    selectedPurpose,
    selectedDepartment,
    selectedApprovalStatus,
  ]);

  return (
    <div className="bg-white shadow-md">
      <div className="bg-white rounded-lg p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <h1 className="!text-xl !md:text-2xl font-bold text-black">
            VISITORS ({filteredVisitors.length})
          </h1>

          <div className="flex items-center space-x-2">
            <ChevronLeftIcon
              className="h-5 w-5 text-gray-400 cursor-pointer hover:text-black"
              onClick={handlePreviousDate}
            />
            <DatePicker
              selected={new Date(currentDate)}
              onChange={(date: Date | null) => {
                if (!date) return;
                const formatted = format(date, "yyyy-MM-dd");
                updateCurrentDate(formatted);
              }}
              dateFormat="MMMM dd, yyyy"
              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
            />
            <ChevronRightIcon
              className="h-5 w-5 text-gray-400 cursor-pointer hover:text-black"
              onClick={handleNextDate}
            />
          </div>

          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            selectedPurpose={selectedPurpose}
            setSelectedPurpose={setSelectedPurpose}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            employees={employees}
            purposes={purposes}
            departments={departments}
            approvalStatuses={approvalStatuses}
            selectedApprovalStatus={selectedApprovalStatus}
            setSelectedApprovalStatus={setSelectedApprovalStatus}
          />
        </div>
      </div>

      <DashboardTable visitors={filteredVisitors} />
    </div>
  );
};

export default VisitorsSection;
