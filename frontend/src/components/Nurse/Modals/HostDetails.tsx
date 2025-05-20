import axios from "axios";
import { X, Check } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import ErrorModal from "@/components/Modals/ErrorModal";
import SuccessModal from "@/components/Modals/SuccessModal";

interface HostDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  host: {
    id: string;
    name: string;
    department: string;
  };
  fetchVisitors: () => Promise<void>;
}

const HostDetailsModal: React.FC<HostDetailsModalProps> = ({
  isOpen,
  onClose,
  host,
  fetchVisitors,
}) => {
  const [visitorName, setVisitorName] = useState("");
  const [visitPurposeId, setVisitPurposeId] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [newVisitorId, setNewVisitorId] = useState<number | null>(null);
  const [visitPurposes, setVisitPurposes] = useState<
    { id: number; name: string }[]
  >([]);
  const [timeSlots, setTimeSlots] = useState<
    { id: number; start_time: string; end_time: string }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchHighestVisitorId = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visitors/highest-id`,
        );
        const highestId = response.data.highestId;
        setNewVisitorId(highestId + 1);
      } catch (error) {
        console.error("Error fetching highest visitor ID:", error);
      }
    };

    const fetchVisitPurposes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/purposes`,
        );
        setVisitPurposes(response.data);
      } catch (error) {
        console.error("Error fetching visit purposes:", error);
      }
    };

    const fetchAvailableTimeSlots = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/hosts/${host.id}/available-timeslots`,
        );
        setTimeSlots(response.data);
      } catch (error) {
        console.error("Error fetching time slots:", error);
      }
    };

    if (isOpen) {
      fetchHighestVisitorId();
      fetchVisitPurposes();
      fetchAvailableTimeSlots();
    }
  }, [isOpen, host.id]);

  const handleTimeSlotSelect = (id: number) => {
    setSelectedTimeSlot(id);
  };

  const handleSubmit = async () => {
    const selectedTime = timeSlots.find((slot) => slot.id === selectedTimeSlot);
    if (
      !selectedTime ||
      !newVisitorId ||
      !visitorName ||
      visitPurposeId === null
    ) {
      setErrorMessage("Please fill in all fields before submitting.");
      return;
    }

    const [firstName, lastName = ""] = visitorName.trim().split(" ");
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}_${Date.now()}@walkin.local`;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/visits`, {
        firstName,
        lastName,
        email,
        contactNumber: "",
        address: "",
        visitedEmployeeId: host.id,
        visitPurposeId,
        selectedTimeSlot,
      });

      await fetchVisitors();
      setSuccessMessage("Visit created successfully");
    } catch (error) {
      setErrorMessage("Error creating visit");
    }
  };

  if (!isOpen) return null;
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 ">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md border border-black">
        <button
          onClick={onClose}
          className="p-2 absolute top-4 right-4 bg-white text-[#1C274C] hover:text-gray-700 focus:outline-none z-10 rounded-md"
        >
          <X size={20} />
        </button>

        {/* Host profile */}
        <div className="bg-[#0D1F72] p-6 flex flex-col items-center">
          <div className="w-22 h-22 relative rounded-full bg-white overflow-hidden mb-2">
            <Image
              src={`/images/jiro.jpg`}
              alt="Host image"
              layout="fill"
              objectFit="cover"
              className="h-full w-full"
            />
          </div>
          <h3 className="text-white font-semibold text-lg text-center">
            {host.name}
          </h3>
          <p className="text-blue-100 text-sm text-center">{host.department}</p>
        </div>

        {/* Visitor form */}
        <div className="p-4">
          <h4 className="text-black text-sm font-medium mb-3">
            Visitor's Information
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              className="text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full name"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
            />
            <select
              className="text-black w-full p-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={visitPurposeId ?? ""}
              onChange={(e) => setVisitPurposeId(Number(e.target.value))}
            >
              <option value="" disabled>
                Purpose
              </option>
              {visitPurposes.length > 0 ? (
                visitPurposes.map((purpose) => (
                  <option key={purpose.id} value={purpose.id}>
                    {purpose.name}
                  </option>
                ))
              ) : (
                <option disabled>No purposes available</option>
              )}
            </select>
          </div>
        </div>

        {/* Time slots */}
        <div className="p-4">
          <h4 className="text-black text-sm font-medium mb-3">
            Host's Time Availability
          </h4>
          {timeSlots.length === 0 ? (
            <p className="text-gray-500 text-sm italic">
              No available time slots for this host.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  className={`flex items-center p-3 rounded-md border ${
                    selectedTimeSlot === slot.id
                      ? "bg-blue-900 text-white border-blue-800"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                  onClick={() => handleTimeSlotSelect(slot.id)}
                >
                  <div className="flex items-center">
                    {selectedTimeSlot === slot.id && (
                      <div className="w-4 h-4 mr-2">
                        <Check size={16} />
                      </div>
                    )}
                    <span>{`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="p-4 border-t">
          <button
            className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-green-300 disabled:cursor-not-allowed"
            disabled={
              !selectedTimeSlot || !visitorName || visitPurposeId === null
            }
            onClick={handleSubmit}
          >
            Confirm Visit
          </button>
        </div>
      </div>

      {/* Modals */}
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage("")}
        />
      )}
      {successMessage && (
        <SuccessModal
          message={successMessage}
          onClose={() => {
            setSuccessMessage("");
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default HostDetailsModal;
