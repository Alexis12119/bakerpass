import { X } from "lucide-react";
import React, { useState } from "react";
import {
  HealthDeclarationData,
  HealthDeclarationModalProps,
} from "@/types/Nurse";

const HealthDeclarationModal: React.FC<HealthDeclarationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // Step: 4 (symptoms), 5 (prohibited items)
  const [step, setStep] = useState<4 | 5>(4);

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

  const handleSubmit = () => {
    // Flatten the data structure to match backend expectations
    const healthData: HealthDeclarationData = {
      // Symptoms (flattened)
      fever: symptoms.fever,
      cough: symptoms.cough,
      openWound: symptoms.openWound,
      nausea: symptoms.nausea,
      skinBoils: symptoms.skinBoils,
      skinAllergies: symptoms.skinAllergies,
      diarrhea: symptoms.diarrhea,
      openSores: symptoms.openSores,
      otherAllergies,
      recentPlaces,
      // Prohibited items (flattened)
      mobilePhone: prohibitedItems.mobilePhone,
      camera: prohibitedItems.camera,
      medicines: prohibitedItems.medicines,
      notebook: prohibitedItems.notebook,
      earrings: prohibitedItems.earrings,
      necklace: prohibitedItems.necklace,
      ring: prohibitedItems.ring,
      id_card: prohibitedItems.id_card,
      ballpen: prohibitedItems.ballpen,
      wristwatch: prohibitedItems.wristwatch,
      otherProhibited,
    };
    onSubmit(healthData);
  };

  const resetForm = () => {
    setStep(4);
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
  };

  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md border border-black max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="p-2 absolute top-4 right-4 bg-white text-[#1C274C] hover:text-gray-700 focus:outline-none z-10 rounded-md"
        >
          <X size={20} />
        </button>

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
                  className={`flex items-center justify-between px-4 py-2 rounded-full border cursor-pointer transition-colors ${
                    symptoms[key as keyof typeof symptoms]
                      ? "bg-[#1C274C] text-white border-[#1C274C]"
                      : "bg-white text-black border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span className="text-sm">{label}</span>
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
              className="w-full p-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:border-[#1C274C] focus:outline-none"
              placeholder="Allergies / use (,) to separate if multiple"
              value={otherAllergies}
              onChange={(e) => setOtherAllergies(e.target.value)}
            />

            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:border-[#1C274C] focus:outline-none"
              placeholder="Place/s visited for the past 7 days"
              value={recentPlaces}
              onChange={(e) => setRecentPlaces(e.target.value)}
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setStep(5)}
                className="bg-[#1C274C] text-white py-2 px-6 rounded-md hover:bg-[#2a3654] transition-colors"
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
                  className={`flex items-center justify-between px-4 py-2 rounded-full border cursor-pointer transition-colors ${
                    prohibitedItems[key as keyof typeof prohibitedItems]
                      ? "bg-[#1C274C] text-white border-[#1C274C]"
                      : "bg-white text-black border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <span className="text-sm">{label}</span>
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
              className="w-full p-3 border border-gray-300 rounded-md text-black placeholder-gray-500 focus:border-[#1C274C] focus:outline-none"
              placeholder="Item/s (use , to separate if multiple)"
              value={otherProhibited}
              onChange={(e) => setOtherProhibited(e.target.value)}
            />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(4)}
                className="bg-gray-300 text-black py-2 px-6 rounded-md hover:bg-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-[#1C274C] text-white py-2 px-6 rounded-md hover:bg-[#2a3654] transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthDeclarationModal;
