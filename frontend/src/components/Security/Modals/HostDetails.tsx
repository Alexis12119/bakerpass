import axios from "axios";
import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Laptop, Smartphone, Tablet, Package, User } from "lucide-react";
import { HostDetailsModalProps } from "@/types/Security";
import { showErrorToast, showSuccessToast } from "@/utils/customToasts";
import TimeSlotModal from "@/components/Security/Modals/TimeSlot";

const iconMap: { [key: string]: React.ReactNode } = {
  Laptop: <Laptop className="w-8 h-8 text-gray-700 mb-2" />,
  Phone: <Smartphone className="w-8 h-8 text-gray-700 mb-2" />,
  Tablet: <Tablet className="w-8 h-8 text-gray-700 mb-2" />,
  Others: <Package className="w-8 h-8 text-gray-700 mb-2" />,
};

const HostDetailsModal: React.FC<HostDetailsModalProps> = ({
  isOpen,
  onClose,
  host,
  fetchVisitors,
}) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [visitPurposeId, setVisitPurposeId] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visitPurposes, setVisitPurposes] = useState<
    { id: number; name: string }[]
  >([]);
  const [timeSlots, setTimeSlots] = useState<
    { id: number; start_time: string; end_time: string; date: string }[]
  >([]);

  const [step, setStep] = useState<1 | 2>(1);

  // Device info
  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
  const [otherDevice, setOtherDevice] = useState<string>("");
  const [deviceBrand, setDeviceBrand] = useState<string>("");

  const groupedSlotsByDate = timeSlots.reduce<Record<string, typeof timeSlots>>(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    },
    {},
  );

  useEffect(() => {
    const fetchVisitPurposes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/purposes`,
        );
        setVisitPurposes(response.data);
      } catch (error) {}
    };

    const fetchAvailableTimeSlots = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/hosts/${host.id}/available-timeslots`,
        );
        setTimeSlots(response.data);
      } catch (error: any) {
        showErrorToast(`Error fetching time slots: ${error.message}`);
      }
    };

    if (isOpen) {
      fetchVisitPurposes();
      fetchAvailableTimeSlots();
      // Reset states when modal opens
      setFirstName("");
      setLastName("");
      setVisitPurposeId(null);
      setSelectedTimeSlot(null);
      setStep(1);
      setDeviceTypes([]);
      setOtherDevice("");
      setDeviceBrand("");
    }
  }, [isOpen, host.id]);

  const handleSubmit = async () => {
    const selectedTime = timeSlots.find((slot) => slot.id === selectedTimeSlot);

    if (!selectedTime) {
      showErrorToast("Selected time slot is invalid.");
      return;
    }

    const { date, start_time, end_time } = selectedTime;
    if (
      !selectedTime ||
      !firstName ||
      !lastName ||
      visitPurposeId === null ||
      deviceTypes.length === 0 ||
      !deviceBrand ||
      (deviceTypes.includes("Others") && !otherDevice)
    ) {
      showErrorToast("Please fill in all fields before submitting.");
      return;
    }

    if (!firstName || !lastName) {
      showErrorToast("Please Enter Both First And Last Name.");
      return;
    }

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@walkin.local`;

    const payload = {
      firstName,
      lastName,
      email,
      contactNumber: "",
      address: "",
      visitedEmployeeId: host.id,
      visitPurposeId,
      selectedTimeSlot, // still useful if your backend uses it
      selectedDate: date, // explicit date
      startTime: start_time,
      endTime: end_time,
      deviceType: deviceTypes.includes("Others")
        ? [...deviceTypes.filter((d) => d !== "Others"), otherDevice].join(", ")
        : deviceTypes.join(", "),
      deviceBrand,
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visits`,
        payload,
      );
      showSuccessToast("Visit created successfully.");
      await fetchVisitors();
      onClose();
    } catch (error: any) {
      showErrorToast(`Error creating visit: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 ">
      {selectedDate && (
        <TimeSlotModal
          timeSlots={groupedSlotsByDate[selectedDate]}
          selectedTimeSlotId={selectedTimeSlot}
          onSelect={(id) => {
            setSelectedTimeSlot(id);
            setSelectedDate(null); // close modal
          }}
          onClose={() => setSelectedDate(null)}
        />
      )}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md border border-black max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="p-2 absolute top-4 right-4 bg-white text-[#1C274C] hover:text-gray-700 focus:outline-none z-10 rounded-md"
        >
          <X size={20} />
        </button>

        {/* Host profile */}
        <div className="bg-[#0D1F72] p-6 flex flex-col items-center">
          <div className="w-22 h-22 relative rounded-full bg-white overflow-hidden mb-2">
            {host.profileImage?.trim() ? (
              <Image
                src={host.profileImage}
                alt="Host image"
                layout="fill"
                objectFit="cover"
                className="h-full w-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <User className="w-5 h-5 text-gray-500" />
              </div>
            )}
          </div>
          <h3 className="text-white font-semibold text-lg text-center">
            {host.name}
          </h3>
          <p className="text-[#1C274C] text-sm text-center">
            {host.department}
          </p>
        </div>

        {/* Step 1: Visitor info */}
        {step === 1 && (
          <>
            <div className="p-4">
              <h4 className="text-black text-sm font-medium mb-3">
                Visitor's Information
              </h4>
              <div className="space-y-3">
                <div className="flex flex-row space-x-3">
                  <input
                    type="text"
                    className="text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C274C]"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C274C]"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <select
                  className="text-black w-full p-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1C274C]"
                  value={visitPurposeId ?? ""}
                  onChange={(e) => setVisitPurposeId(Number(e.target.value))}
                >
                  <option value="" disabled>
                    Purpose
                  </option>
                  {visitPurposes.map((purpose) => (
                    <option key={purpose.id} value={purpose.id}>
                      {purpose.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time slots */}
            {/* Date Selector */}
            <div className="p-4">
              <h4 className="text-black text-sm font-medium mb-3">
                Choose Date of Visit
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(groupedSlotsByDate).map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="bg-gray-100 border border-gray-300 rounded-md p-2 text-black hover:bg-gray-200"
                  >
                    {new Date(date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Step 2: Devices */}
        {step === 2 && (
          <div className="p-4 space-y-4">
            <h4 className="text-black text-sm font-medium mb-3">
              Devices to be brought (Select all that apply)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {["Laptop", "Phone", "Tablet", "Others"].map((device) => (
                <label
                  key={device}
                  className="flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:shadow-md transition"
                >
                  {iconMap[device]}
                  <input
                    type="checkbox"
                    className="mb-1"
                    checked={deviceTypes.includes(device)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setDeviceTypes((prev) =>
                        isChecked
                          ? [...prev, device]
                          : prev.filter((d) => d !== device),
                      );
                    }}
                  />
                  <span className="text-sm text-black">
                    {device.toUpperCase()}
                  </span>
                </label>
              ))}
            </div>
            {deviceTypes.includes("Others") && (
              <input
                type="text"
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                placeholder="Specify other devices"
                value={otherDevice}
                onChange={(e) => setOtherDevice(e.target.value)}
              />
            )}
            <input
              type="text"
              className="text-black w-full p-2 border border-gray-300 rounded-md"
              placeholder="Brand's / use (,) to separate if multiple"
              value={deviceBrand}
              onChange={(e) => setDeviceBrand(e.target.value)}
            />
          </div>
        )}

        {/* Controls - Next / Back buttons */}
        <div className="p-4 flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(1)}
              className="bg-gray-300 text-black py-2 px-6 rounded-md"
            >
              Back
            </button>
          )}
          {step === 1 && (
            <button
              onClick={() => {
                if (
                  !firstName ||
                  !lastName ||
                  visitPurposeId === null ||
                  !selectedTimeSlot
                ) {
                  showErrorToast(
                    "Please fill visitor info, purpose, and select a time slot.",
                  );
                  return;
                }
                setStep(2);
              }}
              className="bg-[#1C274C] text-white py-2 px-6 rounded-md ml-auto"
            >
              Next
            </button>
          )}
          {step === 2 && (
            <button
              onClick={() => {
                if (
                  deviceTypes.length === 0 ||
                  !deviceBrand ||
                  (deviceTypes.includes("Others") && !otherDevice)
                ) {
                  showErrorToast("Please select device and enter brand.");
                  return;
                }
                handleSubmit();
              }}
              className="bg-[#1C274C] text-white py-2 px-6 rounded-md ml-auto"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDetailsModal;
