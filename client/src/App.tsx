import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";

// Pages
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import SEOGenerator from "@/components/SEOGenerator";
import ReviewsManager from "@/components/ReviewsManager";
import NotFound from "@/pages/not-found";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <ThemeToggle />
      </header>
      <main className="flex-1 overflow-hidden p-6">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Landing Page */}
      <Route path="/" component={LandingPage} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      
      <Route path="/seo-generator">
        <DashboardLayout>
          <SEOGenerator />
        </DashboardLayout>
      </Route>
      
      <Route path="/reviews">
        <DashboardLayout>
          <ReviewsManager />
        </DashboardLayout>
      </Route>
      
      <Route path="/analytics">
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Analytics</h1>
            <p className="text-muted-foreground">Panel de métricas detalladas (próximamente)</p>
          </div>
        </DashboardLayout>
      </Route>
      
      <Route path="/suggestions">
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Sugerencias IA</h1>
            <p className="text-muted-foreground">Recomendaciones inteligentes (próximamente)</p>
          </div>
        </DashboardLayout>
      </Route>
      
      <Route path="/billing">
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Plan y Facturación</h1>
            <p className="text-muted-foreground">Gestión de suscripción (próximamente)</p>
          </div>
        </DashboardLayout>
      </Route>
      
      <Route path="/team">
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Equipo</h1>
            <p className="text-muted-foreground">Gestión de usuarios (próximamente)</p>
          </div>
        </DashboardLayout>
      </Route>
      
      <Route path="/settings">
        <DashboardLayout>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Configuración</h1>
            <p className="text-muted-foreground">Ajustes de la aplicación (próximamente)</p>
          </div>
        </DashboardLayout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  // Configuración del sidebar
  const sidebarStyle = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <Router />
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}