"use client";
import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  ArrowBigUp,
  BookOpen,
  FileText,
  Bot,
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
    url: "http://10.0.0.253:8000",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/",
    icon: BookOpen,
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
    title: "Use AI Bot",
    url: "/use-aibot",
    icon: Bot,
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
                      target={item.url.startsWith("http") ? "_blank" : "_self"}
                      rel="noopener noreferrer"
                      className={
                        pathname === item.url
                          ? "bg-primary text-white"
                          : "text-primary"
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
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
