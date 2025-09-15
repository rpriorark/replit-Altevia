import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MessageSquare, 
  Star,
  FileText,
  Users,
  Calendar
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, change, trend, icon }: MetricCardProps) => (
  <Card data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`flex items-center text-xs ${trend === 'up' ? 'text-chart-2' : 'text-destructive'}`}>
        {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
        {change} vs. mes anterior
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  // todo: remove mock functionality
  const metrics = [
    {
      title: "Visibilidad Online",
      value: "85%",
      change: "+12%",
      trend: "up" as const,
      icon: <Eye className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Reseñas Promedio",
      value: "4.6★",
      change: "+0.3",
      trend: "up" as const,
      icon: <Star className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Contenido Generado",
      value: "23",
      change: "+8",
      trend: "up" as const,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />
    },
    {
      title: "Engagement",
      value: "2.4k",
      change: "+15%",
      trend: "up" as const,
      icon: <Users className="h-4 w-4 text-muted-foreground" />
    }
  ];

  const recentReviews = [
    {
      id: 1,
      author: "María González",
      rating: 5,
      text: "Excelente servicio, muy recomendado. El equipo es muy profesional.",
      date: "Hace 2 horas",
      platform: "Google"
    },
    {
      id: 2,
      author: "Carlos Mendoza",
      rating: 4,
      text: "Muy buena atención y rapidez en la respuesta.",
      date: "Hace 1 día",
      platform: "TripAdvisor"
    },
    {
      id: 3,
      author: "Ana López",
      rating: 5,
      text: "Superó mis expectativas. Definitivamente volveré.",
      date: "Hace 2 días",
      platform: "Google"
    }
  ];

  const contentProgress = [
    { type: "Artículos de Blog", used: 8, total: 30, percentage: 27 },
    { type: "Descripciones de Productos", used: 15, total: 30, percentage: 50 },
    { type: "Posts para Redes", used: 12, total: 30, percentage: 40 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visión general de tu visibilidad digital
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-export">
            Exportar Reporte
          </Button>
          <Button data-testid="button-generate-content">
            Generar Contenido
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Reviews */}
        <Card className="lg:col-span-2" data-testid="card-recent-reviews">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Reseñas Recientes
                </CardTitle>
                <CardDescription>Las últimas opiniones de tus clientes</CardDescription>
              </div>
              <Button variant="outline" size="sm" data-testid="button-view-all-reviews">
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentReviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.author}</span>
                    <Badge variant="secondary" className="text-xs">
                      {review.platform}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{review.date}</span>
                  <Button variant="ghost" size="sm" data-testid={`button-respond-${review.id}`}>
                    Responder con IA
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content Usage */}
        <Card data-testid="card-content-usage">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uso de Contenido
            </CardTitle>
            <CardDescription>Plan Pro - Mes actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {contentProgress.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.type}</span>
                  <span className="text-muted-foreground">{item.used}/{item.total}</span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
            <Button variant="outline" className="w-full" data-testid="button-upgrade-plan">
              Actualizar Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card data-testid="card-quick-actions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>Tareas sugeridas para mejorar tu visibilidad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" data-testid="button-create-article">
              <FileText className="h-5 w-5" />
              Crear Artículo SEO
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" data-testid="button-request-reviews">
              <MessageSquare className="h-5 w-5" />
              Solicitar Reseñas
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" data-testid="button-analyze-competitors">
              <TrendingUp className="h-5 w-5" />
              Analizar Competencia
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" data-testid="button-view-suggestions">
              <Eye className="h-5 w-5" />
              Ver Sugerencias IA
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;