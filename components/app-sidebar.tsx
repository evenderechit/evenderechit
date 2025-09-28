"use client"

import type * as React from "react"
import { Calendar, Home, Settings, Users, BarChart3, MessageSquare, Bell, HelpCircle } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "דשבורד",
      url: "/",
      icon: Home,
    },
    {
      title: "תורים",
      url: "/appointments",
      icon: Calendar,
    },
    {
      title: "לקוחות",
      url: "/users",
      icon: Users,
    },
    {
      title: "דוחות",
      url: "/analytics",
      icon: BarChart3,
    },
    {
      title: "הגדרות",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "הודעות",
      url: "/messages",
      icon: MessageSquare,
    },
    {
      title: "התראות",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "עזרה",
      url: "/help",
      icon: HelpCircle,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Calendar className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">AI Smart Queues</span>
            <span className="truncate text-xs">ניהול תורים חכם</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-2 text-xs text-muted-foreground">מערכת ניהול תורים v1.0</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
