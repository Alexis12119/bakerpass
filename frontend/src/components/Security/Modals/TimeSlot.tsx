import React from "react";
import { X, Check } from "lucide-react";

type TimeSlot = {
  id: number;
  start_time: string;
  end_time: string;
};

interface TimeSlotModalProps {
  timeSlots: TimeSlot[];
  selectedTimeSlotId: number | null;
  onSelect: (id: number) => void;
  onClose: () => void;
}

const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  timeSlots,
  selectedTimeSlotId,
  onSelect,
  onClose,
}) => {
  const formatTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 z-50 flex justify-center items-center">
      <div className="bg-white w-[90%] max-w-md p-6 rounded-xl relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>
        <h3 className="text-black text-lg font-bold mb-4 text-center">
          Select a Time Slot
        </h3>
        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {timeSlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => {
                onSelect(slot.id);
                onClose();
              }}
              className={`flex items-center justify-center p-3 rounded-md border text-sm font-medium ${
                selectedTimeSlotId === slot.id
                  ? "bg-[#1C274C] text-white border-[#1C274C]"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
            >
              {selectedTimeSlotId === slot.id && (
                <Check className="w-4 h-4 mr-2" />
              )}
              {`${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotModal;
