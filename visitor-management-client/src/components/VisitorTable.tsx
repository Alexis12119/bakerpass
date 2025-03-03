import React from "react";
import { Visitor } from "../types/Visitor";

interface VisitorTableProps {
  visitors: Visitor[];
  onTimeOut: (id: number) => void;
}

const VisitorTable: React.FC<VisitorTableProps> = ({ visitors, onTimeOut }) => {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-300 text-white">
            <th className="border-2 border-gray-700 px-4 py-3 font-semibold text-center text-black">
              Name
            </th>
            <th className="border-2 border-gray-700 px-4 py-3 font-semibold text-center text-black">
              Purpose
            </th>
            <th className="border-2 border-gray-700 px-4 py-3 font-semibold text-center text-black">
              Contact
            </th>
            <th className="border-2 border-gray-700 px-4 py-3 font-semibold text-center text-black">
              Time-In
            </th>
            <th className="border-2 border-gray-700 px-4 py-3 font-semibold text-center text-black">
              Time-Out 
            </th>
            <th className="border-2 border-gray-700 px-4 py-3 text-center font-semibold text-black">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {visitors.map((visitor) => (
            <tr key={visitor.id} className="bg-white">
              <td className="border border-gray-300 p-3 text-center text-black">{visitor.name}</td>
              <td className="border border-gray-300 p-3 text-center text-black">{visitor.purpose}</td>
              <td className="border border-gray-300 p-3 text-center text-black">{visitor.contact}</td>
              <td className="border border-gray-300 p-3 text-center text-black">{visitor.timeIn}</td>
              <td className="border border-gray-300 p-3 text-center text-black">
                {visitor.timeOut || "-"}
              </td>
              <td className="border border-gray-300 p-3 text-center text-black">
                {!visitor.timeOut ? (
                  <button
                    onClick={() => onTimeOut(visitor.id)}
                    className="bg-black text-white px-3 py-1 rounded-md hover:bg-gray-800"
                  >
                    Time Out
                  </button>
                ) : (
                  <span className="text-green-500">Timed Out</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VisitorTable;
