import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Users, 
  Star,
  Calendar,
  Download,
  Filter,
  Search,
  Globe,
  Smartphone,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

interface MetricTrend {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
}

interface ChartDataPoint {
  month: string;
  visibilidad: number;
  reseñas: number;
  contenido: number;
  engagement: number;
}

interface TopKeyword {
  keyword: string;
  ranking: number;
  volume: number;
  difficulty: number;
  change: number;
}

interface CompetitorData {
  name: string;
  ranking: number;
  reseñas: number;
  rating: number;
  gap: string;
}

const Analytics = () => {
  // todo: remove mock functionality
  const [timeRange, setTimeRange] = useState("3months");
  const [selectedMetric, setSelectedMetric] = useState("all");

  const metrics: MetricTrend[] = [
    {
      label: "Visibilidad Online",
      value: "89%",
      change: 12.5,
      trend: "up",
      icon: <Eye className="h-4 w-4" />
    },
    {
      label: "Tráfico Orgánico",
      value: "24.8K",
      change: 18.2,
      trend: "up",
      icon: <Users className="h-4 w-4" />
    },
    {
      label: "Rating Promedio",
      value: "4.7★",
      change: 0.3,
      trend: "up",
      icon: <Star className="h-4 w-4" />
    },
    {
      label: "Tiempo en Sitio",
      value: "3:24",
      change: -5.1,
      trend: "down",
      icon: <Clock className="h-4 w-4" />
    },
    {
      label: "Conversión",
      value: "8.4%",
      change: 22.1,
      trend: "up",
      icon: <Target className="h-4 w-4" />
    },
    {
      label: "CTR Promedio",
      value: "12.3%",
      change: 7.8,
      trend: "up",
      icon: <BarChart3 className="h-4 w-4" />
    }
  ];

  const chartData: ChartDataPoint[] = [
    { month: "Ene", visibilidad: 65, reseñas: 4.2, contenido: 12, engagement: 580 },
    { month: "Feb", visibilidad: 70, reseñas: 4.3, contenido: 18, engagement: 720 },
    { month: "Mar", visibilidad: 75, reseñas: 4.4, contenido: 25, engagement: 890 },
    { month: "Abr", visibilidad: 80, reseñas: 4.5, contenido: 32, engagement: 1150 },
    { month: "May", visibilidad: 85, reseñas: 4.6, contenido: 28, engagement: 1380 },
    { month: "Jun", visibilidad: 89, reseñas: 4.7, contenido: 35, engagement: 1620 }
  ];

  const topKeywords: TopKeyword[] = [
    { keyword: "marketing digital sevilla", ranking: 3, volume: 1200, difficulty: 65, change: 2 },
    { keyword: "agencia seo local", ranking: 5, volume: 890, difficulty: 58, change: 1 },
    { keyword: "consultor marketing online", ranking: 8, volume: 650, difficulty: 72, change: -1 },
    { keyword: "posicionamiento web", ranking: 12, volume: 2100, difficulty: 80, change: 3 },
    { keyword: "gestión redes sociales", ranking: 7, volume: 760, difficulty: 55, change: 0 },
    { keyword: "reputación online empresas", ranking: 4, volume: 430, difficulty: 48, change: 4 }
  ];

  const competitors: CompetitorData[] = [
    { name: "MarketingPro", ranking: 2, reseñas: 127, rating: 4.8, gap: "+2 posiciones" },
    { name: "DigitalBoost", ranking: 6, reseñas: 89, rating: 4.4, gap: "Mismo nivel" },
    { name: "SEO Masters", ranking: 9, reseñas: 156, rating: 4.6, gap: "-3 posiciones" },
    { name: "LocalMarketing", ranking: 11, reseñas: 92, rating: 4.2, gap: "-5 posiciones" }
  ];

  const deviceData = [
    { device: "Desktop", percentage: 52, users: 1240 },
    { device: "Mobile", percentage: 41, users: 980 },
    { device: "Tablet", percentage: 7, users: 168 }
  ];

  const trafficSources = [
    { source: "Búsqueda Orgánica", percentage: 45, visitors: 11250 },
    { source: "Directo", percentage: 28, visitors: 7000 },
    { source: "Redes Sociales", percentage: 15, visitors: 3750 },
    { source: "Referencias", percentage: 8, visitors: 2000 },
    { source: "Email", percentage: 4, visitors: 1000 }
  ];

  const MetricCard = ({ metric }: { metric: MetricTrend }) => (
    <Card className="hover-elevate" data-testid={`card-metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
        {metric.icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <div className={`flex items-center text-xs ${metric.trend === 'up' ? 'text-chart-2' : 'text-destructive'}`}>
          {metric.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          {Math.abs(metric.change)}% vs. período anterior
        </div>
      </CardContent>
    </Card>
  );

  const SimpleChart = ({ data, type }: { data: ChartDataPoint[], type: string }) => {
    const maxValue = Math.max(...data.map(d => {
      switch(type) {
        case 'visibilidad': return d.visibilidad;
        case 'reseñas': return d.reseñas * 20; // Escalar para visualización
        case 'contenido': return d.contenido;
        case 'engagement': return d.engagement / 20; // Escalar para visualización
        default: return d.visibilidad;
      }
    }));

    return (
      <div className="h-64 flex items-end justify-between gap-2 p-4">
        {data.map((point, index) => {
          let value;
          switch(type) {
            case 'visibilidad': value = point.visibilidad; break;
            case 'reseñas': value = point.reseñas * 20; break;
            case 'contenido': value = point.contenido; break;
            case 'engagement': value = point.engagement / 20; break;
            default: value = point.visibilidad;
          }
          const height = (value / maxValue) * 100;
          
          return (
            <div key={index} className="flex flex-col items-center gap-2 flex-1">
              <div 
                className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t-sm transition-all hover:from-primary/80 hover:to-primary/40"
                style={{ height: `${height}%`, minHeight: '8px' }}
              />
              <span className="text-xs text-muted-foreground">{point.month}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Avanzados
          </h1>
          <p className="text-muted-foreground">
            Análisis profundo de tu visibilidad digital y rendimiento
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40" data-testid="select-time-range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Último mes</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" data-testid="button-export-report">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Gráficos y Análisis */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Gráfico Principal */}
        <Card className="lg:col-span-2" data-testid="card-main-chart">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tendencias de Rendimiento</CardTitle>
                <CardDescription>Evolución de métricas clave en el tiempo</CardDescription>
              </div>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las métricas</SelectItem>
                  <SelectItem value="visibilidad">Visibilidad</SelectItem>
                  <SelectItem value="reseñas">Reseñas</SelectItem>
                  <SelectItem value="contenido">Contenido</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <SimpleChart data={chartData} type={selectedMetric === 'all' ? 'visibilidad' : selectedMetric} />
          </CardContent>
        </Card>

        {/* Dispositivos */}
        <Card data-testid="card-device-breakdown">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Dispositivos
            </CardTitle>
            <CardDescription>Distribución de tráfico por dispositivo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deviceData.map((device, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{device.device}</span>
                  <span className="text-muted-foreground">{device.percentage}%</span>
                </div>
                <Progress value={device.percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">{device.users.toLocaleString()} usuarios</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Análisis Detallado */}
      <Tabs defaultValue="keywords" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keywords">Palabras Clave</TabsTrigger>
          <TabsTrigger value="competitors">Competidores</TabsTrigger>
          <TabsTrigger value="traffic">Tráfico</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="space-y-4">
          <Card data-testid="card-top-keywords">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Top Keywords
              </CardTitle>
              <CardDescription>Palabras clave con mejor rendimiento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topKeywords.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                    <div className="flex-1">
                      <div className="font-medium">{keyword.keyword}</div>
                      <div className="text-sm text-muted-foreground">
                        {keyword.volume.toLocaleString()} búsquedas/mes • Dificultad: {keyword.difficulty}%
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={keyword.ranking <= 5 ? "default" : "outline"}>
                        Posición #{keyword.ranking}
                      </Badge>
                      <div className={`flex items-center text-xs ${keyword.change > 0 ? 'text-chart-2' : keyword.change < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {keyword.change !== 0 && (
                          keyword.change > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {keyword.change !== 0 ? `${Math.abs(keyword.change)} pos.` : 'Sin cambios'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className="space-y-4">
          <Card data-testid="card-competitor-analysis">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Análisis de Competidores
              </CardTitle>
              <CardDescription>Comparación con competidores principales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitors.map((competitor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover-elevate">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center font-semibold">
                        {competitor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{competitor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {competitor.reseñas} reseñas • {competitor.rating}★
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">Posición #{competitor.ranking}</Badge>
                      <div className="text-sm text-muted-foreground">{competitor.gap}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4">
          <Card data-testid="card-traffic-sources">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Fuentes de Tráfico
              </CardTitle>
              <CardDescription>De dónde provienen tus visitantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {trafficSources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{source.source}</span>
                    <span className="text-muted-foreground">{source.percentage}%</span>
                  </div>
                  <Progress value={source.percentage} className="h-3" />
                  <div className="text-sm text-muted-foreground">
                    {source.visitors.toLocaleString()} visitantes este mes
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card data-testid="card-performance-insights">
              <CardHeader>
                <CardTitle>Insights de Rendimiento</CardTitle>
                <CardDescription>Análisis automático de tu performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                    <span className="font-medium text-chart-2">Oportunidad Detectada</span>
                  </div>
                  <p className="text-sm">Tu ranking para "marketing digital" ha mejorado 3 posiciones. Considera crear más contenido relacionado.</p>
                </div>
                <div className="p-3 bg-chart-3/10 border border-chart-3/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-chart-3" />
                    <span className="font-medium text-chart-3">Optimización Sugerida</span>
                  </div>
                  <p className="text-sm">El tiempo en sitio ha disminuido. Revisa la velocidad de carga y contenido de las páginas principales.</p>
                </div>
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="font-medium text-primary">Fortaleza Identificada</span>
                  </div>
                  <p className="text-sm">Excelente tasa de conversión en móvil. Tu sitio está bien optimizado para dispositivos móviles.</p>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-goals-tracking">
              <CardHeader>
                <CardTitle>Seguimiento de Objetivos</CardTitle>
                <CardDescription>Progreso hacia tus metas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Posición Top 3 en keywords principales</span>
                    <span className="text-sm text-muted-foreground">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Rating promedio 4.5+</span>
                    <span className="text-sm text-muted-foreground">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">1000+ visitantes mensuales</span>
                    <span className="text-sm text-muted-foreground">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;