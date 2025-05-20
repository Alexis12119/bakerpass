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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [visitPurposeId, setVisitPurposeId] = useState<number | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [newVisitorId, setNewVisitorId] = useState<number | null>(null);
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
  }>({
    fever: false,
    cough: false,
    openWound: false,
    nausea: false,
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
  }>({
    mobilePhone: false,
    camera: false,
    medicines: false,
    notebook: false,
    earrings: false,
  });
  const [otherProhibited, setOtherProhibited] = useState("");

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
      });
      setOtherAllergies("");
      setRecentPlaces("");
      setProhibitedItems({
        mobilePhone: false,
        camera: false,
        medicines: false,
        notebook: false,
        earrings: false,
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
      !newVisitorId ||
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

      payload.mobilePhone = prohibitedItems?.mobilePhone || false;
      payload.camera = prohibitedItems?.camera || false;
      payload.medicines = prohibitedItems?.medicines || false;
      payload.notebook = prohibitedItems?.notebook || false;
      payload.earrings = prohibitedItems?.earrings || false;
      payload.otherProhibited = otherProhibited || null;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/visits`,
        payload,
      );

      await fetchVisitors();
      setSuccessMessage("Visit created successfully");
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
          <p className="text-blue-100 text-sm text-center">{host.department}</p>
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
                    className="text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <input
                    type="text"
                    className="text-black w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <select
                  className="text-black w-full p-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
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
          <div className="p-4 space-y-3">
            <h4 className="text-black text-sm font-medium mb-3">
              Devices to be brought (Select all that apply)
            </h4>

            <div className="space-y-2">
              {["Laptop", "Phone", "Tablet", "Others"].map((device) => (
                <label key={device} className="text-black flex items-center space-x-2">
                  <input
                    type="checkbox"
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
                  <span>{device}</span>
                </label>
              ))}
            </div>

            {deviceTypes.includes("Others") && (
              <input
                type="text"
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                placeholder="Specify other device"
                value={otherDevice}
                onChange={(e) => setOtherDevice(e.target.value)}
              />
            )}

            <input
              type="text"
              className="text-black w-full p-2 border border-gray-300 rounded-md"
              placeholder="Brand Name"
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
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md"
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
          <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
            <h4 className="text-black text-lg font-semibold mb-3">
              Do you have any of the following symptoms or physical conditions?
            </h4>

            <div className="space-y-1">
              {[
                { label: "Fever", key: "fever" },
                { label: "Cough", key: "cough" },
                { label: "Open Wound", key: "openWound" },
                { label: "Nausea", key: "nausea" },
              ].map(({ label, key }) => (
                <label
                  key={key}
                  className="text-black inline-flex items-center space-x-2 mr-3"
                >
                  <input
                    type="checkbox"
                    checked={symptoms[key as keyof typeof symptoms]}
                    onChange={() =>
                      setSymptoms((prev) => ({
                        ...prev,
                        [key]: !prev[key as keyof typeof symptoms],
                      }))
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-black block font-medium mb-1">
                Other allergies:
              </label>
              <input
                type="text"
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter other allergies"
                value={otherAllergies}
                onChange={(e) => setOtherAllergies(e.target.value)}
              />
            </div>

            <div>
              <label className="text-black block font-medium mb-1">
                Place recently visited for the past 7 days:
              </label>
              <input
                type="text"
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter recent places"
                value={recentPlaces}
                onChange={(e) => setRecentPlaces(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(3)} // go back to ask modal
                className="bg-gray-300 text-black py-2 px-6 rounded-md"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)} // go next to prohibited items modal
                className="bg-blue-600 text-white py-2 px-6 rounded-md"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Prohibited items modal */}
        {step === 5 && (
          <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
            <h4 className="text-black text-lg font-semibold mb-3">
              Prohibited items
            </h4>
            <div className="space-y-1">
              {[
                { label: "Mobile Phone", key: "mobilePhone" },
                { label: "Camera", key: "camera" },
                { label: "Medicines", key: "medicines" },
                { label: "Notebook", key: "notebook" },
                { label: "Earrings", key: "earrings" },
              ].map(({ label, key }) => (
                <label
                  key={key}
                  className="text-black inline-flex items-center space-x-2 mr-3"
                >
                  <input
                    type="checkbox"
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
                  <span>{label}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-black block font-medium mb-1">
                Other items:
              </label>
              <input
                type="text"
                className="text-black w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter other prohibited items"
                value={otherProhibited}
                onChange={(e) => setOtherProhibited(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(4)} // go back to symptoms modal
                className="bg-gray-300 text-black py-2 px-6 rounded-md"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setIsHighCare("Yes");
                  handleSubmit();
                }} // submit data after prohibited items
                className="bg-blue-600 text-white py-2 px-6 rounded-md"
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
                className="bg-blue-600 text-white py-2 px-6 rounded-md ml-auto"
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
                className="bg-blue-600 text-white py-2 px-6 rounded-md ml-auto"
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
