"use client";

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import TopBar from "@/components/Security/TopBar";
import Filters from "@/components/Security/Filters";
import SecurityTable from "@/components/Security/Table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Visitor, VisitorWithDropdown } from "@/types/Security";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";

const SecurityGuardPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(() => {
    const savedDate = sessionStorage.getItem("visitor_filter_date");
    if (savedDate) return savedDate;

    const today = new Date();
    sessionStorage.setItem("visitor_filter_date", format(today, "yyyy-MM-dd"));
    return format(today, "yyyy-MM-dd");
  });

  const [_approvalStatuses, setApprovalStatuses] = useState<
    { id: string; name: string }[]
  >([]);
  const [_purposes, setPurposes] = useState<{ id: number; name: string }[]>([]);
  const [_departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedEmployee, setSelectedEmployee] = useState("All");
  const [selectedPurpose, setSelectedPurpose] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("All");
  const [visitors, setVisitors] = useState<VisitorWithDropdown[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [validIdModalOpen, setValidIdModalOpen] = useState(false);

  // For confirmation modal
  const [statusActionModalOpen, setStatusActionModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [_approvalAction, setApprovalAction] = useState<
    | "Approved"
    | "Blocked"
    | "Cancelled"
    | "Nurse Approved"
    | "Partial Approved"
    | null
  >(null);

  const mapVisitorsData = (visitors: any[]) => {
    return visitors.map((visitor) => ({
      id: visitor.visit_id,
      name: `${visitor.visitorFirstName} ${visitor.visitorLastName}`,
      purpose: visitor.purpose,
      employee: `${visitor.employeeFirstName} ${visitor.employeeLastName}`,
      department: visitor.employeeDepartment,
      expectedTime:
        visitor.expected_time ||
        formatTimeRange(visitor.time_in, visitor.time_out),
      timeIn: visitor.time_in || null,
      timeOut: visitor.time_out || null,
      status: visitor.status,
      approvalStatus: visitor.approval_status,
      profileImageUrl: visitor.profile_image_url,
      isDropdownOpen: false,
      isHighCare: visitor.is_high_care ?? undefined,
    }));
  };

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

  function parseTimeString(timeStr: string): Date {
    const [time, meridian] = timeStr.trim().split(/[\s]+/); // e.g., ['9:00', 'A.M.']
    let [hours, minutes] = time.split(":").map(Number);
    if (meridian.toUpperCase().startsWith("P") && hours !== 12) hours += 12;
    if (meridian.toUpperCase().startsWith("A") && hours === 12) hours = 0;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  const toggleVisitorStatus = async (
    visitorId: string,
    validIdTypeId: number,
  ) => {
    try {
      const currentVisitor = visitors.find((v) => v.id === visitorId);
      if (!currentVisitor) return;

      // ⏰ Validate against expected time range using the *current time*
      if (currentVisitor.expectedTime) {
        const [startStr, endStr] = currentVisitor.expectedTime
          .split("-")
          .map((s) => s.trim());
        const expectedStart = parseTimeString(startStr);
        const expectedEnd = parseTimeString(endStr);
        const now = new Date();

        const isInRange =
          now.getTime() >= expectedStart.getTime() &&
          now.getTime() <= expectedEnd.getTime();

        if (!isInRange) {
          showErrorToast("Time In must be within the expected time range.");
          return;
        }
      }

      if (
        currentVisitor.status === "Checked In" &&
        currentVisitor.timeIn &&
        currentVisitor.timeOut &&
        currentVisitor.timeIn === currentVisitor.timeOut
      ) {
        showErrorToast("Time In and Time Out cannot be the same.");
        return;
      }

      if (currentVisitor.status === "Checked Out") {
        showErrorToast("Visitor has already checked out.");
        return;
      }

      let newStatus: "Checked In" | "Ongoing" | "Checked Out" = "Checked In";

      if (
        currentVisitor.status.toLowerCase() === "checked in" &&
        !currentVisitor.timeOut
      ) {
        newStatus = "Ongoing";
      } else if (
        currentVisitor.status.toLowerCase() === "ongoing" ||
        (currentVisitor.status.toLowerCase() === "checked in" &&
          currentVisitor.timeOut)
      ) {
        newStatus = "Checked Out";
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors/${visitorId}/status`,
        {
          status: newStatus,
          validIdTypeId,
        },
      );

      await fetchVisitorsByDate();
    } catch (error) {
      console.error("Error toggling visitor status:", error);
    }
  };

  const handleVisitorApproval = async (
    action:
      | "Approved"
      | "Blocked"
      | "Cancelled"
      | "Nurse Approved"
      | "Partial Approved",
  ) => {
    if (!selectedVisitor) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visits/${selectedVisitor.id}/approval`,
        { statusName: action },
      );
      await fetchVisitorsByDate();
      showSuccessToast(`Visitor successfully ${action}.`);
    } catch (error: any) {
      showErrorToast(
        `Failed to update visitor approval status: ${error.message}`,
      );
    } finally {
      setStatusActionModalOpen(false);
      setSelectedVisitor(null);
      setApprovalAction(null);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/departments`,
      );
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchVisitorsByDate = async (forNurse = false) => {
    const date = sessionStorage.getItem("visitor_filter_date");
    try {
      const endpoint = forNurse
        ? `${process.env.NEXT_PUBLIC_BACKEND_HOST}/nurse/high-care-visits?date=${date}`
        : `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors-date?date=${date}`;

      const response = await axios.get(endpoint);

      const visitorsData = mapVisitorsData(response.data);

      setVisitors(visitorsData);
    } catch (error) {
      console.error("Error fetching visitors:", error);
    }
  };

  const fetchPurposes = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/purposes`,
      );
      setPurposes(response.data);
    } catch (error) {
      console.error("Error fetching purposes:", error);
    }
  };

  const fetchApprovalStatuses = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/approval_status`,
      );
      setApprovalStatuses(response.data);
    } catch (error) {
      console.error("Error fetching approval statuses:", error);
    }
  };

  const formatTimeRange = (timeIn: string | null, timeOut: string | null) => {
    if (!timeIn || !timeOut) return "Not scheduled";
    const formatTime = (time: string) => {
      if (!time) return "";
      const [hours, minutes] = time.split(":");
      return `${hours}:${minutes}`;
    };
    return `${formatTime(timeIn)} - ${formatTime(timeOut)}`;
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
        try {
          const data = JSON.parse(event.data);
          console.log("📡 WebSocket data received:", data);

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
          console.error("❗ Failed to parse WebSocket message:", err);
        }
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

  useEffect(() => {
    fetchVisitorsByDate();
    fetchPurposes();
    fetchDepartments();
    fetchApprovalStatuses();
  }, []);

  useEffect(() => {
    fetchVisitorsByDate();
  }, [currentDate]);

  const filteredVisitors = useMemo(() => {
    let filtered = visitors.filter((visitor) => {
      const purposeMatches =
        selectedPurpose === "All" ||
        visitor.purpose.toLowerCase() === selectedPurpose.toLowerCase();

      const approvalStatusMatches =
        selectedApprovalStatus === "All" ||
        visitor.approvalStatus.toLowerCase() ===
          selectedApprovalStatus.toLowerCase();

      return (
        (selectedEmployee === "All" || visitor.employee === selectedEmployee) &&
        purposeMatches &&
        (selectedDepartment === "All" ||
          visitor.department === selectedDepartment) &&
        approvalStatusMatches
      );
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
  }, [
    visitors,
    searchQuery,
    selectedEmployee,
    selectedPurpose,
    selectedDepartment,
    selectedApprovalStatus,
  ]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TopBar fetchVisitorsByDate={fetchVisitorsByDate} />
      <div className="p-4 md:p-6 flex-1">
        <div className="bg-white shadow-md rounded-lg p-4">
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
                  if (date) {
                    const formatted = format(date, "yyyy-MM-dd");
                    setCurrentDate(formatted);
                    sessionStorage.setItem("visitor_filter_date", formatted);
                  }
                }}
                dateFormat="MMMM dd, yyyy"
                className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
              />
              <ChevronRightIcon
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-black"
                onClick={handleNextDate}
              />
            </div>

            <Filters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedEmployee={selectedEmployee}
              setSelectedEmployee={setSelectedEmployee}
              selectedPurpose={selectedPurpose}
              setSelectedPurpose={setSelectedPurpose}
              selectedDepartment={selectedDepartment}
              setSelectedDepartment={setSelectedDepartment}
              selectedApprovalStatus={selectedApprovalStatus}
              setSelectedApprovalStatus={setSelectedApprovalStatus}
            />
          </div>
        </div>
        <SecurityTable
          visitors={filteredVisitors}
          onToggleStatus={toggleVisitorStatus}
          validIdModalOpen={validIdModalOpen}
          setValidIdModalOpen={setValidIdModalOpen}
          statusActionModalOpen={statusActionModalOpen}
          setStatusActionModalOpen={setStatusActionModalOpen}
          selectedVisitor={selectedVisitor}
          setSelectedVisitor={setSelectedVisitor}
          setApprovalAction={setApprovalAction}
          handleVisitorApproval={handleVisitorApproval}
        />
      </div>
    </div>
  );
};

export default SecurityGuardPage;
