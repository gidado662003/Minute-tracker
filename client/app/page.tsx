"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has selected a module and redirect accordingly
    try {
      const selectedModule = localStorage.getItem("selectedModule");
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        // No auth token, user will be redirected by ClientWrapper
        return;
      }

      if (selectedModule === "meeting") {
        router.replace("/meeting-tracker");
      } else if (selectedModule === "requisitions") {
        router.replace("/internal-requisitions");
      } else {
        // No module selected, user will see module selector from ClientWrapper
        return;
      }
    } catch (error) {
      console.error("Error checking module selection:", error);
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );
}
