import React from "react";

interface HeaderProps {
  onAddVisitor: () => void;
  onExportPDF: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onAddVisitor,
  onExportPDF,
}) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide">
        Visitor Management
      </h1>
      <div className="flex gap-3">
        <button
          onClick={onExportPDF}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Export as PDF
        </button>
        <button
          onClick={onAddVisitor}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
        >
          Add Visitor
        </button>
      </div>
    </div>
  );
};

export default Header;
