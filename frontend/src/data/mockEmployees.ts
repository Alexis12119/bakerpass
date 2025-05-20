// src/data/employeeMockData.ts
interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
}

// Mock data for employees grouped by department
export const mockEmployees: Record<string, Employee[]> = {
  "Human Resources": [
    {
      id: "hr-1",
      name: "Jiro Luis Manalo",
      position: "HR Manager",
      department: "Human Resources",
    },
    {
      id: "hr-2",
      name: "Jiro Luis Manalo",
      position: "HR Recruiter",
      department: "Human Resources",
    },
    {
      id: "hr-3",
      name: "Jiro Luis Manalo",
      position: "HR Assistant",
      department: "Human Resources",
    },
    {
      id: "hr-4",
      name: "Jiro Luis Manalo",
      position: "HR Manager",
      department: "Human Resources",
    },
    {
      id: "hr-5",
      name: "Jiro Luis Manalo",
      position: "HR Manager",
      department: "Human Resources",
    },

    {
      id: "hr-6",
      name: "Jiro Luis Manalo",
      position: "HR Manager",
      department: "Human Resources",
    },

    {
      id: "hr-7",
      name: "Jiro Luis Manalo",
      position: "HR Manager",
      department: "Human Resources",
    },

    {
      id: "hr-8",
      name: "Jiro Luis Manalo",
      position: "HR Manager",
      department: "Human Resources",
    },
  ],
  "Information Technology": [
    {
      id: "it-1",
      name: "Jiro Luis Manalo",
      position: "IT Manager",
      department: "Information Technology",
    },
    {
      id: "it-2",
      name: "Jiro Luis Manalo",
      position: "Developer",
      department: "Information Technology",
    },
  ],
  Finance: [
    {
      id: "fin-1",
      name: "Jiro Luis Manalo",
      position: "Finance Manager",
      department: "Finance",
    },
  ],
  Marketing: [
    {
      id: "mkt-1",
      name: "Jiro Luis Manalo",
      position: "Marketing Specialist",
      department: "Marketing",
    },
  ],
};
