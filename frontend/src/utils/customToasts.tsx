import { toast } from "react-hot-toast";

const baseToastStyles =
  "relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full";

const MAX_CUSTOM_TOASTS = 3;
const activeCustomToasts: string[] = [];

const manageToastStack = () => {
  if (activeCustomToasts.length >= MAX_CUSTOM_TOASTS) {
    const oldest = activeCustomToasts.shift();
    if (oldest) toast.dismiss(oldest);
  }
};

export const showSuccessToast = (message: string) => {
  manageToastStack();

  const id = toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } transition-all`}
      >
        <div className={`${baseToastStyles} border-l-4 border-green-600`}>
          <h2 className="text-lg font-semibold text-green-600 mb-2">Success</h2>
          <p className="text-gray-800">{message}</p>
        </div>
      </div>
    ),
    {
      // position: "top-right",
      // duration: 3000,
      id: `${Date.now()}-success`,
    },
  );

  activeCustomToasts.push(id);
};

export const showErrorToast = (message: string) => {
  manageToastStack();

  const id = toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } transition-all`}
      >
        <div className={`${baseToastStyles} border-l-4 border-red-600`}>
          <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-800">{message}</p>
        </div>
      </div>
    ),
    {
      // position: "top-right",
      // duration: 3000,
      id: `${Date.now()}-error`,
    },
  );

  activeCustomToasts.push(id);
};
