import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { mockEmployees } from "@/data/mockEmployees";
import EmployeeProfileModal from "@/components/HumanResources/Reports/Modals/EmployeeProfile";
import { Briefcase, Star } from "react-feather";

interface Employee {
  id: string;
  name: string;
  department: string;
  total_visitors: number;
  avg_visitors: number;
  profileImageUrl: string;
}

interface ReportCardProps {
  employee: Employee;
}

interface ReportCardsProps {
  employees: Record<string, Employee[]>;
  searchQuery: string;
  selectedDepartment: string;
}

const EmployeeCard: React.FC<
  ReportCardProps & { onOpen: (emp: Employee) => void }
> = ({ employee, onOpen }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpen(employee);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex items-center space-x-6 w-96 border-2">
      <div className="w-24 h-24 relative rounded-full overflow-hidden">
        <Image
          src={employee.profileImageUrl}
          alt={`${employee.name}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900">{employee.name}</h3>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center bg-[#1C274C] px-3 py-1 rounded-md text-xs text-black">
            <Briefcase size={18} className="mr-2 text-white" />
            <div className="text-white mr-2">
              {employee.avg_visitors} visitor
              {employee.avg_visitors !== 1 ? "s" : ""}/day
            </div>
          </div>
        </div>
        <button
          onClick={handleClick}
          className="text-blue-600 text-sm font-medium mt-3 hover:underline"
        >
          View Profile &raquo;
        </button>
      </div>
    </div>
  );
};

export const DepartmentSection: React.FC<{
  department: string;
  employees: Employee[];
  onOpen: (emp: Employee) => void;
}> = ({ department, employees, onOpen }) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-black">{department}</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4 max-w-[85vw]">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
};

const EmployeeReportCards: React.FC<ReportCardsProps> = ({
  employees = mockEmployees,
  searchQuery = "",
  selectedDepartment = "All",
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  const openModal = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
  };

  const isModalOpen = !!selectedEmployee;

  const filteredEmployees = useMemo(() => {
    const result: Record<string, Employee[]> = {};

    Object.entries(employees).forEach(([department, departmentEmployees]) => {
      if (selectedDepartment !== "All" && selectedDepartment !== department)
        return;

      const matchingEmployees = searchQuery
        ? departmentEmployees.filter((employee: Employee) =>
            employee.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : departmentEmployees;

      if (matchingEmployees.length > 0) {
        result[department] = matchingEmployees;
      }
    });

    return result;
  }, [employees, searchQuery, selectedDepartment]);

  return (
    <div className="relative bg-white p-4 overflow-y-auto">
      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-md z-10"
            onClick={closeModal}
          />
          <EmployeeProfileModal
            employee={selectedEmployee!}
            isOpen={isModalOpen}
            onClose={closeModal}
          />
        </>
      )}

      {Object.keys(filteredEmployees).length > 0 ? (
        Object.entries(filteredEmployees).map(([department, employees]) => (
          <DepartmentSection
            key={department}
            department={department}
            employees={employees}
            onOpen={openModal}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          No employees found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default EmployeeReportCards;
