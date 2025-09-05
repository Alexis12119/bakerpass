"use client";

import React, { useState, useEffect, useMemo } from "react";
import TopBar from "@/components/common/Topbar";
import Filters from "@/components/Security/Filters";
import SecurityTable from "@/components/Security/Table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import DatePicker from "react-datepicker";
import {
  getPreviousDate,
  getNextDate,
} from "@/utils/handleDates";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import {
  fetchPurposes,
  fetchDepartments,
  fetchApprovalStatuses,
} from "@/utils/handleFilters";
import { Visitor, VisitorWithDropdownSec } from "@/types/Security";
import {
  fetchVisitorsByDate,
  toggleVisitorStatus,
  handleVisitorApproval,
} from "@/utils/handleVisitors";
import { initVisitorSocket } from "@/utils/visitorSocket";
import NewVisitModal from "@/components/Security/Modals/NewVisit";

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
  const [visitors, setVisitors] = useState<VisitorWithDropdownSec[]>([]);
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
  const [isNewVisitModalOpen, setIsNewVisitModalOpen] = useState(false);

  const onToggleVisitorStatus = async (visitorId: number) => {
    await toggleVisitorStatus(visitorId);
    fetchVisitorsByDate().then(setVisitors);
  };

  const onVisitorApproval = async (
    visitorId: number,
    approvalStatus: string,
  ) => {
    await handleVisitorApproval(visitorId, approvalStatus);
    fetchVisitorsByDate().then(setVisitors);
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
      const visitorsData = await fetchVisitorsByDate();
      setVisitors(visitorsData);

      const purposes = await fetchPurposes();
      setPurposes(purposes);

      const departments = await fetchDepartments();
      setDepartments(departments);

      const approvalStatuses = await fetchApprovalStatuses();
      setApprovalStatuses(approvalStatuses);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const visitorsData = await fetchVisitorsByDate();
      setVisitors(visitorsData);
    })();
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
      <TopBar
        role="Security Guard"
        showNewVisitButton
        onNewVisitClick={() => setIsNewVisitModalOpen(true)}
      />
      <div className="p-4 md:p-6 flex-1">
        <div className="bg-white shadow-md rounded-lg p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <h1 className="!text-xl !md:text-2xl font-bold text-black">
              VISITORS ({filteredVisitors.length})
            </h1>

            <div className="flex items-center space-x-2">
              <ChevronLeftIcon
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-black"
                onClick={() => setCurrentDate((prev) => getPreviousDate(prev))}
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
                onClick={() => setCurrentDate((prev) => getNextDate(prev))}
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
          onToggleStatus={onToggleVisitorStatus}
          validIdModalOpen={validIdModalOpen}
          setValidIdModalOpen={setValidIdModalOpen}
          statusActionModalOpen={statusActionModalOpen}
          setStatusActionModalOpen={setStatusActionModalOpen}
          selectedVisitor={selectedVisitor}
          setSelectedVisitor={setSelectedVisitor}
          setApprovalAction={setApprovalAction}
          handleVisitorApproval={onVisitorApproval}
          currentDate={currentDate}
        />

        <NewVisitModal
          isOpen={isNewVisitModalOpen}
          onClose={() => setIsNewVisitModalOpen(false)}
          fetchVisitorsByDate={async () => {
            const visitorsData = await fetchVisitorsByDate();
            setVisitors(visitorsData);
          }}
        />
      </div>
    </div>
  );
};

export default SecurityGuardPage;
