import { 
  Home, 
  TrendingUp, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  CreditCard,
  Users,
  Lightbulb,
  Calendar,
  Shield
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
} from "@/components/ui/sidebar";
import { Link, useLocation } from "wouter";
import alteviaLogo from "@assets/generated_images/Altevia_logo_design_2c146ee7.png";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Generador SEO",
    url: "/seo-generator",
    icon: TrendingUp,
  },
  {
    title: "Calendario de Contenido",
    url: "/content-calendar",
    icon: Calendar,
  },
  {
    title: "Gestión de Reseñas",
    url: "/reviews",
    icon: MessageSquare,
  },
  {
    title: "Reputación Predictiva",
    url: "/predictive-reputation",
    icon: Shield,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Sugerencias IA",
    url: "/suggestions",
    icon: Lightbulb,
  },
];

const secondaryItems = [
  {
    title: "Plan y Facturación",
    url: "/billing",
    icon: CreditCard,
  },
  {
    title: "Equipo",
    url: "/team",
    icon: Users,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        {/* Header */}
        <SidebarGroup>
          <div className="flex items-center gap-2 px-4 py-2">
            <img src={alteviaLogo} alt="Altevia" className="h-8 w-8" />
            <span className="text-lg font-semibold">Altevia</span>
          </div>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}