import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const roleToRouteMap: Record<string, string> = {
  Visitor: "/visitor",
  Employee: "/employee",
  Security: "/security",
  "Human Resources": "/hr",
  Nurse: "/nurse",
};

const roleSpinnerColors: Record<string, string> = {
  Visitor: "border-green-500",
  Employee: "border-yellow-500",
  Security: "border-red-500",
  "Human Resources": "border-blue-600",
  Nurse: "border-purple-500",
};

type ProtectedRouteProps = {
  allowedRole: string;
  children: React.ReactNode;
};

export default function ProtectedRoute({
  allowedRole,
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [spinnerColor, setSpinnerColor] = useState("border-gray-400");

  const redirectToFallback = (roleOverride?: string) => {
    const storedRole = sessionStorage.getItem("role");
    const fallback =
      sessionStorage.getItem("lastValidRoute") ||
      roleToRouteMap[roleOverride || storedRole || ""] ||
      "/login";
    router.replace(fallback);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const storedRole = sessionStorage.getItem("role");
    const currentBasePath = window.location.pathname.split("/")[1];

    if (storedRole && roleSpinnerColors[storedRole]) {
      setSpinnerColor(roleSpinnerColors[storedRole]);
    }

    if (!token || !storedRole || storedRole !== currentBasePath) {
      redirectToFallback();
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/auth/verify`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const user = response.data.user;

        if (roleSpinnerColors[user.role]) {
          setSpinnerColor(roleSpinnerColors[user.role]);
        }

        if (user.role !== allowedRole) {
          redirectToFallback(user.role);
        } else {
          // Delay unsetting loading so spinner shows
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        sessionStorage.clear();
        router.replace("/login");
      }
    };

    verifyToken();
  }, [router, allowedRole]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white backdrop-blur-sm transition-opacity">
        <div className="relative w-14 h-14">
          <div
            className={`absolute w-full h-full border-[5px] ${spinnerColor} border-t-transparent rounded-full animate-spin`}
          />
          <div className="absolute w-full h-full border-[5px] border-dashed border-[#1C274C] border-t-transparent rounded-full animate-[spin_2s_linear_infinite]" />
        </div>
        <span className="mt-4 text-[#1C274C] font-medium text-lg animate-pulse">
          Verifying access...
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
