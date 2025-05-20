import { Users, Calendar, BarChart, Pencil } from "lucide-react";

export const visitorNames = [
  "Jasper Velasco",
  "Alexis Corporal",
  "Jiro Luis Manalo",
  "Kimberly Caguite",
  "Sarha Goco",
  "Alyssa Urrera",
];

export const purposes = [
  "Meeting",
  "Delivery",
  "Interview",
  "Maintenance",
  "Consultation",
];
export const hosts = [
  "Franklin Baker",
  "Eleanor Smith",
  "Jacob Johnson",
  "Emily Davis",
  "Michael White",
];
export const departments = [
  "Human Resources",
  "IT",
  "Finance",
  "Marketing",
  "Operations",
];
export const statuses = [
  "Checked Out",
  // "Waiting Approval",
  // "Do Not Admit",
  // "Canceled",
  // "Expected",
  "Checked In",
];
export const times = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
];

export const cards = [
  {
    label: "No. of Occupants",
    value: 500,
    icon: <Users size={54} />,
    gradient: "bg-gradient-to-r from-[#221371] to-[#4124D7]",
  },
  {
    label: "This Month's Visitors",
    value: 160,
    icon: <Calendar size={54} />,
    gradient: "bg-gradient-to-r from-[#EEAC33] to-[#88621D]",
  },
  {
    label: "Daily Avg. Visitor",
    value: 16,
    icon: <BarChart size={54} />,
    gradient: "bg-gradient-to-r from-[#1EA83C] to-[#0C4218]",
  },
  {
    label: "Last Month's Visitor",
    value: 259,
    icon: <Pencil size={54} />,
    gradient: "bg-gradient-to-r from-[#C82020] to-[#621010]",
  },
];
