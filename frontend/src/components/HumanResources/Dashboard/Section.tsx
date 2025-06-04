import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SearchFilters from "@/components/HumanResources/Dashboard/SearchFilters";
import DashboardTable from "@/components/HumanResources/Dashboard/Table";
import axios from "axios";
import { format, addDays, subDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    const today = new Date();
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
    } catch (error) {
      console.error("Error fetching data:", error);
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
  const toggleVisitorStatus = async (visitorId: string) => {
    try {
      // First, find the current visitor and status
      const currentVisitor = visitors.find((v) => v.id === visitorId);
      if (!currentVisitor) return;

      // Determine the current status and decide on the next status
      let newStatus: "Checked In" | "Checked Out" | "Ongoing" = "Checked In";

      // If the visitor has checked in but not checked out, set status to "Ongoing"
      if (currentVisitor.status === "Checked In" && !currentVisitor.timeOut) {
        newStatus = "Ongoing";
      }
      // If the visitor has completed their visit, set status to "Checked Out"
      else if (
        currentVisitor.status === "Ongoing" ||
        (currentVisitor.status === "Checked In" && currentVisitor.timeOut)
      ) {
        newStatus = "Checked Out";
      }

      // Send the update request to the server with the new status
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors/${visitorId}/status`,
        { status: newStatus },
      );

      await fetchVisitors(); // Refresh the list of visitors
      // Show success message
      console.log("Toggled visitor status:", newStatus);
    } catch (error) {
      console.error("Error toggling visitor status:", error);
    }
  };

  const fetchVisitors = async (forNurse = false) => {
    try {
      const endpoint = forNurse
        ? `${process.env.NEXT_PUBLIC_BACKEND_HOST}/nurse/high-care-visits`
        : `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors-date?date=${currentDate}`; // <-- Fix here

      const response = await axios.get(endpoint);

      const visitorsData = mapVisitorsData(response.data);

      setVisitors(visitorsData);
    } catch (error) {
      console.error("Error fetching visitors:", error);
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

      socket.onmessage = () => {
        console.log("📡 Update received: refreshing visitors...");
        fetchVisitors();
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
              onChange={(date: Date) =>
                setCurrentDate(format(date, "yyyy-MM-dd"))
              }
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

      <DashboardTable
        visitors={filteredVisitors}
        toggleVisitorStatus={toggleVisitorStatus}
      />
    </div>
  );
};

export default VisitorsSection;
