"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { TimeSlot, EmployeeProfileModalProps } from "@/types/Employee/Profile";
import { showErrorToast } from "@/utils/customToasts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimeSlotModal from "@/components/Employee/Visitors/Modals/TimeSlot";

interface EmployeeScheduleModalProps extends EmployeeProfileModalProps {
  employeeId: string;
}

const EmployeeScheduleModal: React.FC<EmployeeScheduleModalProps> = ({
  Visitor: visitor,
  isOpen,
  onClose,
  profileImageUrl,
  employeeId,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDateForModal, setSelectedDateForModal] = useState<
    string | null
  >(null);
  const [isAddDateModalOpen, setIsAddDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const isValidImage = profileImageUrl && profileImageUrl.trim() !== "";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
    });
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

  const groupedTimeSlots = timeSlots.reduce<Record<string, TimeSlot[]>>(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    },
    {},
  );

  const addNewDate = async () => {
    if (!selectedDate) return;
    const formatted = selectedDate.toLocaleDateString("en-CA");
    if (groupedTimeSlots[formatted]) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/timeslots/date`,
        {
          employeeId,
          date: formatted,
        },
      );
      await fetchTimeSlots();
      setSelectedDate(null);
      setIsAddDateModalOpen(false);
    } catch (err: any) {
      showErrorToast(
        `Failed to add Date: ${err.response?.data?.error || err.message}`,
      );
    }
  };

  useEffect(() => {
    if (employeeId) fetchTimeSlots().then((r) => r);
  }, [employeeId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-4xl h-[80vh] shadow-lg relative flex flex-col">
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

        <div className="flex-grow overflow-y-auto px-5 pb-5">
          <h3 className="text-black font-semibold mb-2">Manage Schedule</h3>

          {Object.keys(groupedTimeSlots).length === 0 ? (
            <p className="text-black">No dates available.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Object.keys(groupedTimeSlots).map((date) => (
                <button
                  key={date}
                  onClick={() => setSelectedDateForModal(date)}
                  className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg shadow text-center"
                >
                  <span className="font-medium text-black">
                    {formatDate(date)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <button
          onClick={() => setIsAddDateModalOpen(true)}
          className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md"
          title="Add New Date"
        >
          <PlusIcon className="h-6 w-6" />
        </button>

        {/* Add Date Modal */}

        {isAddDateModalOpen && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 min-h-screen">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-sm text-center">
              <h4 className="text-lg font-semibold text-black mb-3">
                Select a new date
              </h4>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date()}
                placeholderText="Select a date"
                className="text-black border rounded-md px-2 py-1 w-full mb-4"
                dateFormat="MM/dd/yyyy"
              />
              <div className="flex justify-center gap-2">
                <button
                  className="px-4 py-1 bg-gray-300 text-black rounded-md"
                  onClick={() => setIsAddDateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-1 bg-green-600 text-white rounded-md"
                  onClick={addNewDate}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedDateForModal && (
        <TimeSlotModal
          date={selectedDateForModal}
          employeeId={employeeId}
          isOpen={true}
          onClose={() => setSelectedDateForModal(null)}
          onUpdate={fetchTimeSlots}
        />
      )}
    </div>
  );
};

export default EmployeeScheduleModal;
