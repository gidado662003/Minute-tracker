"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Package, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface ModuleSelectorProps {
  onModuleSelect: (module: string) => void;
}

export function ModuleSelector({ onModuleSelect }: ModuleSelectorProps) {
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("selectedModule");
    window.location.reload();
  };
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Syscodes Tools
          </h1>
          <p className="text-gray-600">Choose the tool you want to work with</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Meeting Tracker Module */}
          <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-blue-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-900">
                Meeting Tracker
              </CardTitle>
              <CardDescription>
                Create, manage, and track meeting minutes with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => onModuleSelect("meeting")}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Select Meeting Tracker
              </Button>
            </CardContent>
          </Card>

          {/* Internal Requisitions Module */}
          <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-green-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-xl text-green-900">
                Payment Request
              </CardTitle>
              <CardDescription>
                Manage payment requests, approvals, and procurement processes
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => onModuleSelect("requisitions")}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Select Internal Requisitions
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 hover:border-pink-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-pink-600" />
              </div>
              <CardTitle className="text-xl text-pink-900">
                Poweri Point
              </CardTitle>
              <CardDescription>Access and Create all Slides</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                // onClick={() => onModuleSelect("requisitions")}
                onClick={() => router.push("http//10.0.0.253:3001")}
                className="w-full bg-pink-600 hover:bg-pink-700"
                size="lg"
              >
                Select Internal Requisitions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Logout Option */}
        <div className="text-center">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-gray-600 hover:text-gray-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Go Back to ERP
          </Button>
        </div>
      </div>
    </div>
  );
}
