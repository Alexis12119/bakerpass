import React from "react";

const StatusFilters: React.FC = () => {
  return (
    <div className="flex flex-wrap space-x-2 space-y-2 md:space-y-0 mt-4 border-gray-300 rounded-lg bg-gray-100">
      {["Expected", "Waiting Approval", "Do Not Admit", "Canceled"].map(
        (status, index) => (
          <label
            key={index}
            className="flex items-center space-x-2 text-sm font-bold text-black border border-gray-100 bg-white p-2"
          >
            <input type="checkbox" className="form-checkbox accent-[#1C274C]" />
            <span>{status}</span>
          </label>
        ),
      )}
    </div>
  );
};

export default StatusFilters;
