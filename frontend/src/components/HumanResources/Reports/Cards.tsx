import React, { useEffect, useState } from "react";
import Image from "next/image";
import EmployeeProfileModal from "@/components/HumanResources/Reports/Modals/EmployeeProfile";
import { Briefcase } from "react-feather";
import { User } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  department: string;
  total_visitors: number;
  avg_visitors: number;
  profileImageUrl: string;
}

const EmployeeCard: React.FC<{
  employee: Employee;
  onOpen: (emp: Employee) => void;
}> = ({ employee, onOpen }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpen(employee);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex items-center space-x-6 w-96 border-2">
      <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-100">
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
                fallbackDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A9.965 9.965 0 0112 15c2.485 0 4.736.908 6.879 2.404M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
                parent.appendChild(fallbackDiv);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-12 w-12 text-gray-400" />
          </div>
        )}
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
      <div className="flex overflow-x-auto space-x-4 pb-4 max-w-[82vw]">
        {employees.map((employee) => (
          <EmployeeCard key={employee.id} employee={employee} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
};

const EmployeeReportCards: React.FC<{
  searchQuery?: string;
  selectedDepartment?: string;
}> = ({ searchQuery = "", selectedDepartment = "All" }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [employees, setEmployees] = useState<Record<string, Employee[]>>({});
  const [loading, setLoading] = useState(true);

  const openModal = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const closeModal = () => {
    setSelectedEmployee(null);
  };

  const isModalOpen = !!selectedEmployee;

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedDepartment !== "All")
          params.append("department", selectedDepartment);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/employees?${params.toString()}`,
        );
        const data = await res.json();

        const grouped: Record<string, Employee[]> = {};
        data.forEach((emp: any) => {
          const dept = emp.department || "Unassigned";
          if (!grouped[dept]) grouped[dept] = [];
          grouped[dept].push({
            ...emp,
            profileImageUrl: emp.profileImage,
          });
        });
        setEmployees(grouped);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [searchQuery, selectedDepartment]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading employee reports...
      </div>
    );
  }

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

      {Object.keys(employees).length > 0 ? (
        Object.entries(employees).map(([department, emps]) => (
          <DepartmentSection
            key={department}
            department={department}
            employees={emps}
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
