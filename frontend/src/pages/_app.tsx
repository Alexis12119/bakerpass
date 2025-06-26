import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Toaster } from "react-hot-toast";

const roleToRouteMap: Record<string, string> = {
  Visitor: "/visitor",
  Employee: "/employee",
  Security: "/security",
  "Human Resources": "/hr",
  Nurse: "/nurse",
};

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          const decoded = jwtDecode(token) as { role: string };
          const baseRoute = roleToRouteMap[decoded.role];
          if (baseRoute && url.startsWith(baseRoute)) {
            localStorage.setItem("lastValidRoute", url);
          }
        } catch (err) {
          console.error("Invalid token during route change:", err);
        }
      }
    };

    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />{" "}
    </>
  );
}
