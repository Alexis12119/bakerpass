import React, { useState } from "react";
import Image from "next/image";
import EmployeeProfileModal from "@/components/HumanResources/Reports/Modals/EmployeeProfile";
import { Briefcase } from "react-feather";
import { User } from "lucide-react";
import { Employee } from "@/types/HumanResources/Reports";
import { DualRingSpinner } from "@/components/common/DualRingSpinner";

const EmployeeCard: React.FC<{
  employee: Employee;
  onOpen: (emp: Employee) => void;
}> = ({ employee, onOpen }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 flex items-center space-x-6 w-[360px] border border-gray-200 shrink-0">
      {/* Profile Image */}
      <div className="w-20 h-20 relative rounded-full overflow-hidden bg-gray-100">
        {employee.profileImageUrl &&
        employee.profileImageUrl !== "undefined" ? (
          <Image
            src={employee.profileImageUrl}
            alt={employee.name}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLElement;
              target.style.display = "none";
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = "";
                const fallbackDiv = document.createElement("div");
                fallbackDiv.className =
                  "absolute inset-0 flex items-center justify-center";
                fallbackDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A9.965 9.965 0 0112 15c2.485 0 4.736.908 6.879 2.404M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
                parent.appendChild(fallbackDiv);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-10 w-10 text-gray-400" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-[#1C274C]">
          {employee.name}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center bg-[#1C274C] px-3 py-1 rounded-full text-xs text-white">
            <Briefcase size={16} className="mr-2" />
            {employee.avg_visitors} visitor
            {employee.avg_visitors !== 1 ? "s" : ""}/day
          </div>
        </div>
        <button
          onClick={() => onOpen(employee)}
          className="text-blue-600 text-sm font-medium mt-3 hover:underline"
        >
          View Profile &raquo;
        </button>
      </div>
    </div>
  );
};

const DepartmentSection: React.FC<{
  department: string;
  employees: Employee[];
  onOpen: (emp: Employee) => void;
}> = ({ department, employees, onOpen }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold mb-4 text-[#1C274C]">{department}</h2>
    <div className="flex overflow-x-auto space-x-5 pb-8 max-w-full">
      {employees.map((employee) => (
        <EmployeeCard key={employee.id} employee={employee} onOpen={onOpen} />
      ))}
    </div>
  </div>
);

const EmployeeReportCards: React.FC<{
  employees: Record<string, Employee[]>;
  loading: boolean;
}> = ({ employees, loading }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const closeModal = () => setSelectedEmployee(null);

  return (
    <div className="relative bg-white p-6 overflow-y-auto">
      {selectedEmployee && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/10 z-10"
            onClick={closeModal}
          />
          <EmployeeProfileModal
            employee={selectedEmployee}
            isOpen={!!selectedEmployee}
            onClose={closeModal}
          />
        </>
      )}

      {loading ? (
        <div className="py-20">
          <DualRingSpinner message="Loading employees..." />
        </div>
      ) : Object.keys(employees).length > 0 ? (
        Object.entries(employees).map(([department, emps]) => (
          <DepartmentSection
            key={department}
            department={department}
            employees={emps}
            onOpen={setSelectedEmployee}
          />
        ))
      ) : (
        <div className="text-center py-10 text-gray-500 text-sm">
          No employees found matching your search criteria.
        </div>
      )}
    </div>
  );
};
export default EmployeeReportCards;
