"use client";

import React, { useEffect, useState } from "react";
import { Users, Calendar, BarChart, Pencil } from "lucide-react";
import axios from "axios";
import { showErrorToast } from "@/utils/customToasts";

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
    } catch (error: any) {
      showErrorToast(`Failed to fetch visit stats: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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
        console.log("📡 Update received: refreshing dashboard stats...");
        fetchStats();
      };

      socket.onerror = (e) => {
        console.error("❗WebSocket error", e);
        socket.close(); // triggers onclose
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
