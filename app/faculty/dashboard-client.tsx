"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  Megaphone,
  FileText,
  MessageSquare,
  Heart,
  BarChart3,
  Bell,
  Settings,
  ChevronsUpDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const facultyMenuItems = [
  { title: "Overview", url: "/faculty", icon: LayoutDashboard },
  { title: "Students", url: "/faculty/students", icon: Users },
  { title: "Alumni", url: "/faculty/alumni", icon: GraduationCap },
  { title: "Events", url: "/faculty/events", icon: Calendar },
  { title: "Announcements", url: "/faculty/announcements", icon: Megaphone },
  { title: "Posts", url: "/faculty/posts", icon: FileText },
  { title: "Messages", url: "/faculty/messages", icon: MessageSquare },
  { title: "Mentorship", url: "/faculty/mentorship", icon: Heart },
  { title: "Reports", url: "/faculty/reports", icon: BarChart3 },
  { title: "Notifications", url: "/faculty/notifications", icon: Bell },
  { title: "Settings", url: "/faculty/settings", icon: Settings },
];

export function FacultySidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* ---------- Header ---------- */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/faculty" />}
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Users className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Faculty</span>
                <span className="truncate text-xs">Panel</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ---------- Content ---------- */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {facultyMenuItems.map((item) => {
                const isActive =
                  item.url === "/faculty"
                    ? pathname === "/faculty"
                    : pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<Link href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ---------- Footer ---------- */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={pathname.startsWith("/faculty/settings")}
              render={<Link href="/faculty/settings" />}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}