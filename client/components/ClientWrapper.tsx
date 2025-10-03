"use client";

import { useState, useEffect, ReactNode } from "react";
import DepartmentSelection from "@/components/departmentSelection";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
// Using localStorage presence check only; server/API will 401 on invalid tokens

interface Props {
  children: ReactNode;
}

export default function ClientWrapper({ children }: Props) {
  const [hasDepartment, setHasDepartment] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("department");
    setHasDepartment(!!token);
  }, []);

  if (hasDepartment === null) return null; // optional loading state

  if (!hasDepartment) return <DepartmentSelection />;

  // If department exists, render full app layout
  return (
    <SidebarProvider>
      <div className="flex min-h-screen h-full w-full">
        <AppSidebar />
        <main className="flex-1 min-h-screen h-full">
          <SidebarTrigger />
          <div className="px-6 w-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
