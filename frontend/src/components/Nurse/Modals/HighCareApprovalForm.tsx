"use client";
import React, { useState } from "react";

interface HighCareApprovalFormProps {
  onClose: () => void;
  onSubmit: (formData: {
    selectedAreas: string[];
    equipment: string[];
    permissionType: string;
    comments: string;
  }) => void;
}

const HighCareApprovalForm: React.FC<HighCareApprovalFormProps> = ({ onClose, onSubmit }) => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [permissionType, setPermissionType] = useState("CLEAR WITH RECTAL");
  const [comments, setComments] = useState("");

  const areas = ["DC", "VCO", "PPI", "CWC", "FSP", "WAREHOUSE"];
  const gear = ["Gloves", "Facemask", "Coat"];

  const toggleItem = (item: string, list: string[], setter: (val: string[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSubmit = () => {
    onSubmit({
      selectedAreas,
      equipment,
      permissionType,
      comments,
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-200">
      <h2 className="text-center text-blue-900 font-bold text-sm uppercase mb-4">
        Clearance to Enter High Care Area
      </h2>

      <p className="text-sm text-center text-black mb-6">
        Select which high care area facility will the visitor be entering.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {areas.map((area) => (
          <button
            key={area}
            className={`py-2 rounded-lg font-semibold text-sm border ${
              selectedAreas.includes(area)
                ? "bg-[#1C274C] text-white"
                : "bg-white text-black"
            }`}
            onClick={() => toggleItem(area, selectedAreas, setSelectedAreas)}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="text-start mb-4 text-[#1C274C] text-bold">Consultation Information</div>
      <div className="mb-4 text-black">
        <input
          type="text"
          placeholder="Comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-sm"
        />
      </div>

      <div className="text-start text-[#1C274C] text-bold">Equipment required</div>
      <p className="text-sm font-medium mb-2">Equipment required</p>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {gear.map((item) => (
          <button
            key={item}
            className={`py-2 rounded-lg font-semibold text-sm border ${
              equipment.includes(item)
                ? "bg-[#1C274C] text-white"
                : "bg-white text-black"
            }`}
            onClick={() => toggleItem(item, equipment, setEquipment)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <select
          className="w-full px-4 py-2 border rounded-lg text-sm text-black"
          value={permissionType}
          onChange={(e) => setPermissionType(e.target.value)}
        >
          <option value="CLEAR WITH RECTAL">CLEAR WITH RECTAL</option>
          <option value="CLEAR WITH URINE">CLEAR WITH URINE</option>
          <option value="CLEAR WITHOUT TEST">CLEAR WITHOUT TEST</option>
        </select>
      </div>

      <button
        className="w-full py-2 rounded-lg bg-[#1C274C] text-white font-bold text-sm hover:bg-blue-900 transition"
        onClick={handleSubmit}
      >
        Done
      </button>

      <button
        className="w-full mt-2 py-2 rounded-lg border border-gray-300 text-sm text-black hover:bg-gray-100 transition"
        onClick={onClose}
      >
        Cancel
      </button>
    </div>
  );
};

export default HighCareApprovalForm;
