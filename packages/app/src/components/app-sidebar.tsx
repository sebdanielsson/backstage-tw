import * as React from "react"
import {
  Bell,
  BookOpen,
  Blocks,
  Home,
  PlusCircle,
  Search,
} from "lucide-react"
import { Link } from "react-router-dom"

import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"
import LogoFull from "./Root/LogoFull"
import LogoIcon from "./Root/LogoIcon"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "./ui/sidebar"

const navItems = [
  {
    title: "Home",
    url: "/catalog",
    icon: Home,
  },
  {
    title: "APIs",
    url: "/api-docs",
    icon: Blocks,
  },
  {
    title: "Docs",
    url: "/docs",
    icon: BookOpen,
  },
  {
    title: "Create",
    url: "/create",
    icon: PlusCircle,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
]

function SidebarLogo() {
  const { open } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link to="/">
            {open ? (
              <div className="flex-1 overflow-hidden">
                <LogoFull />
              </div>
            ) : (
              <div className="flex aspect-square size-8 items-center justify-center">
                <LogoIcon />
              </div>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
