"use client";

import React, { useState, useEffect, useCallback } from "react";

import Sidebar from "@/components/common/Sidebar";
import TopBar from "@/components/common/Topbar";
import DashboardCards from "@/components/HumanResources/Dashboard/Cards";
import VisitorsSection from "@/components/HumanResources/Dashboard/Section";

const HumanResourcesDashboardPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Close on ESC
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

      {/* Dimmed Background Overlay (click to close) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={closeSidebar}
        />
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col transition-all duration-300">
        <TopBar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          role="Human Resources"
        />
        <div className="px-4 md:px-8 flex flex-col gap-4">
          <div className="p-2">
            <h1 className="text-3xl font-bold text-black mb-4">Dashboard</h1>
            <DashboardCards />
            <VisitorsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanResourcesDashboardPage;
