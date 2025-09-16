import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";

// Pages
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import SEOGenerator from "@/components/SEOGenerator";
import ContentCalendar from "@/components/ContentCalendar";
import { ReviewManager } from "@/components/ReviewManager";
import { MultiLocationDashboard } from "@/components/MultiLocationDashboard";
import Analytics from "@/components/Analytics";
import AISuggestions from "@/components/AISuggestions";
import Billing from "@/components/Billing";
import Team from "@/components/Team";
import Settings from "@/components/Settings";
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
      
      <Route path="/content-calendar">
        <DashboardLayout>
          <ContentCalendar />
        </DashboardLayout>
      </Route>
      
      <Route path="/reviews">
        <DashboardLayout>
          <ReviewManager />
        </DashboardLayout>
      </Route>
      
      <Route path="/locations">
        <DashboardLayout>
          <MultiLocationDashboard />
        </DashboardLayout>
      </Route>
      
      <Route path="/analytics">
        <DashboardLayout>
          <Analytics />
        </DashboardLayout>
      </Route>
      
      <Route path="/suggestions">
        <DashboardLayout>
          <AISuggestions />
        </DashboardLayout>
      </Route>
      
      <Route path="/billing">
        <DashboardLayout>
          <Billing />
        </DashboardLayout>
      </Route>
      
      <Route path="/team">
        <DashboardLayout>
          <Team />
        </DashboardLayout>
      </Route>
      
      <Route path="/settings">
        <DashboardLayout>
          <Settings />
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
      <SidebarProvider style={sidebarStyle as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <Router />
        </div>
      </SidebarProvider>
      <Toaster />
    </QueryClientProvider>
  );
}