"use client";

import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/HumanResources/Shared/Sidebar";
import TopBar from "@/components/HumanResources/Dashboard/TopBar";
import ConfirmationModal from "@/components/Modals/ConfirmationModal";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";
import axios from "axios";

type LogEntry = {
  level: number;
  time?: string;
  timestamp?: string;
  msg?: string;
  message?: string;
  result?: any;
};
const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

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

  const groupLogsByDate = (logList: LogEntry[]): Record<string, LogEntry[]> => {
    return logList.reduce((acc: Record<string, LogEntry[]>, log: LogEntry) => {
      const rawTimestamp = log.time || log.timestamp;
      const dateKey =
        typeof rawTimestamp === "string" ? rawTimestamp.split("T")[0] : "";

      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(log);
      return acc;
    }, {});
  };

  useEffect(() => {
    let socket: WebSocket;
    let reconnectTimer: NodeJS.Timeout;
    let isUnmounted = false;

    const connect = () => {
      socket = new WebSocket(
        `${process.env.NEXT_PUBLIC_BACKEND_WS}/ws/updates`,
      );

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("LogsPage WebSocket received:", data);

          if (data.type === "log") {
            const entry = data.entry;
            setLogs((prev) => [entry, ...prev.slice(0, 99)]); // Keep up to 100 logs
          }

          if (data.type === "update") {
            fetchLogs();
            if (data.notify) {
              const { status, message } = data.notify;
              if (status === "success") showSuccessToast(message);
              else if (status === "error") showErrorToast(message);
            }
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      socket.onerror = (e) => {
        console.error("WebSocket error", e);
        socket.close(); // triggers `onclose`
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        if (!isUnmounted) {
          console.log("Attempting to reconnect in 5s...");
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

  const fetchLogs = async () => {
    try {
      const res = await axios.get<LogEntry[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/hr/logs`,
      );
      setLogs(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load logs");
    }
  };

  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/hr/logs`);
      setLogs([]);
      setFilteredLogs([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to clear logs");
    } finally {
      setIsClearing(false);
      setShowModal(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (filter === "ALL") {
      setFilteredLogs(logs);
    } else {
      const levelMap: Record<string, number> = {
        ERROR: 50,
        WARN: 40,
        INFO: 30,
        DEBUG: 20,
      };
      setFilteredLogs(logs.filter((log) => log.level === levelMap[filter]));
    }
  }, [filter, logs]);

  const groupedLogs = groupLogsByDate(filteredLogs);

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={closeSidebar}
        />
      )}

      <div className="relative z-10 flex flex-col transition-all duration-300">
        <TopBar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="px-4 md:px-8 flex flex-col gap-4">
          <div className="p-2">
            <h1 className="text-3xl font-bold text-black mb-4">System Logs</h1>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Filter:</label>
                <select
                  className="text-black border border-gray-300 rounded px-2 py-1 text-sm"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="ALL">All</option>
                  <option value="ERROR">Error</option>
                  <option value="WARN">Warning</option>
                  <option value="INFO">Info</option>
                  <option value="DEBUG">Debug</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchLogs}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Refresh Logs
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {error ? (
              <div className="text-red-600 font-medium">{error}</div>
            ) : (
              <div className="bg-white text-sm p-4 rounded-md shadow max-h-[70vh] min-h-[50vh] overflow-y-auto border border-gray-300 space-y-4">
                {filteredLogs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    No logs available.
                  </div>
                ) : (
                  Object.entries(groupedLogs).map(([date, logs]) => (
                    <div key={date}>
                      <h2 className="text-md font-bold text-gray-700 border-b mb-2">
                        {date}
                      </h2>
                      <div className="space-y-2">
                        {logs.map((log: any, i: number) => (
                          <div
                            key={i}
                            className="p-2 rounded-md border border-gray-200 bg-gray-50"
                          >
                            <div className="text-xs text-gray-500">
                              {log.time || log.timestamp}
                            </div>
                            <div className="flex items-start space-x-2">
                              <span
                                className={`font-semibold uppercase ${
                                  log.level === 50
                                    ? "text-red-600"
                                    : log.level === 40
                                      ? "text-orange-500"
                                      : log.level === 30
                                        ? "text-blue-600"
                                        : log.level === 20
                                          ? "text-green-600"
                                          : "text-black"
                                }`}
                              >
                                {log.level === 50
                                  ? "ERROR"
                                  : log.level === 40
                                    ? "WARN"
                                    : log.level === 30
                                      ? "INFO"
                                      : log.level === 20
                                        ? "DEBUG"
                                        : log.level || "LOG"}
                              </span>
                              <span className="text-black break-words">
                                {log.msg || log.message || JSON.stringify(log)}
                              </span>
                            </div>
                            {log.result && (
                              <div className="mt-1 text-gray-700 text-xs whitespace-pre-wrap">
                                {JSON.stringify(log.result, null, 2)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ConfirmationModal
          title="Clear All Logs?"
          message="This action will remove all system logs. Are you sure you want to proceed?"
          onConfirm={handleClearLogs}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default LogsPage;
