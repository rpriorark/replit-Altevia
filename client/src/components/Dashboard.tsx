import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MessageSquare, 
  Star,
  FileText,
  Users,
  Calendar,
  Shield,
  Lightbulb,
  AlertTriangle,
  Activity,
  BarChart3,
  ChevronRight,
  RefreshCw,
  Download,
  Plus,
  Clock,
  CheckCircle,
  ArrowUpRight
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  isLoading?: boolean;
}

interface QuickAccessCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  isLoading?: boolean;
}

interface ActivityItem {
  id: string;
  type: 'review' | 'content' | 'alert' | 'suggestion';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const MetricCard = ({ title, value, change, trend, icon, isLoading }: MetricCardProps) => (
  <Card data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`} className="hover-elevate">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          <div className={`flex items-center text-xs ${
            trend === 'up' ? 'text-chart-2' : 
            trend === 'down' ? 'text-destructive' : 
            'text-muted-foreground'
          }`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
             trend === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : 
             <Activity className="h-4 w-4 mr-1" />}
            {change} vs. mes anterior
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

const QuickAccessCard = ({ title, description, icon, href, badge, isLoading }: QuickAccessCardProps) => (
  <Card className="hover-elevate group">
    <Link href={href}>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                {icon}
              </div>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {description}
            </p>
            <div className="flex items-center text-xs text-primary">
              Abrir módulo
              <ArrowUpRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </>
        )}
      </CardContent>
    </Link>
  </Card>
);

const Dashboard = () => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(""); // Will be set when locations load

  // Get available locations
  const { data: locations = [], isLoading: isLoadingLocations, error: locationsError } = useQuery({
    queryKey: ['/api/locations'],
    staleTime: 0
  });

  // Auto-select first available location
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id);
    }
  }, [locations, selectedLocationId]);

  // Get reputation score for selected location
  const { data: reputationData, isLoading: isLoadingReputation, error: reputationError } = useQuery({
    queryKey: [`/api/reputation/score?locationId=${selectedLocationId}`],
    enabled: !!selectedLocationId,
    staleTime: 0
  });

  // Get reputation alerts for selected location
  const { data: alertsData, isLoading: isLoadingAlerts, error: alertsError } = useQuery({
    queryKey: [`/api/reputation/alerts?locationId=${selectedLocationId}&acknowledged=false&limit=10`],
    enabled: !!selectedLocationId,
    staleTime: 0
  });

  // Get content calendar posts for current month
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const { data: contentData, isLoading: isLoadingContent, error: contentError } = useQuery({
    queryKey: [`/api/content-calendar/posts/${selectedLocationId}?month=${currentMonth}&year=${currentYear}`],
    enabled: !!selectedLocationId,
    staleTime: 0
  });

  // Calculate metrics from real data
  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
  const currentReputation = reputationData?.score || 0;
  const previousReputation = reputationData?.previousScore || currentReputation;
  const reputationChange = currentReputation - previousReputation;
  const activeAlerts = alertsData?.total || 0;
  const contentCount = contentData?.length || 0;
  const scheduledContent = contentData?.filter(post => post.status === 'approved').length || 0;
  
  const metrics = [
    {
      title: "Score de Reputación",
      value: isLoadingReputation ? "--" : `${currentReputation}%`,
      change: isLoadingReputation ? "--" : `${reputationChange >= 0 ? '+' : ''}${reputationChange}%`,
      trend: (reputationChange > 0 ? "up" : reputationChange < 0 ? "down" : "stable") as const,
      icon: <Shield className="h-4 w-4 text-muted-foreground" />,
      isLoading: isLoadingReputation
    },
    {
      title: "Rating Promedio",
      value: isLoadingLocations ? "--" : `${selectedLocation?.averageRating || '4.0'}★`,
      change: "+0.2", // Mock change for now
      trend: "up" as const,
      icon: <Star className="h-4 w-4 text-muted-foreground" />,
      isLoading: isLoadingLocations
    },
    {
      title: "Contenido Programado",
      value: isLoadingContent ? "--" : scheduledContent.toString(),
      change: `+${Math.floor(scheduledContent * 0.3)}`,
      trend: "up" as const,
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      isLoading: isLoadingContent
    },
    {
      title: "Alertas Activas",
      value: isLoadingAlerts ? "--" : activeAlerts.toString(),
      change: activeAlerts > 0 ? `+${activeAlerts}` : "Sin cambios",
      trend: (activeAlerts > 0 ? "down" : "stable") as const,
      icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
      isLoading: isLoadingAlerts
    }
  ];

  // Quick access cards configuration
  const quickAccessCards = [
    {
      title: "Generador Legal de Respuestas",
      description: "Respuestas IA seguras para reseñas complejas con modo legal",
      icon: <Shield className="h-5 w-5 text-primary" />,
      href: "/reviews",
      badge: activeAlerts > 0 ? `${activeAlerts} alertas` : undefined
    },
    {
      title: "Calendario de Contenido",
      description: "Planifica y programa contenido para todas tus plataformas",
      icon: <Calendar className="h-5 w-5 text-primary" />,
      href: "/content-calendar",
      badge: `${scheduledContent} programados`
    },
    {
      title: "Reputación Predictiva",
      description: "Análisis predictivo y alertas tempranas de reputación",
      icon: <BarChart3 className="h-5 w-5 text-primary" />,
      href: "/predictive-reputation",
      badge: `${currentReputation}% score`
    },
    {
      title: "Sugerencias IA",
      description: "Recomendaciones inteligentes para mejorar tu presencia",
      icon: <Lightbulb className="h-5 w-5 text-primary" />,
      href: "/suggestions",
      badge: "3 nuevas"
    }
  ];

  // Generate activity feed from real data
  const activityItems: ActivityItem[] = [
    ...(alertsData?.alerts?.slice(0, 3).map(alert => ({
      id: alert.id,
      type: 'alert' as const,
      title: 'Nueva alerta de reputación',
      description: alert.message,
      timestamp: new Date(alert.createdAt).toLocaleString('es-ES'),
      icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      severity: alert.severity as 'low' | 'medium' | 'high' | 'critical'
    })) || []),
    ...(contentData?.slice(0, 2).map(post => ({
      id: post.id,
      type: 'content' as const,
      title: 'Contenido programado',
      description: `${post.title} - ${post.platform}`,
      timestamp: new Date(post.scheduledDate).toLocaleString('es-ES'),
      icon: <Calendar className="h-4 w-4 text-blue-500" />
    })) || [])
  ];

  const isAnyDataLoading = isLoadingLocations || isLoadingReputation || isLoadingAlerts || isLoadingContent;
  const hasError = locationsError || reputationError || alertsError || contentError;
  
  // Log errors for debugging
  if (locationsError) console.error('Locations error:', locationsError);
  if (reputationError) console.error('Reputation error:', reputationError);
  if (alertsError) console.error('Alerts error:', alertsError);
  if (contentError) console.error('Content error:', contentError);

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {hasError && (
        <Alert className="mb-6" data-testid="alert-error">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar algunos datos. Revisa la consola para más detalles.
            {!selectedLocationId && " Selecciona una ubicación para ver datos específicos."}
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {selectedLocation ? 
              `${selectedLocation.name} - ${selectedLocation.city}, ${selectedLocation.state}` :
              "Visión general de tu visibilidad digital"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export" disabled={isAnyDataLoading}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button data-testid="button-generate-content" disabled={isAnyDataLoading}>
            <Plus className="h-4 w-4 mr-2" />
            Generar Contenido
          </Button>
        </div>
      </div>

      {/* Location Selector */}
      {locations.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Ubicación:</span>
              <div className="flex gap-2">
                {locations.map((location) => (
                  <Button
                    key={location.id}
                    variant={selectedLocationId === location.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLocationId(location.id)}
                    data-testid={`button-location-${location.id}`}
                  >
                    {location.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Quick Access Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Módulos Principales</h2>
          <Button variant="ghost" size="sm" data-testid="button-refresh-data">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessCards.map((card, index) => (
            <QuickAccessCard
              key={index}
              {...card}
              isLoading={isAnyDataLoading}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="lg:col-span-2" data-testid="card-activity-feed">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Actividad Reciente
                </CardTitle>
                <CardDescription>Últimas acciones y alertas de todos los módulos</CardDescription>
              </div>
              <Link href="/analytics">
                <Button variant="outline" size="sm" data-testid="button-view-all-activity">
                  Ver Todo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAnyDataLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-6 w-6 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : activityItems.length > 0 ? (
              activityItems.map((item, index) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg hover-elevate">
                  <div className="mt-0.5">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {item.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.timestamp}
                        </p>
                      </div>
                      {item.severity && (
                        <Badge 
                          variant={item.severity === 'high' || item.severity === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs ml-2"
                        >
                          {item.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Overview */}
        <Card data-testid="card-status-overview">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estado General
            </CardTitle>
            <CardDescription>Resumen del estado actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Reputation Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reputación</span>
                {isLoadingReputation ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <Badge variant={currentReputation >= 80 ? 'default' : currentReputation >= 60 ? 'secondary' : 'destructive'}>
                    {currentReputation}%
                  </Badge>
                )}
              </div>
              {!isLoadingReputation && (
                <Progress value={currentReputation} className="h-2" />
              )}
            </div>

            <Separator />

            {/* Content Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Contenido Programado</span>
                {isLoadingContent ? (
                  <Skeleton className="h-4 w-8" />
                ) : (
                  <span className="text-sm font-medium">{scheduledContent}</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Este mes: {contentCount} posts totales
              </div>
            </div>

            <Separator />

            {/* Alerts Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Alertas Activas</span>
                {isLoadingAlerts ? (
                  <Skeleton className="h-4 w-8" />
                ) : (
                  <Badge variant={activeAlerts > 0 ? 'destructive' : 'default'}>
                    {activeAlerts}
                  </Badge>
                )}
              </div>
              {activeAlerts > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Tienes {activeAlerts} alerta{activeAlerts > 1 ? 's' : ''} que requiere{activeAlerts > 1 ? 'n' : ''} atención
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Acciones Rápidas</span>
              <div className="space-y-2">
                <Link href="/reviews">
                  <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="button-quick-reviews">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Gestionar Reseñas
                  </Button>
                </Link>
                <Link href="/seo-generator">
                  <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="button-quick-seo">
                    <FileText className="h-4 w-4 mr-2" />
                    Generar Contenido SEO
                  </Button>
                </Link>
                <Link href="/content-calendar">
                  <Button variant="ghost" size="sm" className="w-full justify-start" data-testid="button-quick-calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    Programar Contenido
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;