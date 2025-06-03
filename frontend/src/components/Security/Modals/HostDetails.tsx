import axios from "axios";
import { X, Check } from "lucide-react";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import ErrorModal from "@/components/Modals/ErrorModal";
import SuccessModal from "@/components/Modals/SuccessModal";
import { Laptop, Smartphone, Tablet, Package } from "lucide-react";

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
  const [visitPurposes, setVisitPurposes] = useState<
    { id: number; name: string }[]
  >([]);
  const [timeSlots, setTimeSlots] = useState<
    { id: number; start_time: string; end_time: string }[]
  >([]);
  const [isHighCare, setIsHighCare] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Manage main steps + added modals
  // step: 1 (visitor info), 2 (device), 3 (ask high care), 4 (symptoms), 5 (prohibited items)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Device info
  const [deviceTypes, setDeviceTypes] = useState<string[]>([]);
  const [otherDevice, setOtherDevice] = useState<string>("");
  const [deviceBrand, setDeviceBrand] = useState<string>("");

  // New states for high care modals:
  // Symptoms & physical condition
  const [symptoms, setSymptoms] = useState<{
    fever: boolean;
    cough: boolean;
    openWound: boolean;
    nausea: boolean;
    skinBoils: boolean;
    skinAllergies: boolean;
    diarrhea: boolean;
    openSores: boolean;
  }>({
    fever: false,
    cough: false,
    openWound: false,
    nausea: false,
    skinBoils: false,
    skinAllergies: false,
    diarrhea: false,
    openSores: false,
  });
  const [otherAllergies, setOtherAllergies] = useState("");

  // Recently visited places
  const [recentPlaces, setRecentPlaces] = useState("");

  // Prohibited items
  const [prohibitedItems, setProhibitedItems] = useState<{
    mobilePhone: boolean;
    camera: boolean;
    medicines: boolean;
    notebook: boolean;
    earrings: boolean;
    necklace: boolean;
    ring: boolean;
    id_card: boolean;
    ballpen: boolean;
    wristwatch: boolean;
  }>({
    mobilePhone: false,
    camera: false,
    medicines: false,
    notebook: false,
    earrings: false,
    necklace: false,
    ring: false,
    id_card: false,
    ballpen: false,
    wristwatch: false,
  });
  const [otherProhibited, setOtherProhibited] = useState("");

  useEffect(() => {
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
      fetchVisitPurposes();
      fetchAvailableTimeSlots();
      // Reset states when modal opens
      setFirstName("");
      setLastName("");
      setVisitPurposeId(null);
      setSelectedTimeSlot(null);
      setIsHighCare(null);
      setStep(1);
      setDeviceTypes([]);
      setOtherDevice("");
      setDeviceBrand("");
      setSymptoms({
        fever: false,
        cough: false,
        openWound: false,
        nausea: false,
        skinBoils: false,
        skinAllergies: false,
        diarrhea: false,
        openSores: false,
      });
      setOtherAllergies("");
      setRecentPlaces("");
      setProhibitedItems({
        mobilePhone: false,
        camera: false,
        medicines: false,
        notebook: false,
        earrings: false,
        necklace: false,
        ring: false,
        id_card: false,
        ballpen: false,
        wristwatch: false,
      });
      setOtherProhibited("");
      setErrorMessage("");
      setSuccessMessage("");
    }
  }, [isOpen, host.id]);

  const handleTimeSlotSelect = (id: number) => {
    setSelectedTimeSlot(id);
  };

  // When submitting at the end (after all steps)
  const handleSubmit = async () => {
    const selectedTime = timeSlots.find((slot) => slot.id === selectedTimeSlot);

    if (
      !selectedTime ||
      !firstName ||
      !lastName ||
      visitPurposeId === null ||
      deviceTypes.length === 0 ||
      !deviceBrand ||
      (deviceTypes.includes("Others") && !otherDevice)
    ) {
      setErrorMessage("Please fill in all fields before submitting.");
      return;
    }

    if (!firstName || !lastName) {
      setErrorMessage("Please enter both first and last name.");
      return;
    }

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@walkin.local`;

    const isHighCareVisit = step >= 3 && isHighCare === "Yes";

    const payload: Record<string, any> = {
      firstName,
      lastName,
      email,
      contactNumber: "",
      address: "",
      visitedEmployeeId: host.id,
      visitPurposeId,
      selectedTimeSlot,
      isHighCare: isHighCareVisit ? "Yes" : "No",
      deviceType: deviceTypes.includes("Others")
        ? [...deviceTypes.filter((d) => d !== "Others"), otherDevice].join(", ")
        : deviceTypes.join(", "),
      deviceBrand,
    };

    if (isHighCareVisit && step >= 4) {
      payload.fever = symptoms?.fever || false;
      payload.cough = symptoms?.cough || false;
      payload.openWound = symptoms?.openWound || false;
      payload.nausea = symptoms?.nausea || false;
      payload.otherAllergies = otherAllergies || null;
      payload.recentPlaces = recentPlaces || null;
      payload.skinBoils = symptoms?.skinBoils || false;
      payload.skinAllergies = symptoms?.skinAllergies || false;
      payload.diarrhea = symptoms?.diarrhea || false;
      payload.openSores = symptoms?.openSores || false;

      payload.mobilePhone = prohibitedItems?.mobilePhone || false;
      payload.camera = prohibitedItems?.camera || false;
      payload.medicines = prohibitedItems?.medicines || false;
      payload.notebook = prohibitedItems?.notebook || false;
      payload.earrings = prohibitedItems?.earrings || false;
      payload.otherProhibited = otherProhibited || null;
      payload.necklace = prohibitedItems?.necklace || false;
      payload.ring = prohibitedItems?.ring || false;
      payload.id_card = prohibitedItems?.id_card || false;
      payload.ballpen = prohibitedItems?.ballpen || false;
      payload.wristwatch = prohibitedItems?.wristwatch || false;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visits`,
        payload,
      );

      setSuccessMessage("Visit created successfully");
      await fetchVisitors();
    } catch (error) {
      console.error("Submit error:", error);
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
          <p className="text-[#1C274C]text-sm text-center">{host.department}</p>
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
            <div className="p-4">
              <h4 className="text-black text-sm font-medium mb-3">
                Host's Time Availability
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    className={`flex items-center p-3 rounded-md border ${
                      selectedTimeSlot === slot.id
                        ? "bg-[#1C274C] text-white border-[#1C274C]"
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
                      <span>{`${formatTime(slot.start_time)} - ${formatTime(
                        slot.end_time,
                      )}`}</span>
                    </div>
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
              placeholder="Brand’s / use (,) to separate if multiple"
              value={deviceBrand}
              onChange={(e) => setDeviceBrand(e.target.value)}
            />
          </div>
        )}
        {/* Step 3: Ask if user wants to enter high care area */}
        {step === 3 && (
          <div className="p-6 text-center">
            <h4 className="text-black text-lg font-semibold mb-6">
              Do you want to enter the high care area?
            </h4>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  // If yes, go to symptoms modal
                  setIsHighCare("Yes");
                  setStep(4);
                }}
                className="bg-[#1C274C] hover:bg-[#1C274C] text-white py-2 px-6 rounded-md"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  // If no, submit current data
                  setIsHighCare("No");
                  handleSubmit();
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-6 rounded-md"
              >
                No
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Symptoms & physical conditions modal */}
        {step === 4 && (
          <div className="p-4 space-y-6 max-h-[70vh] overflow-auto">
            <h4 className="text-black text-md font-semibold mb-1 uppercase text-center">
              Health and Prohibited Personal Items Declaration
            </h4>
            <p className="text-center text-sm text-gray-700">
              Do you have any of the following symptoms or physical conditions?
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Fever", key: "fever" },
                { label: "Cough", key: "cough" },
                { label: "Open wounds", key: "openWound" },
                { label: "Skin Boils", key: "skinBoils" },
                { label: "Skin Allergies", key: "skinAllergies" },
                { label: "Diarrhea", key: "diarrhea" },
                { label: "Nausea", key: "nausea" },
                { label: "Open Sores", key: "openSores" },
              ].map(({ label, key }) => (
                <label
                  key={key}
                  className={`flex items-center justify-between px-4 py-2 rounded-full border cursor-pointer ${
                    symptoms[key as keyof typeof symptoms]
                      ? "bg-[#1C274C] text-white border-[#1C274C]"
                      : "bg-white text-black border-gray-300"
                  }`}
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={symptoms[key as keyof typeof symptoms]}
                    onChange={() =>
                      setSymptoms((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof symptoms],
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md text-black"
              placeholder="Allergies / use (,) to separate if multiple"
              value={otherAllergies}
              onChange={(e) => setOtherAllergies(e.target.value)}
            />

            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md text-black"
              placeholder="Place/s visited for the past 7 days"
              value={recentPlaces}
              onChange={(e) => setRecentPlaces(e.target.value)}
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(3)}
                className="bg-gray-300 text-black py-2 px-6 rounded-md"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="bg-[#1C274C] text-white py-2 px-6 rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Prohibited items modal */}
        {step === 5 && (
          <div className="p-4 space-y-6 max-h-[70vh] overflow-auto">
            <h4 className="text-black text-md font-semibold mb-1 uppercase text-center">
              Health and Prohibited Personal Items Declaration
            </h4>
            <p className="text-center text-sm text-gray-700">
              Do you possess any of the following prohibited items?
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Mobile Phone", key: "mobilePhone" },
                { label: "Necklace", key: "necklace" },
                { label: "Camera", key: "camera" },
                { label: "Ring", key: "ring" },
                { label: "Medicines", key: "medicines" },
                { label: "ID", key: "id_card" },
                { label: "Notebook", key: "notebook" },
                { label: "Ballpen", key: "ballpen" },
                { label: "Earrings", key: "earrings" },
                { label: "Wristwatch", key: "wristwatch" },
              ].map(({ label, key }) => (
                <label
                  key={key}
                  className={`flex items-center justify-between px-4 py-2 rounded-full border cursor-pointer ${
                    prohibitedItems[key as keyof typeof prohibitedItems]
                      ? "bg-[#1C274C] text-white border-[#1C274C]"
                      : "bg-white text-black border-gray-300"
                  }`}
                >
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={
                      prohibitedItems[key as keyof typeof prohibitedItems]
                    }
                    onChange={() =>
                      setProhibitedItems((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof prohibitedItems],
                      }))
                    }
                  />
                </label>
              ))}
            </div>

            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md text-black"
              placeholder="Item/s (use , to separate if multiple)"
              value={otherProhibited}
              onChange={(e) => setOtherProhibited(e.target.value)}
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(4)}
                className="bg-gray-300 text-black py-2 px-6 rounded-md"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setIsHighCare("Yes");
                  handleSubmit();
                }}
                className="bg-[#1C274C] text-white py-2 px-6 rounded-md"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Controls - Next / Back buttons for steps 1 & 2 */}
        {(step === 1 || step === 2) && (
          <div className="p-4 flex justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep((prev) => (prev === 2 ? 1 : prev))}
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
                    setErrorMessage(
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
                    (deviceTypes.includes("Others") && !otherDevice)
                  ) {
                    setErrorMessage("Please select device and enter brand.");
                    return;
                  }
                  setStep(3);
                }}
                className="bg-[#1C274C] text-white py-2 px-6 rounded-md ml-auto"
              >
                Next
              </button>
            )}
          </div>
        )}

        {/* Show error or success */}
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
    </div>
  );
};

export default HostDetailsModal;
