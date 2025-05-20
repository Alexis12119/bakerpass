import React from "react";
import { cards } from "@/data/mockData";

const DashboardCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.gradient} p-5 rounded-lg text-white shadow-md flex items-center gap-4`}
        >
          <div className="text-white text-lg">{card.icon}</div>
          <div>
            <div className="text-3xl font-bold">{card.value}</div>
            <div className="text-sm">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
