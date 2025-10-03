"use client";
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  ArrowBigUp,
  FileText,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Create Meeting",
    url: "/create-meeting",
    icon: Inbox,
  },
  {
    title: "Minutes List",
    url: "/minutes-list",
    icon: FileText,
  },
  {
    title: " Actions",
    url: "/all-actions",
    icon: ArrowBigUp,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const handleLogout = () => {
    localStorage.removeItem("department");
    window.location.reload();
  };
  return (
    <Sidebar className="">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className={
                        pathname === item.url
                          ? "bg-primary text-white py-4 hover:bg-primary/30 duration-300"
                          : "text-primary duration-300"
                      }
                    >
                      <item.icon />
                      <span
                        className={
                          pathname === item.url ? "font-bold" : "duration-300"
                        }
                      >
                        {item.title}
                      </span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={handleLogout} className="cursor-pointer">
          Log out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
