"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"

const pathNames: Record<string, string> = {
  "/dashboard": "דשבורד",
  "/appointments": "ניהול תורים",
  "/users": "ניהול לקוחות",
  "/settings": "הגדרות",
  "/analytics": "דוחות ואנליטיקה",
  "/upgrade": "שדרוג חבילה",
  "/messages": "הודעות",
  "/notifications": "התראות",
  "/help": "עזרה ותמיכה",
}

export function Header() {
  const pathname = usePathname()
  const currentPageName = pathNames[pathname] || "דף לא ידוע"

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="/dashboard">בית</BreadcrumbLink>
          </BreadcrumbItem>
          {pathname !== "/dashboard" && (
            <>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentPageName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
