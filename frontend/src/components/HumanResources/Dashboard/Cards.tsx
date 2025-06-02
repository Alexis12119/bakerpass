"use client";

import React, { useEffect, useState } from "react";
import { Users, Calendar, BarChart, Pencil } from "lucide-react";
import axios from "axios";

const DashboardCards: React.FC = () => {
  const [stats, setStats] = useState<{
    totalOccupants: number;
    thisMonthVisitors: number;
    dailyAvgVisitors: number;
    lastMonthVisitors: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/hr/visit-stats`,
      );
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch visit stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(
      `${process.env.NEXT_PUBLIC_BACKEND_WS}/ws/updates`,
    );

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onmessage = (event) => {
      console.log("📡 Update received: refreshing dashboard stats...");
      fetchStats(); // trigger a refresh of the dashboard cards
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

  const cardConfig = [
    {
      label: "No. of Occupants",
      value: stats?.totalOccupants ?? (loading ? "..." : "N/A"),
      icon: <Users size={54} />,
      gradient: "bg-gradient-to-r from-[#221371] to-[#4124D7]",
    },
    {
      label: "This Month's Visitors",
      value: stats?.thisMonthVisitors ?? (loading ? "..." : "N/A"),
      icon: <Calendar size={54} />,
      gradient: "bg-gradient-to-r from-[#EEAC33] to-[#88621D]",
    },
    {
      label: "Daily Avg. Visitor",
      value: stats?.dailyAvgVisitors ?? (loading ? "..." : "N/A"),
      icon: <BarChart size={54} />,
      gradient: "bg-gradient-to-r from-[#1EA83C] to-[#0C4218]",
    },
    {
      label: "Last Month's Visitor",
      value: stats?.lastMonthVisitors ?? (loading ? "..." : "N/A"),
      icon: <Pencil size={54} />,
      gradient: "bg-gradient-to-r from-[#C82020] to-[#621010]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cardConfig.map((card, index) => (
        <div
          key={index}
          className={`${card.gradient} p-5 rounded-lg text-white shadow-md flex items-center gap-4`}
        >
          <div className="text-white text-lg">{card.icon}</div>
          <div>
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
