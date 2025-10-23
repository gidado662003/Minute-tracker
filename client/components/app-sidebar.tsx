"use client";
import {
  Calendar,
  Home,
  Inbox,
  Settings,
  ArrowBigUp,
  BookOpen,
  FileText,
  Bot,
  Package,
  ChevronDown,
  LogOut,
  Users,
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
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

// Types for better type safety
interface MenuItemBase {
  title: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
}

interface MenuItemLink extends MenuItemBase {
  url: string;
  external?: boolean;
}

interface MenuItemGroup extends MenuItemBase {
  label: string;
  children: MenuItemLink[];
}

type MenuItem = MenuItemLink | MenuItemGroup;

const isMenuItemGroup = (item: MenuItem): item is MenuItemGroup => {
  return "children" in item;
};

const menuItems: MenuItem[] = [
  {
    title: "Home",
    url: "http://10.0.0.253:8000",
    icon: Home,
    external: true,
  },
  {
    label: "Meeting",
    title: "Meeting",
    icon: Calendar,
    children: [
      {
        title: "Dashboard",
        url: "/",
        icon: BookOpen,
      },
      {
        title: "Create Meeting",
        url: "/create-meeting",
        icon: Inbox,
        badge: "New",
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
        title: "Actions",
        url: "/all-actions",
        icon: ArrowBigUp,
        badge: 3,
      },
    ],
  },
  {
    label: "Internal Requisitions",
    title: "Internal Requisitions",
    icon: Package,
    children: [
      {
        title: "Dashboard",
        url: "/internal-requisitions/dashboard",
        icon: BookOpen,
      },
      {
        title: "Create Internal Requisition",
        url: "/internal-requisitions/create-internal-requisition",
        icon: Inbox,
      },
      {
        title: "Requisition List",
        url: "/internal-requisitions/requisition-list",
        icon: FileText,
      },
      {
        title: "Actions",
        url: "/internal-requisitions/all-actions",
        icon: ArrowBigUp,
      },
    ],
  },
  {
    title: "Team",
    url: "/team",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

interface MenuLinkProps {
  item: MenuItemLink;
  isActive: boolean;
  level?: number;
}

const MenuLink = ({ item, isActive, level = 0 }: MenuLinkProps) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild isActive={isActive}>
      <a
        href={item.url}
        target={item.external ? "_blank" : "_self"}
        rel={item.external ? "noopener noreferrer" : undefined}
        className={cn(
          "flex items-center gap-3 transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
          level > 0 && "ml-2 text-sm",
          isActive && "bg-primary text-primary-foreground font-medium shadow-sm"
        )}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1 truncate">{item.title}</span>
        {item.badge && (
          <span
            className={cn(
              "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium",
              isActive
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary/10 text-primary"
            )}
          >
            {item.badge}
          </span>
        )}
      </a>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

interface MenuGroupProps {
  item: MenuItemGroup;
  openGroups: Record<string, boolean>;
  toggleGroup: (label: string) => void;
  pathname: string;
}

const MenuGroup = ({
  item,
  openGroups,
  toggleGroup,
  pathname,
}: MenuGroupProps) => {
  const isActive = item.children.some((child) => pathname === child.url);
  const isOpen = openGroups[item.label] ?? isActive;

  return (
    <div key={item.label}>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => toggleGroup(item.label)}
          isActive={isActive}
          className={cn(
            "flex items-center gap-3 transition-all duration-200",
            isActive &&
              "bg-primary/10 text-primary font-medium border-l-2 border-primary"
          )}
        >
          <item.icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 truncate">{item.label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 flex-shrink-0 transition-transform duration-200",
              isOpen ? "rotate-180" : "rotate-0"
            )}
          />
        </SidebarMenuButton>
      </SidebarMenuItem>

      {isOpen && (
        <div className="ml-4 border-l border-border/40">
          <SidebarMenu>
            {item.children.map((child) => (
              <MenuLink
                key={child.url}
                item={child}
                isActive={pathname === child.url}
                level={1}
              />
            ))}
          </SidebarMenu>
        </div>
      )}
    </div>
  );
};

export function AppSidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  // Initialize open groups based on active children
  const initializedOpenGroups = useMemo(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (isMenuItemGroup(item)) {
        const hasActiveChild = item.children.some(
          (child) => pathname === child.url
        );
        if (openGroups[item.label] === undefined && hasActiveChild) {
          initial[item.label] = true;
        }
      }
    });
    return { ...initial, ...openGroups };
  }, [pathname, openGroups]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("department");
    window.location.reload();
  };

  return (
    <Sidebar className="border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (isMenuItemGroup(item)) {
                  return (
                    <MenuGroup
                      key={item.label}
                      item={item}
                      openGroups={initializedOpenGroups}
                      toggleGroup={toggleGroup}
                      pathname={pathname}
                    />
                  );
                } else {
                  return (
                    <MenuLink
                      key={item.url}
                      item={item}
                      isActive={pathname === item.url}
                    />
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground transition-colors"
          size="sm"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
