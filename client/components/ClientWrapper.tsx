"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ToastProvider } from "@/components/ui/toast";
import { ModuleSelector } from "@/components/module-selector";

interface Props {
  children: ReactNode;
}

export default function ClientWrapper({ children }: Props) {
  const router = useRouter();
  const [hasAuth, setHasAuth] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const urlToken = url.searchParams.get("token");
      if (urlToken) {
        localStorage.setItem("authToken", urlToken);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }
    } catch {}

    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        setHasAuth(true);
        // Check if user has selected a module
        const module = localStorage.getItem("selectedModule");
        if (module) {
          setSelectedModule(module);
        }
      } else {
        // No token found, redirect to Laravel server
        setIsRedirecting(true);
        window.location.href = "http://10.0.0.253:8000";
        return;
      }
    } catch {
      // Error accessing localStorage, redirect to Laravel server
      setIsRedirecting(true);
      window.location.href = "http://10.0.0.253:8000";
      return;
    }
  }, []);

  // Show loading while checking auth or redirecting
  // if (hasAuth === null || isRedirecting) {
  //   return (
  //     <div className="w-full h-screen flex items-center justify-center text-sm text-gray-600">
  //       Checking authentication...
  //     </div>
  //   );
  // }

  // if (!hasAuth) {
  //   // This case should rarely happen now since we redirect immediately
  //   return (
  //     <div className="w-full h-screen flex items-center justify-center text-sm text-gray-600">
  //       Not authenticated. Redirecting...
  //     </div>
  //   );
  // }

  // If authenticated but no module selected, show module selector
  if (hasAuth && !selectedModule) {
    return (
      <ModuleSelector
        onModuleSelect={(module) => {
          localStorage.setItem("selectedModule", module);
          setSelectedModule(module);

          // Navigate to the default URL for the selected module
          switch (module) {
            case "meeting":
              router.push("/meeting-tracker");
              break;
            case "requisitions":
              router.push("/internal-requisitions/requisition-list");
              break;
            case "powerpoint":
              router.push("http://10.0.0.253:3001");
              break;
            default:
              break;
          }
        }}
      />
    );
  }

  // ✅ FIXED: Sidebar is now stable and won't re-render with page changes
  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="flex min-h-screen h-full w-full">
          <AppSidebar />
          <main className="flex-1 min-h-screen h-full">
            <SidebarTrigger />
            <div className="px-6 w-full">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}
