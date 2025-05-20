"use client";

import React, { useState } from "react";

import Sidebar from "@/components/HumanResources/Dashboard/Sidebar";
import TopBar from "@/components/HumanResources/Dashboard/TopBar";
import DashboardCards from "@/components/HumanResources/Dashboard/Cards";
import VisitorsSection from "@/components/HumanResources/Dashboard/Section";

const HumanResourcesDashboardPage: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar*/}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-30" : "ml-0"}`}
      >
        {/* TopBar*/}
        <TopBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="px-4 md:px-8 flex flex-col gap-4">
          <div className="p-2">
            <h1 className="text-3xl font-bold text-black mb-4">Dashboard</h1>

            {/* Dashboard Cards*/}
            <DashboardCards />

            {/* Visitors Section*/}
            <VisitorsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HumanResourcesDashboardPage;
