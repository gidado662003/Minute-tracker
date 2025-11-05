"use client";

import { useState, useEffect, ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ToastProvider } from "@/components/ui/toast";
// Using localStorage presence check only; server/API will 401 on invalid tokens

interface Props {
  children: ReactNode;
}

export default function ClientWrapper({ children }: Props) {
  const [hasAuth, setHasAuth] = useState<boolean | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

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
  if (hasAuth === null || isRedirecting) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-sm text-gray-600">
        Checking authentication...
      </div>
    );
  }

  if (!hasAuth) {
    // This case should rarely happen now since we redirect immediately
    return (
      <div className="w-full h-screen flex items-center justify-center text-sm text-gray-600">
        Not authenticated. Redirecting...
      </div>
    );
  }

  // If token exists, render full app layout
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
