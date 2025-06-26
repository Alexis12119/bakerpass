"use client";
import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { Dialog, DialogPanel } from "@headlessui/react";
import { jwtDecode } from "jwt-decode";
import { HighCareApprovalFormProps } from "@/types/Nurse";
import { showErrorToast } from "@/utils/customToasts";

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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token) as {
          id: number;
          firstName: string;
          lastName: string;
        };
        setFirstName(decoded.firstName);
        setLastName(decoded.lastName);
      } catch (error: any) {
        showErrorToast(`Invalid token: ${error.message}`);
        setFirstName("");
        setLastName("");
        sessionStorage.removeItem("token");
      }
    } else {
      setFirstName("");
      setLastName("");
    }
  }, []);

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

    const canvas = await html2canvas(input, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: true,
      ignoreElements: (element) => {
        return element.classList.contains("no-pdf");
      },
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("high-care-clearance.pdf");
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
            <option value="CLEAR WITHOUT TEST">CLEAR WITHOUT RECTAL</option>
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
        <DialogPanel className="text-black bg-white p-6 rounded-lg max-w-4xl w-full shadow-xl overflow-y-auto max-h-[90vh]">
          <h3 className="text-lg font-bold text-center mb-4">Print Preview</h3>

          <style jsx>{`
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .print-background-dark {
                background-color: #1c274c !important;
                color: white !important;
              }

              .print-background-light {
                background-color: white !important;
                color: black !important;
                border: 1px solid #d1d5db !important;
              }
            }
          `}</style>

          <style jsx>{`
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }

              .print-background-dark {
                background-color: #1c274c !important;
                color: white !important;
              }

              .print-background-light {
                background-color: white !important;
                color: black !important;
                border: 1px solid #d1d5db !important;
              }
            }
          `}</style>

          <div
            id="printable-form"
            className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-200"
            style={{
              colorAdjust: "exact",
            }}
          >
            <h2 className="text-center text-blue-900 font-bold text-sm uppercase mb-4">
              Clearance to Enter High Care Area
            </h2>

            <p className="text-sm text-center text-black mb-6">
              Selected high care area facility:
            </p>

            {/* Areas Display - matching original layout */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {areas.map((area) => (
                <div
                  key={area}
                  className={`py-2 rounded-lg font-semibold text-sm border text-center ${
                    submittedData?.selectedAreas.includes(area)
                      ? "bg-[#1C274C] text-white print-background-dark"
                      : "bg-white text-black border-gray-300 print-background-light"
                  }`}
                  style={{
                    colorAdjust: "exact",
                    backgroundColor: submittedData?.selectedAreas.includes(area)
                      ? "#1C274C"
                      : "white",
                    color: submittedData?.selectedAreas.includes(area)
                      ? "white"
                      : "black",
                  }}
                >
                  {area}
                </div>
              ))}
            </div>

            <div className="text-start mb-4 text-[#1C274C] text-bold">
              Consultation Information
            </div>
            <div className="mb-4 text-black">
              <div className="w-full px-4 py-2 border rounded-lg text-sm bg-gray-50 min-h-[40px] flex items-center">
                {submittedData?.comments || "No comments provided"}
              </div>
            </div>

            <div className="text-start text-[#1C274C] text-bold">
              Equipment required
            </div>
            <p className="text-sm font-medium mb-2">Equipment required</p>

            {/* Equipment Display - matching original layout */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {gear.map((item) => (
                <div
                  key={item}
                  className={`py-2 rounded-lg font-semibold text-sm border text-center ${
                    submittedData?.equipment.includes(item)
                      ? "bg-[#1C274C] text-white print-background-dark"
                      : "bg-white text-black border-gray-300 print-background-light"
                  }`}
                  style={{
                    colorAdjust: "exact",
                    backgroundColor: submittedData?.equipment.includes(item)
                      ? "#1C274C"
                      : "white",
                    color: submittedData?.equipment.includes(item)
                      ? "white"
                      : "black",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Permission Type Display - matching original layout */}
            <div className="mb-6">
              <div className="w-full px-4 py-2 border rounded-lg text-sm text-black bg-gray-50">
                {submittedData?.permissionType}
              </div>
            </div>

            {/* Approval section */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-black">
                <strong>Approved by:</strong> {firstName} {lastName}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
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
        </DialogPanel>
      </Dialog>
    </>
  );
};

export default HighCareApprovalForm;
