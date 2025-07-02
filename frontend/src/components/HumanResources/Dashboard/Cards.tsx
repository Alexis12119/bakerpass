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

  useEffect(() => {
    const handleDateChange = () => {
      fetchStats();
    };

    window.addEventListener("dateChanged", handleDateChange);

    return () => {
      window.removeEventListener("dateChanged", handleDateChange);
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Read from sessionStorage
      const date = sessionStorage.getItem("visitor_filter_date");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/hr/visit-stats?date=${date}`,
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
        socket.close();
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
      icon: Users,
      gradient: "from-[#221371] to-[#4124D7]",
    },
    {
      label: "This Month's Visitors",
      value: stats?.thisMonthVisitors ?? (loading ? "..." : "N/A"),
      icon: Calendar,
      gradient: "from-[#EEAC33] to-[#88621D]",
    },
    {
      label: "Daily Avg. Visitor",
      value: stats?.dailyAvgVisitors ?? (loading ? "..." : "N/A"),
      icon: BarChart,
      gradient: "from-[#1EA83C] to-[#0C4218]",
    },
    {
      label: "Last Month's Visitor",
      value: stats?.lastMonthVisitors ?? (loading ? "..." : "N/A"),
      icon: Pencil,
      gradient: "from-[#C82020] to-[#621010]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cardConfig.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-gradient-to-r ${card.gradient} p-6 rounded-2xl text-white shadow-lg flex items-center gap-5 hover:scale-[1.02] transition-transform`}
          >
            <div className="bg-white/10 p-4 rounded-full">
              <Icon size={32} className="text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold leading-tight">
                {card.value}
              </div>
              <div className="text-sm opacity-90">{card.label}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
