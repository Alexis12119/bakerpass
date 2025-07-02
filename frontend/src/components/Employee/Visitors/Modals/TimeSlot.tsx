"use client";

import React, { useEffect, useState } from "react";
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";
import { TimeSlot } from "@/types/Employee/Profile";
import { showErrorToast } from "@/utils/customToasts";

interface TimeSlotModalProps {
  date: string;
  employeeId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const isAM = hours < 12;
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${String(minutes).padStart(2, "0")} ${isAM ? "AM" : "PM"}`;
};

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  date,
  employeeId,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ startTime: "", endTime: "" });
  const [newSlot, setNewSlot] = useState({ startTime: "", endTime: "" });
  const [showAddSlot, setShowAddSlot] = useState(false);
  const fetchSlots = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees/${employeeId}/timeslots`,
      );
      const all = res.data as TimeSlot[];
      const scoped = all.filter((slot) => slot.date === date);
      setSlots(scoped);
    } catch (err: any) {
      showErrorToast(`Failed to load time slots: ${err.message}`);
    }
  };

  const handleUpdateSlot = async (id: number) => {
    if (!editValues.startTime || !editValues.endTime) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots/${id}`,
        {
          employeeId,
          date,
          startTime: editValues.startTime,
          endTime: editValues.endTime,
        },
      );
      setEditingSlotId(null);
      fetchSlots();
      onUpdate();
    } catch (err: any) {
      showErrorToast(`Failed to update: ${err.message}`);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots/${id}`,
      );
      fetchSlots();
      onUpdate();
    } catch (err: any) {
      showErrorToast(`Failed to delete: ${err.message}`);
    }
  };

  const handleAddSlot = async () => {
    const { startTime, endTime } = newSlot;
    if (!startTime || !endTime) return;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots`, {
        employeeId,
        date,
        startTime,
        endTime,
      });
      setNewSlot({ startTime: "", endTime: "" });
      fetchSlots();
      onUpdate();
    } catch (err: any) {
      showErrorToast(`Failed to add: ${err.message}`);
    }
  };

  useEffect(() => {
    if (isOpen) fetchSlots();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full"
        >
          <XMarkIcon className="h-5 w-5 text-gray-700" />
        </button>

        <h3 className="text-lg font-bold text-black mb-4 text-center">
          Time Slots for{" "}
          {new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "long",
            day: "numeric",
          })}
        </h3>

        {slots.length === 0 ? (
          <p className="text-center text-gray-600">No time slots available</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="text-black flex justify-between items-center border p-2 rounded-md"
              >
                {editingSlotId === slot.id ? (
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="time"
                      value={editValues.startTime}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          startTime: e.target.value,
                        }))
                      }
                      className="text-black border rounded-md px-2"
                    />
                    <input
                      type="time"
                      value={editValues.endTime}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          endTime: e.target.value,
                        }))
                      }
                      className="text-black border rounded-md px-2"
                    />
                    <button
                      onClick={() => handleUpdateSlot(slot.id)}
                      className="text-green-600 font-medium"
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
                          setEditValues({
                            startTime: slot.start_time,
                            endTime: slot.end_time,
                          });
                        }}
                      >
                        <PencilIcon className="w-4 h-4 text-blue-600" />
                      </button>
                      <button onClick={() => handleDeleteSlot(slot.id)}>
                        <TrashIcon className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddSlot(true)}
          className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md"
          title="Add Time Slot"
        >
          <PlusIcon className="h-6 w-6" />
        </button>

        {/* Add Slot Modal */}
        {showAddSlot && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 min-h-screen">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-sm text-center">
              <h4 className="text-lg font-semibold text-black mb-3">
                Add Time Slot
              </h4>
              <div className="flex flex-col gap-2">
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) =>
                    setNewSlot((prev) => ({
                      ...prev,
                      startTime: e.target.value,
                    }))
                  }
                  className="text-black border rounded-md px-2 py-1"
                />
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) =>
                    setNewSlot((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                  className="text-black border rounded-md px-2 py-1"
                />
                <div className="flex justify-center gap-2 mt-3">
                  <button
                    className="px-4 py-1 bg-gray-300 text-black rounded-md"
                    onClick={() => {
                      setShowAddSlot(false);
                      setNewSlot({ startTime: "", endTime: "" });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-1 bg-green-600 text-white rounded-md"
                    onClick={async () => {
                      await handleAddSlot();
                      setShowAddSlot(false);
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotModal;
