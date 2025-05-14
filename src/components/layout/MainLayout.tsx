
import React, { useState } from "react";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ListTodo, Calendar, FolderKanban, BrainCircuit } from "lucide-react";
import { ProfileButton } from "@/components/ui/profile-button";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className={collapsed ? "w-20" : "w-64"} collapsible="icon">
          <div className="h-16 flex items-center justify-between px-4">
            <div className={`flex items-center ${collapsed ? 'justify-center w-full' : ''}`}>
              <div className="rounded-md w-10 h-10 bg-gradient-to-r from-momentum-purple to-momentum-pink flex items-center justify-center text-white font-bold text-xl">
                MF
              </div>
              {!collapsed && (
                <span className="text-xl font-bold ml-2 gradient-text">Momentum Flow</span>
              )}
            </div>
            <SidebarTrigger onClick={() => setCollapsed(!collapsed)} />
          </div>
          
          <SidebarContent>
            <SidebarMenu>
              <NavItem icon={<LayoutDashboard size={20} />} to="/" text="Dashboard" collapsed={collapsed} />
              <NavItem icon={<ListTodo size={20} />} to="/tasks" text="Daily Tasks" collapsed={collapsed} />
              <NavItem icon={<Calendar size={20} />} to="/weekly" text="Weekly Tracker" collapsed={collapsed} />
              <NavItem icon={<Calendar size={20} />} to="/monthly" text="Monthly Tracker" collapsed={collapsed} />
              <NavItem icon={<FolderKanban size={20} />} to="/projects" text="Projects" collapsed={collapsed} />
              <NavItem icon={<BrainCircuit size={20} />} to="/second-brain" text="Second Brain" collapsed={collapsed} />
            </SidebarMenu>
          </SidebarContent>
          
          {!collapsed && (
            <div className="mt-auto p-4 border-t">
              <ProfileButton />
            </div>
          )}
        </Sidebar>

        <main className="flex-1 overflow-auto light-gradient-bg">
          <div className="container py-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

type NavItemProps = {
  icon: React.ReactNode;
  to: string;
  text: string;
  collapsed: boolean;
};

function NavItem({ icon, to, text, collapsed }: NavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <NavLink 
          to={to} 
          end
          className={({ isActive }) => `
            flex items-center gap-3 px-4 py-3 rounded-md transition-colors
            ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          {icon}
          {!collapsed && <span>{text}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
