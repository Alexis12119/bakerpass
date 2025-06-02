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

type ProtectedRouteProps = {
  allowedRole: string;
  children: React.ReactNode;
};

export default function ProtectedRoute({
  allowedRole,
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const baseRoute = window.location.pathname.split("/")[1];

    if (!token || !role || role !== baseRoute) {
      const fallback = sessionStorage.getItem("lastValidRoute") || "/login";
      router.replace(fallback);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_HOST}/auth/verify`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const user = res.data.user;

        if (user.role !== allowedRole) {
          const fallback =
            sessionStorage.getItem("lastValidRoute") ||
            roleToRouteMap[user.role] ||
            "/login";
          router.replace(fallback);
        } else {
          setAuthorized(true);
        }
      } catch (err) {
        console.error("Token verification failed", err);
        sessionStorage.clear();
        router.replace("/login");
      }
    };

    verifyToken();
  }, [router, allowedRole]);

  if (authorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!authorized) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
}
