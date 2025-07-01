import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SearchFilters from "@/components/HumanResources/Dashboard/SearchFilters";
import DashboardTable from "@/components/HumanResources/Dashboard/Table";
import axios from "axios";
import { format, addDays, subDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";

interface Visitor {
  id: string;
  name: string;
  purpose: string;
  host: string;
  department: string;
  expectedTime: string;
  timeIn: string | null;
  timeOut: string | null;
  status: "Checked In" | "Ongoing" | "Checked Out";
  approvalStatus: "Waiting For Approval" | "Approved" | "Blocked" | "Cancelled";
  profileImageUrl: string;
}

interface VisitorWithDropdown extends Visitor {
  isDropdownOpen: boolean;
}

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
  const [hosts, setHosts] = useState<{ id: string; name: string }[]>([]);
  const [purposes, setPurposes] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("All");
  const [selectedHost, setSelectedHost] = useState("All");
  const [selectedPurpose, setSelectedPurpose] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [visitors, setVisitors] = useState<VisitorWithDropdown[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fetchData = async () => {
    try {
      const [
        hostsResponse,
        purposesResponse,
        departmentsResponse,
        approvalStatusesResponse,
      ] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees/hosts`),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/purposes`),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/departments`),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/approval_status`),
      ]);

      setHosts(hostsResponse.data);
      setPurposes(purposesResponse.data);
      setDepartments(departmentsResponse.data);
      setApprovalStatuses(approvalStatusesResponse.data);
    } catch (error: any) {
      showErrorToast(`Failed to fetch data: ${error.message}`);
    }
  };

  const mapVisitorsData = (visitors: any[]) => {
    return visitors.map((visitor) => ({
      id: visitor.visit_id,
      name: `${visitor.visitorFirstName} ${visitor.visitorLastName}`,
      purpose: visitor.purpose,
      host: `${visitor.employeeFirstName} ${visitor.employeeLastName}`,
      department: visitor.employeeDepartment,
      expectedTime:
        visitor.expected_time ||
        formatTimeRange(visitor.time_in, visitor.time_out),
      timeIn: visitor.time_in || null,
      timeOut: visitor.time_out || null,
      status: visitor.status,
      profileImageUrl: visitor.profile_image_url,
      approvalStatus: visitor.approval_status,
      isDropdownOpen: false,
      isHighCare: visitor.is_high_care ?? undefined,
    }));
  };

  useEffect(() => {
    fetchVisitors();
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

  const fetchVisitors = async (forNurse = true) => {
    const date = sessionStorage.getItem("visitor_filter_date");
    try {
      const endpoint = forNurse
        ? `${process.env.NEXT_PUBLIC_BACKEND_HOST}/nurse/high-care-visits`
        : `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors-date?date=${date}`;

      const response = await axios.get(endpoint);

      const visitorsData = mapVisitorsData(response.data);

      setVisitors(visitorsData);
    } catch (error: any) {
      showErrorToast(`Failed to fetch visitors: ${error.message}`);
    }
  };

  // Helper function to format time range from separate time_in and time_out
  const formatTimeRange = (timeIn: string | null, timeOut: string | null) => {
    if (!timeIn || !timeOut) return "Not scheduled";

    // Format times to be more readable (e.g., "08:00" instead of "08:00:00")
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
            fetchVisitors();

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
    fetchData();
    fetchVisitors();
  }, []);

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
        (selectedHost === "All" || visitor.host === selectedHost) &&
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
          visitor.host,
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
    selectedHost,
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

          <SearchFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedHost={selectedHost}
            setSelectedHost={setSelectedHost}
            selectedPurpose={selectedPurpose}
            setSelectedPurpose={setSelectedPurpose}
            selectedDepartment={selectedDepartment}
            setSelectedDepartment={setSelectedDepartment}
            hosts={hosts}
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
