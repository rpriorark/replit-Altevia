import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  TrendingUp, 
  Users, 
  Star,
  BarChart3,
  Search,
  Trophy,
  Target,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Calendar,
  Eye
} from "lucide-react";
import type { Location, CompetitorAnalysisRecord } from "@shared/schema";

const competitorAnalysisSchema = z.object({
  competitorName: z.string().min(1, "Nombre del competidor es requerido"),
  competitorWebsite: z.string().url("URL válida requerida").optional().or(z.literal("")),
  analysisType: z.enum(["reviews", "content", "seo", "full"]).default("full")
});

type CompetitorAnalysisForm = z.infer<typeof competitorAnalysisSchema>;

interface AnalysisData {
  averageRating: number;
  totalReviews: number;
  recentReviews: number;
  responseRate: number;
  contentFrequency: number;
  seoScore: number;
  keywordRankings: Array<{
    keyword: string;
    position: number;
    difficulty: string;
  }>;
  socialPresence: {
    platforms: string[];
    followers: number;
    engagement: number;
  };
}

interface Recommendation {
  category: string;
  priority: "high" | "medium" | "low";
  action: string;
  impact: string;
}

export default function EnhancedCompetitorAnalysis() {
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedAnalysis, setSelectedAnalysis] = useState<CompetitorAnalysisRecord | null>(null);

  const form = useForm<CompetitorAnalysisForm>({
    resolver: zodResolver(competitorAnalysisSchema),
    defaultValues: {
      competitorName: "",
      competitorWebsite: "",
      analysisType: "full"
    }
  });

  // Get locations
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/businesses/locations'],
  });

  // Get competitor analyses for selected location
  const { data: analyses = [], isLoading, refetch } = useQuery<CompetitorAnalysisRecord[]>({
    queryKey: ['/api/locations', selectedLocation, 'competitor-analysis'],
    enabled: !!selectedLocation,
  });

  // Create competitor analysis mutation
  const createAnalysis = useMutation({
    mutationFn: async (data: CompetitorAnalysisForm) => {
      const response = await apiRequest(`/api/locations/${selectedLocation}/competitor-analysis`, {
        method: 'POST',
        data
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Análisis Creado",
        description: "El análisis de competencia se completó exitosamente.",
      });
      form.reset();
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo completar el análisis de competencia.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: CompetitorAnalysisForm) => {
    createAnalysis.mutate(data);
  };

  const parseAnalysisData = (jsonData: string): AnalysisData | null => {
    try {
      return JSON.parse(jsonData);
    } catch {
      return null;
    }
  };

  const parseRecommendations = (jsonData: string): Recommendation[] => {
    try {
      return JSON.parse(jsonData);
    } catch {
      return [];
    }
  };

  const getCompetitiveScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excelente</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Bueno</Badge>;
    if (score >= 40) return <Badge className="bg-orange-100 text-orange-800">Regular</Badge>;
    return <Badge className="bg-red-100 text-red-800">Necesita Mejora</Badge>;
  };

  const getMarketPositionIcon = (position: string) => {
    switch (position) {
      case 'leader':
        return <Trophy className="h-4 w-4 text-yellow-600" />;
      case 'challenger':
        return <Target className="h-4 w-4 text-blue-600" />;
      case 'follower':
        return <Users className="h-4 w-4 text-gray-600" />;
      case 'niche':
        return <Star className="h-4 w-4 text-purple-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateInput: string | Date) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6" data-testid="competitor-analysis">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-competitor-analysis">Análisis de Competencia</h1>
          <p className="text-muted-foreground">
            Analiza a tu competencia y descubre oportunidades de mejora
          </p>
        </div>
      </div>

      {/* Location Selector */}
      <Card data-testid="location-selector">
        <CardHeader>
          <CardTitle>Seleccionar Ubicación</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger data-testid="select-location">
              <SelectValue placeholder="Selecciona una ubicación" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name} - {location.city}, {location.state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedLocation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Analysis Form */}
          <Card data-testid="analysis-form">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Nuevo Análisis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="competitorName">Nombre del Competidor *</Label>
                  <Input
                    id="competitorName"
                    {...form.register("competitorName")}
                    placeholder="Ej: Restaurante Central"
                    data-testid="input-competitor-name"
                  />
                  {form.formState.errors.competitorName && (
                    <p className="text-sm text-red-600">{form.formState.errors.competitorName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitorWebsite">Sitio Web (Opcional)</Label>
                  <Input
                    id="competitorWebsite"
                    type="url"
                    {...form.register("competitorWebsite")}
                    placeholder="https://competidor.com"
                    data-testid="input-competitor-website"
                  />
                  {form.formState.errors.competitorWebsite && (
                    <p className="text-sm text-red-600">{form.formState.errors.competitorWebsite.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analysisType">Tipo de Análisis</Label>
                  <Select 
                    value={form.watch("analysisType")} 
                    onValueChange={(value) => form.setValue("analysisType", value as any)}
                  >
                    <SelectTrigger data-testid="select-analysis-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Análisis Completo</SelectItem>
                      <SelectItem value="reviews">Solo Reseñas</SelectItem>
                      <SelectItem value="content">Solo Contenido</SelectItem>
                      <SelectItem value="seo">Solo SEO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createAnalysis.isPending}
                  data-testid="button-create-analysis"
                >
                  {createAnalysis.isPending ? 'Analizando...' : 'Analizar Competidor'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Analyses List */}
          <Card className="lg:col-span-2" data-testid="analyses-list">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análisis Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : analyses.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No hay análisis realizados</h3>
                  <p className="text-muted-foreground">
                    Crea tu primer análisis de competencia
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analyses.map((analysis) => {
                    const analysisData = parseAnalysisData(analysis.analysisData);
                    
                    return (
                      <div 
                        key={analysis.id} 
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAnalysis?.id === analysis.id ? 'bg-muted' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedAnalysis(analysis)}
                        data-testid={`analysis-${analysis.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold flex items-center gap-2" data-testid={`competitor-name-${analysis.id}`}>
                              {analysis.competitorName}
                              {getMarketPositionIcon(analysis.marketPosition || 'follower')}
                            </h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              Análisis {analysis.analysisType} • {formatDate(analysis.analysisDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {analysis.competitiveScore && getCompetitiveScoreBadge(analysis.competitiveScore)}
                            <Badge variant="outline" className="capitalize">
                              {analysis.marketPosition || 'Follower'}
                            </Badge>
                          </div>
                        </div>

                        {analysisData && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-muted-foreground">Rating</p>
                              <p className="font-semibold">{analysisData.averageRating.toFixed(1)}⭐</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">Reseñas</p>
                              <p className="font-semibold">{analysisData.totalReviews}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">Respuesta</p>
                              <p className="font-semibold">{analysisData.responseRate}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">SEO Score</p>
                              <p className="font-semibold">{analysisData.seoScore}/100</p>
                            </div>
                          </div>
                        )}

                        {analysis.competitorWebsite && (
                          <div className="mt-3 pt-3 border-t">
                            <a 
                              href={analysis.competitorWebsite} 
                              target="_blank" 
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="h-3 w-3" />
                              Visitar sitio web
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analysis View */}
      {selectedAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Analysis Details */}
          <Card data-testid="analysis-details">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Detalles del Análisis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const analysisData = parseAnalysisData(selectedAnalysis.analysisData);
                const strengthsWeaknesses = selectedAnalysis.strengthsWeaknesses ? 
                  JSON.parse(selectedAnalysis.strengthsWeaknesses) : null;

                return (
                  <>
                    {analysisData && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-semibold">Métricas de Reseñas</h4>
                            <div className="space-y-1 text-sm">
                              <p>Rating promedio: <span className="font-medium">{analysisData.averageRating.toFixed(1)}⭐</span></p>
                              <p>Total de reseñas: <span className="font-medium">{analysisData.totalReviews}</span></p>
                              <p>Reseñas recientes: <span className="font-medium">{analysisData.recentReviews}</span></p>
                              <p>Tasa de respuesta: <span className="font-medium">{analysisData.responseRate}%</span></p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-semibold">Presencia Digital</h4>
                            <div className="space-y-1 text-sm">
                              <p>Score SEO: <span className="font-medium">{analysisData.seoScore}/100</span></p>
                              <p>Frecuencia de contenido: <span className="font-medium">{analysisData.contentFrequency}/semana</span></p>
                              <p>Seguidores: <span className="font-medium">{analysisData.socialPresence.followers.toLocaleString()}</span></p>
                              <p>Engagement: <span className="font-medium">{analysisData.socialPresence.engagement}%</span></p>
                            </div>
                          </div>
                        </div>

                        {analysisData.keywordRankings && analysisData.keywordRankings.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold">Ranking de Keywords</h4>
                            <div className="space-y-2">
                              {analysisData.keywordRankings.slice(0, 5).map((keyword, index) => (
                                <div key={index} className="flex items-center justify-between text-sm border rounded p-2">
                                  <span>{keyword.keyword}</span>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">#{keyword.position}</Badge>
                                    <Badge 
                                      variant={keyword.difficulty === 'high' ? 'destructive' : 
                                              keyword.difficulty === 'medium' ? 'secondary' : 'default'}
                                    >
                                      {keyword.difficulty}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {strengthsWeaknesses && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {strengthsWeaknesses.strengths && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-4 w-4" />
                                  Fortalezas
                                </h4>
                                <ul className="space-y-1 text-sm">
                                  {strengthsWeaknesses.strengths.map((strength: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                      {strength}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {strengthsWeaknesses.weaknesses && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-yellow-600 flex items-center gap-1">
                                  <AlertTriangle className="h-4 w-4" />
                                  Debilidades
                                </h4>
                                <ul className="space-y-1 text-sm">
                                  {strengthsWeaknesses.weaknesses.map((weakness: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                      {weakness}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card data-testid="recommendations">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recomendaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const recommendations = selectedAnalysis.recommendations ? 
                  parseRecommendations(selectedAnalysis.recommendations) : [];

                return recommendations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No hay recomendaciones disponibles para este análisis
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{rec.category}</h4>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority === 'high' ? 'Alta' : 
                             rec.priority === 'medium' ? 'Media' : 'Baja'} Prioridad
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.action}</p>
                        <p className="text-xs text-green-600 font-medium">
                          Impacto esperado: {rec.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}