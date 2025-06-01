"use client";
import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { Dialog } from "@headlessui/react";

interface HighCareApprovalFormProps {
  onClose: () => void;
  onSubmit: (formData: {
    selectedAreas: string[];
    equipment: string[];
    permissionType: string;
    comments: string;
  }) => void;
}

const HighCareApprovalForm: React.FC<HighCareApprovalFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [permissionType, setPermissionType] = useState("CLEAR WITH RECTAL");
  const [comments, setComments] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const areas = ["DC", "VCO", "PPI", "CWC", "FSP", "WAREHOUSE"];
  const gear = ["Gloves", "Facemask", "Coat"];

  const toggleItem = (
    item: string,
    list: string[],
    setter: (val: string[]) => void,
  ) => {
    setter(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
    );
  };

  const handleSubmit = () => {
    const formData = {
      selectedAreas,
      equipment,
      permissionType,
      comments,
    };
    setSubmittedData(formData);
    setPreviewOpen(true); // Show preview before final submission
  };

  const handleFinalSubmit = () => {
    onSubmit(submittedData);
    setPreviewOpen(false);
  };

  const handleDownloadPDF = async () => {
    const input = document.getElementById("printable-form");
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("high-care-clearance.pdf");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
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

        <div className="text-start mb-4 text-[#1C274C] text-bold">
          Consultation Information
        </div>
        <div className="mb-4 text-black">
          <input
            type="text"
            placeholder="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm"
          />
        </div>

        <div className="text-start text-[#1C274C] text-bold">
          Equipment required
        </div>
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

      {/* Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      >
        <Dialog.Panel className="text-black bg-white p-6 rounded-lg max-w-2xl w-full shadow-xl overflow-y-auto max-h-[90vh]">
          <h3 className="text-lg font-bold text-center mb-4">Print Preview</h3>

          <div
            id="printable-form"
            className="p-4 bg-white text-black text-sm border border-black print-preview"
          >
            <h2 className="text-center text-[#1C274C] font-bold text-sm uppercase">
              Clearance to Enter High Care Area
            </h2>

            <p className="text-sm text-center">Selected high care area(s):</p>
            <div className="grid grid-cols-3 gap-2">
              {submittedData?.selectedAreas.map((area: string) => (
                <div
                  key={area}
                  className="text-sm py-2 px-3 border bg-[#1C274C] text-white border-black rounded text-center"
                >
                  {area}
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-[#1C274C] font-semibold text-sm mt-4 mb-1">
                Consultation Comments:
              </h4>
              <p className="border px-3 py-2 rounded text-sm bg-gray-50">
                {submittedData?.comments || "N/A"}
              </p>
            </div>

            <div>
              <h4 className="text-[#1C274C] font-semibold text-sm mt-4 mb-1">
                Equipment Required:
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {submittedData?.equipment.map((item: string) => (
                  <div
                    key={item}
                    className="text-sm py-2 px-3 border bg-[#1C274C] text-white border-black rounded text-center"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[#1C274C] font-semibold text-sm mt-4 mb-1">
                Permission Type:
              </h4>
              <p className="border px-3 py-2 rounded text-sm bg-gray-50">
                {submittedData?.permissionType}
              </p>
            </div>
          </div>

          <div className="mt-6 text-left text-sm">
            Approved by:{" "}
            <span className="font-semibold">
              {typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("user") || "{}")?.firstName +
                  " " +
                  JSON.parse(localStorage.getItem("user") || "{}")?.lastName
                : ""}
            </span>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download PDF
            </button>
            <button
              onClick={handleFinalSubmit}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Submit
            </button>
            <button
              onClick={() => setPreviewOpen(false)}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </>
  );
};

export default HighCareApprovalForm;
