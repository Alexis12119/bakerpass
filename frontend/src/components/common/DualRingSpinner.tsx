export const DualRingSpinner = ({ message }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center">
    <div className="relative w-12 h-12">
      <div className="absolute w-full h-full border-[4px] border-blue-600 border-t-transparent rounded-full animate-spin" />
      <div className="absolute w-full h-full border-[4px] border-dashed border-[#1C274C] border-t-transparent rounded-full animate-[spin_2s_linear_infinite]" />
    </div>
    {message && (
      <span className="mt-4 text-[#1C274C] font-medium text-sm animate-pulse">
        {message}
      </span>
    )}
  </div>
);
