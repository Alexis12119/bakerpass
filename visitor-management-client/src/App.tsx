import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import VisitorTable from "./components/VisitorTable";
import AddVisitorModal from "./components/AddVisitorModal";
import Header from "./components/Header";
import { Visitor } from "./types/Visitor";
import {
  fetchVisitors,
  addVisitor,
  timeOutVisitor,
} from "./services/visitorService";

const App: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("Latest");

  useEffect(() => {
    loadVisitors();
  }, []);

  const loadVisitors = async () => {
    try {
      const data = await fetchVisitors();
      setVisitors(data);
    } catch (error) {
      console.error("Failed to fetch visitors:", error);
    }
  };

  const handleAddVisitor = async (
    visitorData: Omit<Visitor, "id" | "timeIn" | "timeOut">,
  ) => {
    try {
      await addVisitor(visitorData);
      loadVisitors();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add visitor:", error);
    }
  };

  const handleTimeOut = async (id: number) => {
    try {
      await timeOutVisitor(id);
      loadVisitors();
    } catch (error) {
      console.error("Failed to time out visitor:", error);
    }
  };

  const exportAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Visitor List", 14, 15);

    const tableColumn = ["Name", "Purpose", "Contact", "Check-In", "Check-Out"];
    const tableRows: string[][] = [];

    visitors.forEach((visitor) => {
      const row = [
        visitor.name,
        visitor.purpose,
        visitor.contact,
        new Date(visitor.timeIn).toLocaleString(),
        visitor.timeOut ? new Date(visitor.timeOut).toLocaleString() : "N/A",
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: 0,
        fontStyle: "bold",
        halign: "center",
      },
      styles: { lineWidth: 0.1, lineColor: [50, 50, 50] },
    });

    doc.save("visitor-list.pdf");
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(event.target.value);
  };

  const filteredVisitors = visitors.filter((visitor) =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedVisitors = [...filteredVisitors].sort((a, b) => {
    if (sortOrder === "Latest") {
      return new Date(b.timeIn).getTime() - new Date(a.timeIn).getTime();
    } else if (sortOrder === "Oldest") {
      return new Date(a.timeIn).getTime() - new Date(b.timeIn).getTime();
    } else if (sortOrder === "Name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <Header
          onAddVisitor={() => setIsModalOpen(true)}
          onExportPDF={exportAsPDF}
        />
        <div className="p-6 flex gap-4 justify-end">
          <input
            type="text"
            placeholder="Search by name..."
            className="w-1/3 p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 text-black"
            value={searchTerm}
            onChange={handleSearch}
          />
          <div>
            <select
              className="p-2 border rounded-lg shadow-sm text-black"
              value={sortOrder}
              onChange={handleSortChange}
            >
              <option value="Latest">Sort by Latest</option>
              <option value="Oldest">Sort by Oldest</option>
              <option value="Name">Sort by Name</option>
            </select>
          </div>
        </div>

        <VisitorTable visitors={sortedVisitors} onTimeOut={handleTimeOut} />
      </div>

      {isModalOpen && (
        <AddVisitorModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddVisitor}
        />
      )}
    </div>
  );
};

export default App;
