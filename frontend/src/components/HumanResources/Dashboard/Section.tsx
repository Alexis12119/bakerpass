import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import SearchFilters from "@/components/HumanResources/Dashboard/SearchFilters";
import DashboardTable from "@/components/HumanResources/Dashboard/Table";
import axios from "axios";
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
}

interface VisitorWithDropdown extends Visitor {
  isDropdownOpen: boolean;
}

const VisitorsSection: React.FC = () => {
  const currentDate = new Date().toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
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
  const [allVisitors, setAllVisitors] = useState<VisitorWithDropdown[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<
    VisitorWithDropdown[]
  >([]);
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

  const toggleVisitorStatus = async (visitorId: string) => {
    try {
      // First, find the current visitor and status
      const currentVisitor = allVisitors.find((v) => v.id === visitorId);
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
        : `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors`;

      const response = await axios.get(endpoint);

      const visitorsData = response.data.map((visitor: any) => ({
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
        approvalStatus: visitor.approval_status,
        isDropdownOpen: false,
        isHighCare: visitor.is_high_care ?? undefined,
      }));

      setAllVisitors(visitorsData);
      setFilteredVisitors(visitorsData);
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
    const socket = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_WS}/ws/updates`);

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = () => {
      console.log("📡 Update received: refreshing visitors...");
      fetchVisitors();
    };

    socket.onerror = (e) => {
      console.error("❗WebSocket error", e);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket connection closed");
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    fetchData();
    fetchVisitors();
  }, []);

  useEffect(() => {
    let filtered = allVisitors.filter((visitor) => {
      // Purpose matching logic now comparing strings directly
      const purposeMatches =
        selectedPurpose === "All" ||
        visitor.purpose.toLowerCase() === selectedPurpose.toLowerCase(); // Compare purpose name directly

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
          visitor.purpose, // Directly using the purpose name here
          visitor.host,
          visitor.department,
          visitor.status,
          visitor.approvalStatus,
        ].some((field) => field && field.toLowerCase().includes(query)),
      );
    }

    setFilteredVisitors(filtered);
  }, [
    searchQuery,
    selectedHost,
    selectedPurpose,
    selectedDepartment,
    allVisitors,
    departments,
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
            <ChevronLeftIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
            <span className="text-gray-500" suppressHydrationWarning>
              {currentDate}
            </span>
            <ChevronRightIcon className="h-5 w-5 text-gray-400 cursor-pointer" />
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
