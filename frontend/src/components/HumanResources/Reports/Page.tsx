"use client";

import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/HumanResources/Shared/Sidebar";
import TopBar from "@/components/HumanResources/Reports/TopBar";
import HumanResourcesReportSection from "@/components/HumanResources/Reports/Section";

const HumanResourcesReportsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // ESC key closes sidebar
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") closeSidebar();
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSidebarOpen, handleKeyDown]);

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Click-outside Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col transition-all duration-300">
        <TopBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="px-4 md:px-8 flex flex-col gap-4">
          <div className="p-2">
            <h1 className="text-3xl font-bold text-black mb-4">
              Employee's Reports
            </h1>

            <HumanResourcesReportSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanResourcesReportsPage;
