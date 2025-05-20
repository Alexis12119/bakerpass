"use client";

import React, { useState } from "react";
import Sidebar from "@/components/HumanResources/Reports/Sidebar";
import TopBar from "@/components/HumanResources/Reports/TopBar";
import HumanResourcesReportSection from "@/components/HumanResources/Reports/Section";

const HumanResourcesReportsPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main */}
      <div
        className={`bg-gray-100 flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-30" : "ml-0"
        }`}
      >
        {/* TopBar */}
        <TopBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="pl-8 pr-8 flex flex-col gap-4">
          <div className="p-2">
            <h1 className="text-3xl font-bold text-black mb-4">
              Employee's Reports
            </h1>

            {/* Reports Section */}
            <HumanResourcesReportSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanResourcesReportsPage;
