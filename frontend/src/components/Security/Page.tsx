"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import TopBar from "@/components/Security/TopBar";
import Filters from "@/components/Security/Filters";
import SecurityTable from "@/components/Security/Table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import ErrorModal from "@/components/Modals/ErrorModal";
import SuccessModal from "@/components/Modals/SuccessModal";

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

const SecurityGuardPage: React.FC = () => {
  const currentDate = new Date().toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const [approvalStatuses, setApprovalStatuses] = useState<
    { id: string; name: string }[]
  >([]);
  const [purposes, setPurposes] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedHost, setSelectedHost] = useState("All");
  const [selectedPurpose, setSelectedPurpose] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState("All");
  const [allVisitors, setAllVisitors] = useState<VisitorWithDropdown[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<
    VisitorWithDropdown[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [validIdModalOpen, setValidIdModalOpen] = useState(false);

  // For confirmation modal
  const [statusActionModalOpen, setStatusActionModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [approvalAction, setApprovalAction] = useState<
    "Approved" | "Blocked" | "Cancelled" | null
  >(null);

  const toggleVisitorStatus = async (
    visitorId: string,
    validIdTypeId: number,
  ) => {
    try {
      const currentVisitor = allVisitors.find((v) => v.id === visitorId);
      if (!currentVisitor) return;

      if (currentVisitor.status === "Checked Out") {
        setErrorMessage("Visitor has already checked out.");
        return;
      }

      let newStatus: "Checked In" | "Ongoing" | "Checked Out" = "Checked In";

      if (
        currentVisitor.status.toLowerCase() === "Checked In".toLowerCase() &&
        !currentVisitor.timeOut
      ) {
        newStatus = "Ongoing";
      } else if (
        currentVisitor.status.toLowerCase() === "Ongoing".toLowerCase() ||
        (currentVisitor.status.toLowerCase() === "Checked In".toLowerCase() &&
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

      await fetchVisitors();
    } catch (error) {
      console.error("Error toggling visitor status:", error);
    }
  };

  const handleVisitorApproval = async (
    action: "Approved" | "Blocked" | "Cancelled",
  ) => {
    if (!selectedVisitor) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors/${selectedVisitor.id}/approval`,
        {
          status: action,
        },
      );
      await fetchVisitors();
      setSuccessMessage(`Visitor successfully ${action}.`);
    } catch (error) {
      setErrorMessage("Failed to update visitor approval status.");
      console.error(error);
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

  const fetchVisitors = async (forNurse = false) => {
    try {
      const endpoint = forNurse
        ? `${process.env.NEXT_PUBLIC_BACKEND_HOST}/nurse/high-care-visits`
        : `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors`;
      console.log(endpoint);

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
    fetchVisitors();
    fetchPurposes();
    fetchDepartments();
    fetchApprovalStatuses();
  }, []);

  useEffect(() => {
    let filtered = allVisitors.filter((visitor) => {
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <TopBar fetchVisitors={fetchVisitors} />
      <div className="p-4 md:p-6 flex-1">
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <h1 className="!text-xl !md:text-2xl font-bold text-black">
              VISITORS ({filteredVisitors.length})
            </h1>
            <div className="flex items-center space-x-2">
              <ChevronLeftIcon className="h-5 w-5 text-gray-400" />
              <span className="text-gray-500" suppressHydrationWarning>
                {currentDate}
              </span>
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
            </div>
            <Filters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedHost={selectedHost}
              setSelectedHost={setSelectedHost}
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
          approvalAction={approvalAction}
          setApprovalAction={setApprovalAction}
          handleVisitorApproval={handleVisitorApproval}
        />
      </div>

      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => setSuccessMessage("")}
        />
      )}
    </div>
  );
};

export default SecurityGuardPage;
