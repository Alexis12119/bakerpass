import React, { useState, useEffect } from "react";
import { X, Search } from "lucide-react";
import axios from "axios";
import EmployeeDetailsModal from "@/components/Security/Modals/EmployeeDetails";
import Image from "next/image";
import { User } from "lucide-react";
import { Employee } from "@/types/Security";
import { showErrorToast } from "@/utils/customToasts";
import { DualRingSpinner } from "@/components/common/DualRingSpinner";

const NewVisitModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  fetchVisitorsByDate: () => Promise<void>;
}> = ({ isOpen, onClose, fetchVisitorsByDate: fetchVisitorsByDate }) => {
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchAvailableEmployees = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees/available`,
      );
      setAvailableEmployees(response.data);
    } catch (err) {
      showErrorToast("Failed to fetch employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchAvailableEmployees();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredEmployees = availableEmployees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-[90%] max-w-sm sm:max-w-md p-4 border border-black overflow-y-auto max-h-[90vh]">
        <div className="p-4 flex justify-between items-center">
          <h2 className="text-lg text-black font-semibold">
            List of Available Employees
          </h2>
          <button
            onClick={onClose}
            className="focus:outline-none bg-[#1C274C] p-2 rounded-lg"
          >
            <X className="text-white" size={20} />
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-500" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="px-4 pb-4 overflow-y-auto max-h-80">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
            {loading ? (
              <div className="col-span-2 flex justify-center py-20">
                <DualRingSpinner message="Loading employees..." />
              </div>
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer text-[#1C274C]"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <div className="h-10 w-10 relative rounded-full bg-gray-200 mr-3 overflow-hidden">
                    {employee.profileImage?.trim() ? (
                      <Image
                        src={employee.profileImage}
                        alt="Employee image"
                        layout="fill"
                        objectFit="cover"
                        className="h-full w-full"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{employee.name}</span>
                    <span className="text-xs text-gray-500">
                      {employee.department} {/* Display the department name */}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center h-full py-16 text-gray-500">
                No employees found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
      {showEmployeeDetails && selectedEmployee && (
        <EmployeeDetailsModal
          isOpen={showEmployeeDetails}
          onClose={() => setShowEmployeeDetails(false)}
          employee={selectedEmployee}
          fetchVisitorsByDate={fetchVisitorsByDate}
        />
      )}
    </div>
  );
};

export default NewVisitModal;
