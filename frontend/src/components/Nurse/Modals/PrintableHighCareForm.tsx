import React from "react";

interface PrintableProps {
  formData: {
    selectedAreas: string[];
    equipment: string[];
    permissionType: string;
    comments: string;
  };
}

const PrintableHighCareForm = ({ formData }: PrintableProps) => {
  return (
    <div id="printable-form" className="p-6 bg-white text-black text-sm max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">High Care Clearance Form</h2>

      <div className="mb-2">
        <strong>Selected Areas:</strong> {formData.selectedAreas.join(", ")}
      </div>
      <div className="mb-2">
        <strong>Required Equipment:</strong> {formData.equipment.join(", ")}
      </div>
      <div className="mb-2">
        <strong>Permission Type:</strong> {formData.permissionType}
      </div>
      <div className="mb-2">
        <strong>Comments:</strong> {formData.comments || "N/A"}
      </div>
    </div>
  );
};

export default PrintableHighCareForm;
