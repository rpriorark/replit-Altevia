import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  MessageSquare,
  FileText,
  Target,
  Calendar,
  RefreshCw,
  CheckCircle,
  Clock,
  ArrowRight,
  Brain,
  Zap,
  Users,
  Search
} from "lucide-react";

interface AISuggestion {
  id: string;
  type: 'content' | 'seo' | 'reviews' | 'strategy';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  effort: string;
  status: 'pending' | 'in_progress' | 'completed';
  generatedAt: Date;
  category: string;
}

interface ContentIdea {
  title: string;
  type: string;
  keywords: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTraffic: number;
  description: string;
}

interface OptimizationTip {
  area: string;
  suggestion: string;
  expectedImpact: string;
  timeToImplement: string;
  icon: React.ReactNode;
}

const AISuggestions = () => {
  // todo: remove mock functionality
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const suggestions: AISuggestion[] = [
    {
      id: "1",
      type: "content",
      title: "Crear guía completa sobre 'Marketing Digital para Restaurantes'",
      description: "Genera una guía detallada que cubra estrategias específicas para restaurantes locales, incluyendo gestión de reseñas, redes sociales y SEO local.",
      priority: "high",
      impact: "Alto - Potencial de 500+ visitantes/mes",
      effort: "Medio - 3-4 horas",
      status: "pending",
      generatedAt: new Date(),
      category: "SEO Content"
    },
    {
      id: "2",
      type: "seo",
      title: "Optimizar para 'consultor marketing digital + [ciudad]'",
      description: "Crear contenido específico para capturar búsquedas locales de servicios de consultoría en marketing digital.",
      priority: "high",
      impact: "Alto - Posición top 5 probable",
      effort: "Bajo - 1-2 horas",
      status: "in_progress",
      generatedAt: new Date(),
      category: "Local SEO"
    },
    {
      id: "3",
      type: "reviews",
      title: "Implementar campaña automatizada de solicitud de reseñas",
      description: "Configurar emails automáticos post-servicio para solicitar reseñas de manera natural y efectiva.",
      priority: "medium",
      impact: "Medio - +20% más reseñas",
      effort: "Bajo - 1 hora",
      status: "pending",
      generatedAt: new Date(),
      category: "Reputation Management"
    },
    {
      id: "4",
      type: "strategy",
      title: "Aprovechar tendencia de 'IA en marketing'",
      description: "Crear contenido educativo sobre IA en marketing para posicionarte como experto en tecnologías emergentes.",
      priority: "medium",
      impact: "Alto - Diferenciación competitiva",
      effort: "Alto - 5-6 horas",
      status: "pending",
      generatedAt: new Date(),
      category: "Content Strategy"
    },
    {
      id: "5",
      type: "content",
      title: "Serie de casos de éxito de clientes",
      description: "Documenta transformaciones reales de clientes para generar confianza y mejorar conversiones.",
      priority: "high",
      impact: "Alto - +30% conversión estimada",
      effort: "Medio - 2-3 horas por caso",
      status: "pending",
      generatedAt: new Date(),
      category: "Social Proof"
    }
  ];

  const contentIdeas: ContentIdea[] = [
    {
      title: "Guía Completa de SEO Local para PyMEs",
      type: "Artículo de blog",
      keywords: ["seo local", "marketing pymes", "google my business"],
      difficulty: "medium",
      estimatedTraffic: 800,
      description: "Tutorial paso a paso para optimizar la presencia local de pequeñas empresas"
    },
    {
      title: "10 Errores Comunes en Reseñas Online",
      type: "Infografía + Post",
      keywords: ["gestión reseñas", "reputación online", "errores marketing"],
      difficulty: "easy",
      estimatedTraffic: 450,
      description: "Identifica y corrige los errores más frecuentes en la gestión de reseñas"
    },
    {
      title: "ROI del Marketing Digital: Cómo Medirlo",
      type: "Video + Transcripción",
      keywords: ["roi marketing", "métricas digitales", "analítica web"],
      difficulty: "hard",
      estimatedTraffic: 1200,
      description: "Metodología completa para calcular y demostrar el retorno de inversión"
    },
    {
      title: "Automatización de Marketing para Principiantes",
      type: "Serie de 5 posts",
      keywords: ["automatización marketing", "email marketing", "workflows"],
      difficulty: "medium",
      estimatedTraffic: 650,
      description: "Introducción práctica a las herramientas de automatización más populares"
    }
  ];

  const optimizationTips: OptimizationTip[] = [
    {
      area: "Velocidad del Sitio",
      suggestion: "Optimizar imágenes y implementar lazy loading para mejorar tiempo de carga",
      expectedImpact: "+15% en tiempo de permanencia",
      timeToImplement: "2-3 horas",
      icon: <Zap className="h-4 w-4 text-chart-3" />
    },
    {
      area: "Contenido Existente",
      suggestion: "Actualizar posts antiguos con información reciente y nuevas palabras clave",
      expectedImpact: "+25% en tráfico orgánico",
      timeToImplement: "1 hora por post",
      icon: <RefreshCw className="h-4 w-4 text-primary" />
    },
    {
      area: "Estructura del Sitio",
      suggestion: "Añadir breadcrumbs y mejorar navegación interna para mejor UX",
      expectedImpact: "+20% en páginas por sesión",
      timeToImplement: "4-5 horas",
      icon: <Target className="h-4 w-4 text-chart-2" />
    },
    {
      area: "Llamadas a la Acción",
      suggestion: "Optimizar CTAs con texto más persuasivo y mejor ubicación",
      expectedImpact: "+30% en conversiones",
      timeToImplement: "2-3 horas",
      icon: <Users className="h-4 w-4 text-chart-5" />
    }
  ];

  const generateNewSuggestions = () => {
    console.log('Generating new AI suggestions');
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      // Simular nuevas sugerencias generadas
    }, 2000);
  };

  const generateCustomSuggestion = () => {
    console.log('Generating custom suggestion for:', customPrompt);
    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      setCustomPrompt("");
      // Simular sugerencia personalizada
    }, 1500);
  };

  const filteredSuggestions = selectedCategory === "all" 
    ? suggestions 
    : suggestions.filter(s => s.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-chart-3 text-white';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-chart-2" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-chart-3" />;
      case 'pending': return <Lightbulb className="h-4 w-4 text-muted-foreground" />;
      default: return <Lightbulb className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'text-chart-2';
      case 'medium': return 'text-chart-3';
      case 'hard': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Sugerencias IA
          </h1>
          <p className="text-muted-foreground">
            Recomendaciones inteligentes personalizadas para tu negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48" data-testid="select-category">
              <SelectValue placeholder="Filtrar por categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              <SelectItem value="seo">SEO Content</SelectItem>
              <SelectItem value="local">Local SEO</SelectItem>
              <SelectItem value="content">Content Strategy</SelectItem>
              <SelectItem value="reputation">Reputation Management</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={generateNewSuggestions}
            disabled={isGenerating}
            data-testid="button-generate-suggestions"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generar Nuevas
          </Button>
        </div>
      </div>

      {/* Sugerencias Principales */}
      <div className="grid gap-4">
        {filteredSuggestions.map((suggestion) => (
          <Card key={suggestion.id} className="hover-elevate" data-testid={`card-suggestion-${suggestion.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(suggestion.status)}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                    <CardDescription className="mt-1">{suggestion.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(suggestion.priority)}>
                    {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Media' : 'Baja'}
                  </Badge>
                  <Badge variant="outline">{suggestion.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                  <div className="text-sm">
                    <div className="font-medium">Impacto</div>
                    <div className="text-muted-foreground">{suggestion.impact}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-chart-3" />
                  <div className="text-sm">
                    <div className="font-medium">Esfuerzo</div>
                    <div className="text-muted-foreground">{suggestion.effort}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">Generado</div>
                    <div className="text-muted-foreground">Hace 2 horas</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" data-testid={`button-implement-${suggestion.id}`}>
                  Implementar
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
                <Button variant="outline" size="sm" data-testid={`button-details-${suggestion.id}`}>
                  Ver Detalles
                </Button>
                {suggestion.type === 'content' && (
                  <Button variant="outline" size="sm" data-testid={`button-generate-content-${suggestion.id}`}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generar Contenido
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generador Personalizado */}
      <Card data-testid="card-custom-generator">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Generador Personalizado
          </CardTitle>
          <CardDescription>
            Describe tu situación específica para recibir sugerencias personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ej: Necesito mejorar las conversiones en mi página de servicios, especialmente para clientes de e-commerce..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={3}
            data-testid="textarea-custom-prompt"
          />
          <Button 
            onClick={generateCustomSuggestion}
            disabled={!customPrompt.trim() || isGenerating}
            data-testid="button-generate-custom"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analizando...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generar Sugerencia Personalizada
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tabs de Contenido Adicional */}
      <Tabs defaultValue="content-ideas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content-ideas">Ideas de Contenido</TabsTrigger>
          <TabsTrigger value="optimization">Optimizaciones</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="content-ideas" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {contentIdeas.map((idea, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-content-idea-${index}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{idea.title}</CardTitle>
                      <CardDescription>{idea.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{idea.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {idea.keywords.map((keyword, kidx) => (
                        <Badge key={kidx} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium ${getDifficultyColor(idea.difficulty)}`}>
                        Dificultad: {idea.difficulty === 'easy' ? 'Fácil' : idea.difficulty === 'medium' ? 'Media' : 'Difícil'}
                      </span>
                      <span className="text-muted-foreground">
                        ~{idea.estimatedTraffic} visitas/mes
                      </span>
                    </div>
                    <Button size="sm" className="w-full" data-testid={`button-create-content-${index}`}>
                      <FileText className="h-3 w-3 mr-1" />
                      Crear Contenido
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          <div className="grid gap-4">
            {optimizationTips.map((tip, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-optimization-${index}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {tip.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{tip.area}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{tip.suggestion}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-chart-2">Impacto esperado: </span>
                          <span>{tip.expectedImpact}</span>
                        </div>
                        <div>
                          <span className="font-medium text-chart-3">Tiempo estimado: </span>
                          <span>{tip.timeToImplement}</span>
                        </div>
                      </div>
                      <Button size="sm" className="mt-3" data-testid={`button-apply-optimization-${index}`}>
                        Aplicar Optimización
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card data-testid="card-trending-topics">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Tendencias y Oportunidades
              </CardTitle>
              <CardDescription>Temas en auge relevantes para tu industria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border border-chart-2/20 bg-chart-2/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                  <span className="font-medium">Tendencia Creciente</span>
                  <Badge variant="outline" className="text-chart-2 border-chart-2">+340% búsquedas</Badge>
                </div>
                <h4 className="font-semibold mb-1">Inteligencia Artificial en Marketing</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Las búsquedas sobre IA aplicada al marketing han crecido exponencialmente
                </p>
                <Button size="sm" variant="outline" data-testid="button-explore-ai-trend">
                  Explorar Oportunidad
                </Button>
              </div>

              <div className="p-4 border border-chart-3/20 bg-chart-3/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-chart-3" />
                  <span className="font-medium">Oportunidad Local</span>
                  <Badge variant="outline" className="text-chart-3 border-chart-3">Baja competencia</Badge>
                </div>
                <h4 className="font-semibold mb-1">Marketing Sostenible y Verde</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Nicho emergente con poca competencia en tu área geográfica
                </p>
                <Button size="sm" variant="outline" data-testid="button-explore-green-trend">
                  Explorar Oportunidad
                </Button>
              </div>

              <div className="p-4 border border-primary/20 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="font-medium">Tema Viral</span>
                  <Badge variant="outline" className="text-primary border-primary">Trending</Badge>
                </div>
                <h4 className="font-semibold mb-1">Automatización de Procesos</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  PyMEs buscan soluciones de automatización accesibles
                </p>
                <Button size="sm" variant="outline" data-testid="button-explore-automation-trend">
                  Explorar Oportunidad
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISuggestions;