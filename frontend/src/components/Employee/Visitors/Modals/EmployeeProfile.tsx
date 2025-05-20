import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import axios from "axios";

interface Employee {
  id: string;
  name: string;
  department: string;
}

interface TimeSlot {
  id: number;
  employeeId: int;
  startTime: string;
  endTime: string;
}

interface EmployeeProfileModalProps {
  visitor: Employee;
  isOpen: boolean;
  onClose: () => void;
}

const EmployeeProfileModal: React.FC<EmployeeProfileModalProps> = ({
  visitor,
  isOpen,
  onClose,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  const [newSlot, setNewSlot] = useState({ startTime: "", endTime: "" });
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const isAM = hours < 12;
    const adjustedHours = hours % 12 || 12; // Convert 0 to 12 for AM/PM format
    const formattedTime = `${adjustedHours}:${String(minutes).padStart(2, "0")} ${isAM ? "AM" : "PM"}`;
    return formattedTime;
  };

  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees/${employeeId}/timeslots`,
      );
      console.log("Fetched time slots:", response.data); // Log the response to check its structure
      setTimeSlots(response.data);
    } catch (err) {
      console.error("Error fetching time slots:", err);
    }
  };

  const addTimeSlot = async () => {
    if (!newSlot.startTime || !newSlot.endTime) return;
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots`,
        {
          employeeId: employeeId,
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
        },
      );
      setNewSlot({ startTime: "", endTime: "" });
      fetchTimeSlots();
    } catch (err) {
      console.error("Error adding time slot:", err);
    }
  };
  const updateTimeSlot = async (id: number) => {
    // Make sure startTime and endTime are set before sending the request
    if (!newSlot.startTime || !newSlot.endTime) return;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots/${id}`,
        {
          id, // Adding id to the request body, even though it's already in the URL
          employeeId: employeeId, // Include employeeId in case you need it on the backend
          startTime: newSlot.startTime,
          endTime: newSlot.endTime,
        },
      );
      setEditingSlotId(null);
      setNewSlot({ startTime: "", endTime: "" });
      fetchTimeSlots();
    } catch (err) {
      console.error("Error updating time slot:", err);
    }
  };

  const deleteTimeSlot = async (id: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots/${id}`,
      );
      fetchTimeSlots();
    } catch (err) {
      console.error("Error deleting time slot:", err);
    }
  };

  useEffect(() => {
    // Ensure this only runs in the client-side
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        setEmployeeId(parsedUser.id.toString());
      }
    }
  }, []);

  useEffect(() => {
    if (employeeId && isOpen) {
      fetchTimeSlots();
    }
  }, [employeeId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden max-w-md w-full border border-black shadow-lg">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 bg-gray-100 rounded-lg"
          >
            <XMarkIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        <div className="bg-[#0D1F73] h-40 flex justify-center items-center">
          <div className="w-20 h-20 relative overflow-hidden rounded-full">
            <Image src="/images/jiro.jpg" fill alt="Profile" />
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

          <ul className="space-y-2">
            {timeSlots.length === 0 ? (
              <li>No time slots available</li>
            ) : (
              timeSlots.map((slot) => (
                <li
                  key={slot.id}
                  className="text-black flex justify-between items-center border p-2 rounded-md"
                >
                  {editingSlotId === slot.id ? (
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, startTime: e.target.value })
                        }
                        className="border rounded-md px-2"
                      />
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) =>
                          setNewSlot({ ...newSlot, endTime: e.target.value })
                        }
                        className="text-white border rounded-md px-2"
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
                      <span className="text-black">
                        {formatTime(slot.start_time)} -{" "}
                        {formatTime(slot.end_time)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSlotId(slot.id);
                            setNewSlot({
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
              ))
            )}
          </ul>

          <div className="mt-4 flex gap-2 items-center">
            <input
              type="time"
              value={newSlot.startTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, startTime: e.target.value })
              }
              className="text-black border rounded-md px-2 w-full"
            />
            <input
              type="time"
              value={newSlot.endTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, endTime: e.target.value })
              }
              className="text-black border rounded-md px-2 w-full"
            />
            <button
              onClick={addTimeSlot}
              className="bg-blue-600 text-white p-2 rounded-md"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfileModal;
