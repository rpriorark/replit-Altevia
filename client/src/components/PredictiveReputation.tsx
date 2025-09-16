import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Activity,
  BarChart3,
  RefreshCw,
  Download,
  Star,
  MessageSquare,
  Users,
  Calendar,
  Zap,
  Target,
  Brain,
  Lightbulb,
  Bell,
  BellOff,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Info
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Slider } from "@/components/ui/slider";
import { ReputationAlertType, ReputationAlertSeverity } from "@shared/schema";

// Types based on schema
interface ReputationScore {
  id: string;
  locationId: string;
  score: number;
  components: {
    rating: number;
    volume: number;
    sentiment: number;
    recency: number;
    response: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  previousScore?: number;
  calculatedAt: string;
}

interface ReputationAlert {
  id: string;
  locationId: string;
  alertType: ReputationAlertType;
  severity: ReputationAlertSeverity;
  score?: number;
  reasonCode: string;
  message: string;
  metadata?: any;
  acknowledged: boolean;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  createdAt: string;
}

interface Location {
  id: string;
  name: string;
  businessName: string;
  city: string;
  state: string;
  averageRating?: number;
  totalReviews?: number;
}

interface ReputationTrend {
  date: string;
  score: number;
  components: {
    rating: number;
    volume: number;
    sentiment: number;
    recency: number;
    response: number;
  };
}

interface PatternInsight {
  type: 'opportunity' | 'risk' | 'trend' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
  actionable: boolean;
  suggestedAction?: string;
}

const COLORS = {
  good: '#10B981',
  warning: '#F59E0B', 
  danger: '#EF4444',
  neutral: '#6B7280'
};

const COMPONENT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function PredictiveReputation() {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '6m'>('30d');
  const [alertFilter, setAlertFilter] = useState<string>("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [thresholdValue, setThresholdValue] = useState<number>(70);
  const [showThresholdSettings, setShowThresholdSettings] = useState(false);

  const { toast } = useToast();

  // Get available locations
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['/api/locations']
  }) as { data: Location[], isLoading: boolean };

  // Initialize selectedLocation with first available location
  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0].id);
    }
  }, [locations, selectedLocation]);

  // Get current reputation score
  const { data: currentScore, isLoading: isLoadingScore } = useQuery({
    queryKey: ['/api/reputation/score', selectedLocation],
    enabled: !!selectedLocation
  }) as { data: ReputationScore | undefined, isLoading: boolean };

  // Get reputation trends
  const windowDays = timeRange === '30d' ? '30' : timeRange === '90d' ? '90' : '180';
  const { data: trends = [], isLoading: isLoadingTrends } = useQuery({
    queryKey: ['/api/reputation/trends', selectedLocation, windowDays],
    enabled: !!selectedLocation
  }) as { data: ReputationTrend[], isLoading: boolean };

  // Get reputation alerts
  const alertParams = alertFilter === 'all' ? 'all' : alertFilter === 'unacknowledged' ? 'unacknowledged' : alertFilter;
  const { data: alerts = [], isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['/api/reputation/alerts', selectedLocation, alertParams],
    enabled: !!selectedLocation
  }) as { data: ReputationAlert[], isLoading: boolean };

  // Get threshold for current location
  const { data: threshold } = useQuery({
    queryKey: ['/api/reputation/thresholds', selectedLocation],
    enabled: !!selectedLocation,
    select: (data: any) => data?.threshold || 70
  }) as { data: number };

  // Update threshold value when threshold data changes
  useEffect(() => {
    if (threshold !== undefined) {
      setThresholdValue(threshold);
    }
  }, [threshold]);

  // Run reputation analysis mutation
  const runAnalysisMutation = useMutation({
    mutationFn: async () => {
      const windowDays = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 180;
      const response = await apiRequest('POST', '/api/reputation/run', {
        locationId: selectedLocation,
        windowDays
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reputation/score', selectedLocation] });
      queryClient.invalidateQueries({ queryKey: ['/api/reputation/trends', selectedLocation] });
      queryClient.invalidateQueries({ queryKey: ['/api/reputation/alerts', selectedLocation] });
      toast({
        title: "Análisis Completado",
        description: "Se ha actualizado tu análisis de reputación predictiva."
      });
    },
    onError: () => {
      toast({
        title: "Error en Análisis",
        description: "No se pudo completar el análisis. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  });

  // Acknowledge alert mutation
  const acknowledgeAlertMutation = useMutation({
    mutationFn: async ({ alertId }: { alertId: string }) => {
      const response = await apiRequest('POST', `/api/reputation/alerts/${alertId}/ack`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reputation/alerts', selectedLocation] });
      toast({
        title: "Alerta Reconocida",
        description: "La alerta ha sido marcada como vista."
      });
    }
  });

  // Update threshold mutation
  const updateThresholdMutation = useMutation({
    mutationFn: async ({ threshold }: { threshold: number }) => {
      const response = await apiRequest('PUT', `/api/reputation/thresholds/${selectedLocation}`, {
        threshold
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reputation/thresholds', selectedLocation] });
      toast({
        title: "Umbral Actualizado",
        description: `El umbral de alerta se ha establecido en ${thresholdValue}.`
      });
    },
    onError: () => {
      toast({
        title: "Error al Actualizar",
        description: "No se pudo actualizar el umbral. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  });

  // Bulk acknowledge alerts mutation
  const bulkAcknowledgeAlertsMutation = useMutation({
    mutationFn: async ({ alertIds }: { alertIds: string[] }) => {
      const response = await apiRequest('POST', '/api/reputation/alerts/acknowledge', {
        alertIds
      });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reputation/alerts', selectedLocation] });
      toast({
        title: "Alertas Reconocidas",
        description: "Las alertas seleccionadas han sido marcadas como vistas."
      });
    }
  });

  // Run analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await runAnalysisMutation.mutateAsync();
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update threshold handler
  const handleThresholdUpdate = async () => {
    if (thresholdValue !== threshold) {
      await updateThresholdMutation.mutateAsync({ threshold: thresholdValue });
    }
  };

  // Check if score exceeds threshold
  const scoreExceedsThreshold = (score: number, thresholdVal: number): boolean => {
    return score >= thresholdVal;
  };

  // Get threshold status display
  const getThresholdStatus = (score: number, thresholdVal: number) => {
    if (scoreExceedsThreshold(score, thresholdVal)) {
      const exceedance = score - thresholdVal;
      if (exceedance >= 25) {
        return { status: 'critical', color: COLORS.danger, message: 'Umbral crítico excedido' };
      } else if (exceedance >= 15) {
        return { status: 'high', color: COLORS.danger, message: 'Umbral alto excedido' };
      } else if (exceedance >= 5) {
        return { status: 'medium', color: COLORS.warning, message: 'Umbral moderado excedido' };
      } else {
        return { status: 'low', color: COLORS.warning, message: 'Umbral ligeramente excedido' };
      }
    }
    return { status: 'normal', color: COLORS.good, message: 'Dentro del umbral' };
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 70) return COLORS.good;
    if (score >= 40) return COLORS.warning;
    return COLORS.danger;
  };

  // Get trend icon and color
  const getTrendDisplay = (trend: string, previousScore?: number, currentScore?: number) => {
    if (trend === 'improving') {
      return { icon: TrendingUp, color: COLORS.good, text: 'Mejorando' };
    } else if (trend === 'declining') {
      return { icon: TrendingDown, color: COLORS.danger, text: 'Declinando' };
    }
    return { icon: Activity, color: COLORS.neutral, text: 'Estable' };
  };

  // Get alert severity config
  const getAlertSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return { color: COLORS.danger, variant: 'destructive' as const, icon: AlertTriangle };
      case 'high':
        return { color: COLORS.danger, variant: 'destructive' as const, icon: AlertTriangle };
      case 'medium':
        return { color: COLORS.warning, variant: 'secondary' as const, icon: Clock };
      case 'low':
        return { color: COLORS.neutral, variant: 'outline' as const, icon: Info };
      default:
        return { color: COLORS.neutral, variant: 'outline' as const, icon: Info };
    }
  };

  // Generate AI insights (mock data for now - would come from OpenAI integration)
  const generatePatternInsights = (score: ReputationScore | null): PatternInsight[] => {
    if (!score) return [];
    
    const insights: PatternInsight[] = [];
    
    // Score-based insights
    if (score.score < 50) {
      insights.push({
        type: 'risk',
        title: 'Reputación en Riesgo',
        description: 'Tu puntuación de reputación está por debajo del promedio de la industria.',
        impact: 'high',
        confidence: 0.9,
        actionable: true,
        suggestedAction: 'Implementa una estrategia proactiva de gestión de reseñas.'
      });
    }

    // Component-specific insights
    if (score.components.response < 60) {
      insights.push({
        type: 'opportunity',
        title: 'Mejora en Respuesta a Reseñas',
        description: 'Responder más reseñas puede mejorar significativamente tu puntuación.',
        impact: 'medium',
        confidence: 0.85,
        actionable: true,
        suggestedAction: 'Establece un proceso para responder a todas las reseñas en 24-48 horas.'
      });
    }

    if (score.components.volume < 40) {
      insights.push({
        type: 'recommendation',
        title: 'Aumentar Volumen de Reseñas',
        description: 'Más reseñas positivas pueden fortalecer tu presencia online.',
        impact: 'medium',
        confidence: 0.8,
        actionable: true,
        suggestedAction: 'Implementa campañas de solicitud de reseñas post-servicio.'
      });
    }

    if (score.trend === 'improving') {
      insights.push({
        type: 'trend',
        title: 'Tendencia Positiva Detectada',
        description: 'Tu reputación está mejorando consistentemente.',
        impact: 'low',
        confidence: 0.75,
        actionable: false
      });
    }

    return insights;
  };

  const patternInsights = generatePatternInsights(currentScore || null);

  // Format chart data for trends
  const chartData = (trends || []).map((trend: ReputationTrend) => ({
    date: new Date(trend.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    score: trend.score,
    rating: trend.components.rating,
    volume: trend.components.volume,
    sentiment: trend.components.sentiment,
    recency: trend.components.recency,
    response: trend.components.response,
  }));

  // Component breakdown data for pie chart
  const componentData = currentScore ? [
    { name: 'Rating', value: currentScore.components.rating, color: COMPONENT_COLORS[0] },
    { name: 'Volumen', value: currentScore.components.volume, color: COMPONENT_COLORS[1] },
    { name: 'Sentimiento', value: currentScore.components.sentiment, color: COMPONENT_COLORS[2] },
    { name: 'Reciente', value: currentScore.components.recency, color: COMPONENT_COLORS[3] },
    { name: 'Respuesta', value: currentScore.components.response, color: COMPONENT_COLORS[4] },
  ] : [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              AI Predictive Reputation
            </span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
            Dashboard de Reputación Predictiva
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Analiza y predice tu reputación online con IA avanzada para tomar decisiones proactivas.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => {/* Export functionality */}}
            data-testid="button-export-reputation"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            data-testid="button-run-analysis"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analizando...' : 'Ejecutar Análisis'}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium mb-2 block">Ubicación</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger data-testid="select-location">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {(locations || []).map((location: Location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.businessName} - {location.city}, {location.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-0">
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={timeRange} onValueChange={(value: '30d' | '90d' | '6m') => setTimeRange(value)}>
                <SelectTrigger data-testid="select-timerange">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">Últimos 30 días</SelectItem>
                  <SelectItem value="90d">Últimos 90 días</SelectItem>
                  <SelectItem value="6m">Últimos 6 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Score Gauge */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Puntuación de Reputación
            </CardTitle>
            <CardDescription>
              Análisis integral basado en múltiples factores de reputación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingScore ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            ) : currentScore ? (
              <div className="space-y-6">
                {/* Score Display */}
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center">
                    <div className="text-6xl font-bold" style={{ color: getScoreColor(currentScore.score) }}>
                      {currentScore.score}
                    </div>
                    <div className="text-2xl text-muted-foreground ml-1">/100</div>
                  </div>
                  <div className="relative w-64 mx-auto mt-4">
                    <Progress 
                      value={currentScore.score} 
                      className="h-3"
                      data-testid="progress-reputation-score"
                    />
                    {/* Threshold indicator line */}
                    <div 
                      className="absolute top-0 w-0.5 h-3 bg-orange-500 border-r-2 border-orange-600"
                      style={{ left: `${threshold}%` }}
                      title={`Umbral de Alerta: ${threshold}`}
                    />
                    <div 
                      className="absolute -top-6 text-xs text-orange-600 font-medium"
                      style={{ left: `${threshold}%`, transform: 'translateX(-50%)' }}
                    >
                      {threshold}
                    </div>
                  </div>
                  
                  {/* Threshold Status */}
                  {threshold && (
                    <div className="mt-2 flex items-center justify-center gap-2">
                      {(() => {
                        const thresholdStatus = getThresholdStatus(currentScore.score, threshold);
                        return (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: thresholdStatus.color }}
                            />
                            <span 
                              className="text-sm font-medium"
                              style={{ color: thresholdStatus.color }}
                            >
                              {thresholdStatus.message}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowThresholdSettings(true)}
                              data-testid="button-threshold-settings"
                            >
                              <Target className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center justify-center gap-2">
                    {(() => {
                      const trendDisplay = getTrendDisplay(currentScore.trend, currentScore.previousScore, currentScore.score);
                      const TrendIcon = trendDisplay.icon;
                      return (
                        <>
                          <TrendIcon className="h-5 w-5" style={{ color: trendDisplay.color }} />
                          <span className="font-medium" style={{ color: trendDisplay.color }}>
                            {trendDisplay.text}
                          </span>
                          {currentScore.previousScore && (
                            <span className="text-sm text-muted-foreground">
                              ({currentScore.score > currentScore.previousScore ? '+' : ''}{currentScore.score - currentScore.previousScore} puntos)
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Component Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {Object.entries(currentScore.components).map(([key, value], index) => {
                    const labels = {
                      rating: 'Rating',
                      volume: 'Volumen',
                      sentiment: 'Sentimiento',
                      recency: 'Reciente',
                      response: 'Respuesta'
                    };
                    return (
                      <div key={key} className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">
                          {labels[key as keyof typeof labels]}
                        </div>
                        <div className="text-2xl font-bold" style={{ color: getScoreColor(value) }}>
                          {value}
                        </div>
                        <Progress value={value} className="mt-2 h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecciona una ubicación para ver la puntuación de reputación
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Component Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución de Componentes
            </CardTitle>
            <CardDescription>
              Desglose de factores de reputación
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingScore ? (
              <Skeleton className="h-48 w-full" />
            ) : currentScore ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={componentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {componentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Valor']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full lg:w-fit grid-cols-4">
          <TabsTrigger value="trends" data-testid="tab-trends">Tendencias</TabsTrigger>
          <TabsTrigger value="alerts" data-testid="tab-alerts">Alertas</TabsTrigger>
          <TabsTrigger value="insights" data-testid="tab-insights">Patrones IA</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">Configuración</TabsTrigger>
        </TabsList>

        {/* Trends Tab */}
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tendencias de Reputación
              </CardTitle>
              <CardDescription>
                Evolución histórica de tu puntuación de reputación
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTrends ? (
                <Skeleton className="h-80 w-full" />
              ) : (trends || []).length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value}%`, 
                          name === 'score' ? 'Puntuación' : 
                          name === 'rating' ? 'Rating' :
                          name === 'volume' ? 'Volumen' :
                          name === 'sentiment' ? 'Sentimiento' :
                          name === 'recency' ? 'Reciente' : 'Respuesta'
                        ]}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#3B82F6" 
                        fillOpacity={1} 
                        fill="url(#colorScore)"
                        name="Puntuación"
                      />
                      <Line type="monotone" dataKey="rating" stroke={COMPONENT_COLORS[0]} name="Rating" />
                      <Line type="monotone" dataKey="volume" stroke={COMPONENT_COLORS[1]} name="Volumen" />
                      <Line type="monotone" dataKey="sentiment" stroke={COMPONENT_COLORS[2]} name="Sentimiento" />
                      <Line type="monotone" dataKey="response" stroke={COMPONENT_COLORS[4]} name="Respuesta" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay datos de tendencias disponibles para este período
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas de Reputación
                </CardTitle>
                <CardDescription>
                  Notificaciones importantes sobre cambios en tu reputación
                </CardDescription>
              </div>
              <Select value={alertFilter} onValueChange={setAlertFilter}>
                <SelectTrigger className="w-48" data-testid="select-alert-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las alertas</SelectItem>
                  <SelectItem value="unacknowledged">Sin reconocer</SelectItem>
                  <SelectItem value="critical">Críticas</SelectItem>
                  <SelectItem value="high">Altas</SelectItem>
                  <SelectItem value="medium">Medianas</SelectItem>
                  <SelectItem value="low">Bajas</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoadingAlerts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (alerts || []).length > 0 ? (
                <div className="space-y-4">
                  {(alerts || []).map((alert: ReputationAlert) => {
                    const severityConfig = getAlertSeverityConfig(alert.severity);
                    const SeverityIcon = severityConfig.icon;
                    
                    return (
                      <Alert key={alert.id} className={`border-l-4 ${alert.acknowledged ? 'opacity-75' : ''}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full" style={{ backgroundColor: severityConfig.color + '20' }}>
                              <SeverityIcon className="h-4 w-4" style={{ color: severityConfig.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={severityConfig.variant} className="capitalize">
                                  {alert.severity}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {alert.alertType.replace('_', ' ')}
                                </Badge>
                                {alert.acknowledged && (
                                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Reconocida
                                  </Badge>
                                )}
                              </div>
                              <AlertDescription className="text-sm mb-2">
                                {alert.message}
                              </AlertDescription>
                              <div className="text-xs text-muted-foreground">
                                {new Date(alert.createdAt).toLocaleString('es-ES')}
                                {alert.score && ` • Puntuación: ${alert.score}`}
                              </div>
                            </div>
                          </div>
                          {!alert.acknowledged && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlertMutation.mutate({ alertId: alert.id })}
                              data-testid={`button-acknowledge-${alert.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reconocer
                            </Button>
                          )}
                        </div>
                      </Alert>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hay alertas activas para mostrar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Patrones e Insights de IA
              </CardTitle>
              <CardDescription>
                Análisis inteligente y recomendaciones basadas en tus datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patternInsights.length > 0 ? (
                <div className="space-y-6">
                  {patternInsights.map((insight, index) => {
                    const getInsightIcon = (type: string) => {
                      switch (type) {
                        case 'opportunity': return Lightbulb;
                        case 'risk': return AlertTriangle;
                        case 'trend': return TrendingUp;
                        case 'recommendation': return Target;
                        default: return Info;
                      }
                    };

                    const getInsightColor = (type: string) => {
                      switch (type) {
                        case 'opportunity': return COLORS.good;
                        case 'risk': return COLORS.danger;
                        case 'trend': return COLORS.neutral;
                        case 'recommendation': return COLORS.warning;
                        default: return COLORS.neutral;
                      }
                    };

                    const InsightIcon = getInsightIcon(insight.type);
                    const color = getInsightColor(insight.type);

                    return (
                      <div key={index} className="border rounded-lg p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full" style={{ backgroundColor: color + '20' }}>
                              <InsightIcon className="h-5 w-5" style={{ color }} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">{insight.title}</h3>
                                <Badge variant="outline" className="capitalize text-xs">
                                  {insight.type}
                                </Badge>
                                <Badge 
                                  variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {insight.impact} impacto
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">
                                {insight.description}
                              </p>
                              {insight.suggestedAction && (
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Zap className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                      Acción Sugerida
                                    </span>
                                  </div>
                                  <p className="text-sm">{insight.suggestedAction}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            <div>Confianza</div>
                            <div className="text-lg font-bold">
                              {Math.round(insight.confidence * 100)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Aún no hay suficientes datos para generar insights de IA
                  </p>
                  <Button onClick={handleRunAnalysis} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Ejecutar Análisis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="space-y-6">
            {/* Threshold Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Configuración de Umbrales
                </CardTitle>
                <CardDescription>
                  Establece umbrales personalizados para generar alertas automáticas cuando tu puntuación de reputación supere ciertos niveles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Umbral de Alerta</label>
                      <p className="text-xs text-muted-foreground">
                        Genera alertas cuando la puntuación sea igual o superior a este valor
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {thresholdValue}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Slider
                      value={[thresholdValue]}
                      onValueChange={(value) => setThresholdValue(value[0])}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                      data-testid="slider-threshold"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0 (Bajo)</span>
                      <span>50 (Medio)</span>
                      <span>100 (Alto)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm">
                      <p className="font-medium mb-1">Severidad de Alertas:</p>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>• 0-4 puntos sobre umbral: <span className="text-orange-600">Baja</span></div>
                        <div>• 5-14 puntos sobre umbral: <span className="text-orange-600">Media</span></div>
                        <div>• 15-24 puntos sobre umbral: <span className="text-red-600">Alta</span></div>
                        <div>• 25+ puntos sobre umbral: <span className="text-red-600">Crítica</span></div>
                      </div>
                    </div>
                    <Button
                      onClick={handleThresholdUpdate}
                      disabled={thresholdValue === threshold || updateThresholdMutation.isPending}
                      data-testid="button-save-threshold"
                    >
                      {updateThresholdMutation.isPending ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Guardar Umbral
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Gestión de Alertas
                </CardTitle>
                <CardDescription>
                  Configura cómo recibir y gestionar las alertas de reputación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Alertas Automáticas</label>
                      <p className="text-xs text-muted-foreground">
                        Genera alertas automáticamente cuando se supere el umbral
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Prevención de Duplicados</label>
                      <p className="text-xs text-muted-foreground">
                        Evita alertas repetidas en un rango de ±5 puntos durante 24h
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Activo
                    </Badge>
                  </div>

                  {alerts.filter(a => !a.acknowledged).length > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <label className="text-sm font-medium">Alertas Pendientes</label>
                          <p className="text-xs text-muted-foreground">
                            {alerts.filter(a => !a.acknowledged).length} alertas sin reconocer
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const unacknowledgedIds = alerts.filter(a => !a.acknowledged).map(a => a.id);
                            bulkAcknowledgeAlertsMutation.mutate({ alertIds: unacknowledgedIds });
                          }}
                          disabled={bulkAcknowledgeAlertsMutation.isPending}
                          data-testid="button-acknowledge-all"
                        >
                          {bulkAcknowledgeAlertsMutation.isPending ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Procesando...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Reconocer Todas
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}