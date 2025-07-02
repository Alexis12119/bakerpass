"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { TimeSlot, EmployeeProfileModalProps } from "@/types/Employee/Profile";
import { showErrorToast } from "@/utils/customToasts";
import DatePicker from "react-datepicker";

const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  Visitor: visitor,
  isOpen,
  onClose,
  profileImageUrl,
  employeeId,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });
  const [openDates, setOpenDates] = useState<Record<string, boolean>>({});
  const [dateScopedSlot, setDateScopedSlot] = useState<
    Record<string, { startTime: string; endTime: string }>
  >({});
  const isValidImage = profileImageUrl && profileImageUrl.trim() !== "";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":" as any).map(Number);
    const isAM = hours < 12;
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${String(minutes).padStart(2, "0")} ${isAM ? "AM" : "PM"}`;
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees/${employeeId}/timeslots`,
      );
      setTimeSlots(response.data);
    } catch (err: any) {
      showErrorToast(`Error fetching time slots: ${err.message}`);
    }
  };

  const updateTimeSlot = async (id: number) => {
    const { date, startTime, endTime } = newSlot;
    if (!date || !startTime || !endTime) return;

    const formattedDate = new Date(date).toISOString().split("T")[0];

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots/${id}`,
        {
          id,
          employeeId,
          date: formattedDate,
          startTime,
          endTime,
        },
      );

      setEditingSlotId(null);
      setNewSlot({ date: "", startTime: "", endTime: "" });
      fetchTimeSlots();
    } catch (err: any) {
      showErrorToast(`Error updating time slot: ${err.message}`);
    }
  };

  const deleteTimeSlot = async (id: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots/${id}`,
      );
      fetchTimeSlots();
    } catch (err: any) {
      showErrorToast(`Error deleting time slot: ${err.message}`);
    }
  };

  const groupedTimeSlots = timeSlots.reduce<Record<string, TimeSlot[]>>(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    },
    {},
  );

  useEffect(() => {
    if (employeeId) fetchTimeSlots();
  }, [employeeId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full border border-black shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-gray-100 rounded-lg"
        >
          <XMarkIcon className="h-5 w-5 text-gray-700" />
        </button>

        <div className="bg-[#0D1F73] h-40 flex justify-center items-center">
          <div className="w-20 h-20 relative overflow-hidden rounded-full bg-white">
            {isValidImage ? (
              <Image
                src={profileImageUrl}
                alt=""
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-gray-400">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
        </div>

        <div className="p-5 text-center">
          <h2 className="text-xl font-bold text-black">{visitor.name}</h2>
          <p className="text-sm text-gray-500">{visitor.department}</p>
        </div>

        <div className="px-5 pb-5">
          <h3 className="text-black font-semibold mb-2">
            Your Time Availability
          </h3>

          <div className="mb-4">
            <h4 className="text-black font-semibold mb-1">Add New Date</h4>
            <div className="flex items-center gap-2">
              <DatePicker
                selected={newSlot.date ? new Date(newSlot.date) : null}
                onChange={(date: Date | null) => {
                  if (!date) return;
                  setNewSlot((prev) => ({
                    ...prev,
                    date: date.toISOString().split("T")[0],
                  }));
                }}
                minDate={new Date()}
                placeholderText="Select a date"
                className="text-black border rounded-md px-2 py-1"
                dateFormat="MM/dd/yyyy"
              />
              <button
                className="bg-green-600 text-white px-3 py-1 rounded-md"
                onClick={async () => {
                  if (!newSlot.date || groupedTimeSlots[newSlot.date]) return;

                  try {
                    await axios.post(
                      `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots/date`,
                      {
                        employeeId,
                        date: newSlot.date,
                      },
                    );

                    await fetchTimeSlots();

                    setOpenDates((prev) => ({ ...prev, [newSlot.date]: true }));
                    setDateScopedSlot((prev) => ({
                      ...prev,
                      [newSlot.date]: { startTime: "", endTime: "" },
                    }));
                  } catch (err: any) {
                    showErrorToast(`Error adding date: ${err.message}`);
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto pr-2 space-y-4">
            {Object.keys(groupedTimeSlots).length === 0 ? (
              <p className="text-black">No time slots available</p>
            ) : (
              Object.entries(groupedTimeSlots).map(([date, slots]) => (
                <div
                  key={date}
                  className="border border-gray-200 rounded-md mb-2"
                >
                  {/* Folder Header */}
                  <button
                    className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-t-md flex justify-between items-center"
                    onClick={() =>
                      setOpenDates((prev) => ({ ...prev, [date]: !prev[date] }))
                    }
                  >
                    <span className="text-black">{formatDate(date)}</span>
                    <span className="text-sm text-gray-500">
                      {openDates[date] ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Slot list inside the "folder" */}
                  {openDates[date] && (
                    <div className="px-3 py-2 space-y-2">
                      {slots.map((slot) => (
                        <li
                          key={slot.id}
                          className="text-black flex justify-between items-center border p-2 rounded-md"
                        >
                          {editingSlotId === slot.id ? (
                            <div className="flex gap-2 flex-wrap">
                              <input
                                type="time"
                                value={newSlot.startTime}
                                onChange={(e) =>
                                  setNewSlot({
                                    ...newSlot,
                                    startTime: e.target.value,
                                  })
                                }
                                className="text-black border rounded-md px-2"
                              />
                              <input
                                type="time"
                                value={newSlot.endTime}
                                onChange={(e) =>
                                  setNewSlot({
                                    ...newSlot,
                                    endTime: e.target.value,
                                  })
                                }
                                className="text-black border rounded-md px-2"
                              />
                              <button
                                onClick={() => updateTimeSlot(slot.id)}
                                className="text-green-600"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <>
                              <span>
                                {formatTime(slot.start_time)} -{" "}
                                {formatTime(slot.end_time)}
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingSlotId(slot.id);
                                    setNewSlot({
                                      date: slot.date,
                                      startTime: slot.start_time,
                                      endTime: slot.end_time,
                                    });
                                  }}
                                >
                                  <PencilIcon className="w-4 h-4 text-blue-600" />
                                </button>
                                <button onClick={() => deleteTimeSlot(slot.id)}>
                                  <TrashIcon className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}

                      {/* Add new slot under this date */}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="time"
                          placeholder="Start"
                          value={dateScopedSlot[date]?.startTime || ""}
                          onChange={(e) =>
                            setDateScopedSlot((prev) => ({
                              ...prev,
                              [date]: {
                                ...(prev[date] || {
                                  startTime: "",
                                  endTime: "",
                                }),
                                startTime: e.target.value,
                              },
                            }))
                          }
                          className="text-black border rounded-md px-2"
                        />
                        <input
                          type="time"
                          placeholder="End"
                          value={dateScopedSlot[date]?.endTime || ""}
                          onChange={(e) =>
                            setDateScopedSlot((prev) => ({
                              ...prev,
                              [date]: {
                                ...(prev[date] || {
                                  startTime: "",
                                  endTime: "",
                                }),
                                endTime: e.target.value,
                              },
                            }))
                          }
                          className="text-black border rounded-md px-2"
                        />
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded-md"
                          onClick={async () => {
                            const startTime =
                              dateScopedSlot[date]?.startTime || "";
                            const endTime = dateScopedSlot[date]?.endTime || "";
                            if (!startTime || !endTime) return;

                            try {
                              const formattedDate = new Date(date)
                                .toISOString()
                                .split("T")[0];
                              await axios.post(
                                `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots`,
                                {
                                  employeeId,
                                  date: formattedDate,
                                  startTime,
                                  endTime,
                                },
                              );
                              fetchTimeSlots();
                              setDateScopedSlot((prev) => ({
                                ...prev,
                                [date]: { startTime: "", endTime: "" },
                              }));
                            } catch (err: any) {
                              showErrorToast(
                                `Error adding slot: ${err.message}`,
                              );
                            }
                          }}
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
