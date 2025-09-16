import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { renderTextSafe } from "@/lib/markdown";
import { 
  Sparkles, 
  FileText, 
  Copy, 
  Download, 
  TrendingUp,
  Target,
  Lightbulb,
  MapPin,
  Store,
  Users,
  Mic,
  Calendar,
  BarChart3,
  Building2,
  Plus,
  X
} from "lucide-react";

interface GeneratedContent {
  title: string;
  content: string;
  metaDescription: string;
  localKeywords: string[];
  voiceSearchQueries: string[];
  competitorAnalysis?: string;
  localOptimizationTips: string[];
}

const SEOGenerator = () => {
  const { toast } = useToast();
  
  // Basic content generation fields
  const [contentType, setContentType] = useState("");
  const [keywords, setKeywords] = useState("");
  const [businessInfo, setBusinessInfo] = useState("");
  
  // Local SEO distinctive features
  const [location, setLocation] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [localEvents, setLocalEvents] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState("");
  const [voiceSearchOptimized, setVoiceSearchOptimized] = useState(false);
  
  // Generated content
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [gmbPost, setGmbPost] = useState("");
  const [competitorAnalysis, setCompetitorAnalysis] = useState("");
  
  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingGMB, setIsGeneratingGMB] = useState(false);
  const [isAnalyzingCompetitors, setIsAnalyzingCompetitors] = useState(false);

  const addCompetitor = () => {
    if (newCompetitor.trim() && !competitors.includes(newCompetitor.trim())) {
      setCompetitors([...competitors, newCompetitor.trim()]);
      setNewCompetitor("");
    }
  };

  const removeCompetitor = (competitor: string) => {
    setCompetitors(competitors.filter(c => c !== competitor));
  };

  const addLocalEvent = () => {
    if (newEvent.trim() && !localEvents.includes(newEvent.trim())) {
      setLocalEvents([...localEvents, newEvent.trim()]);
      setNewEvent("");
    }
  };

  const removeLocalEvent = (event: string) => {
    setLocalEvents(localEvents.filter(e => e !== event));
  };

  const handleGenerate = async () => {
    if (!contentType || !keywords || !businessInfo) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el tipo de contenido, palabras clave e información del negocio.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest("/api/seo/generate-content", {
        method: "POST",
        data: {
          contentType,
          keywords,
          businessInfo,
          location: location || undefined,
          businessType: businessType || undefined,
          targetAudience: targetAudience || undefined,
          competitors: competitors.length > 0 ? competitors : undefined,
          localEvents: localEvents.length > 0 ? localEvents : undefined,
          voiceSearchOptimized
        }
      });
      
      const result = await response.json();
      setGeneratedContent(result);
      toast({
        title: "Contenido generado",
        description: "El contenido SEO ha sido generado exitosamente con optimización local."
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el contenido. Verifica tu conexión y configuración de API.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateGMB = async () => {
    if (!businessInfo || !location) {
      toast({
        title: "Campos requeridos",
        description: "Necesitas información del negocio y ubicación para generar posts de Google My Business.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingGMB(true);
    try {
      const response = await apiRequest("/api/seo/generate-gmb-post", {
        method: "POST",
        data: {
          businessInfo,
          occasion: localEvents[0] || "promoción especial",
          location
        }
      });
      
      const result = await response.json();
      setGmbPost(result.post);
      toast({
        title: "Post de GMB generado",
        description: "Post optimizado para Google My Business creado exitosamente."
      });
    } catch (error) {
      console.error("Error generating GMB post:", error);
      toast({
        title: "Error",
        description: "No se pudo generar el post de Google My Business.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingGMB(false);
    }
  };

  const handleAnalyzeCompetitors = async () => {
    if (!businessInfo || !location || competitors.length === 0) {
      toast({
        title: "Campos requeridos",
        description: "Necesitas información del negocio, ubicación y al menos un competidor.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzingCompetitors(true);
    try {
      const response = await apiRequest("/api/seo/analyze-competitors", {
        method: "POST",
        data: {
          businessInfo,
          location,
          competitors
        }
      });
      
      const result = await response.json();
      setCompetitorAnalysis(result.analysis);
      toast({
        title: "Análisis completado",
        description: "Análisis de competencia local generado exitosamente."
      });
    } catch (error) {
      console.error("Error analyzing competitors:", error);
      toast({
        title: "Error",
        description: "No se pudo analizar la competencia local.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzingCompetitors(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Contenido copiado al portapapeles."
    });
  };

  const contentTypes = [
    { value: "blog-article", label: "Artículo de Blog Local" },
    { value: "product-description", label: "Descripción de Producto" },
    { value: "service-page", label: "Página de Servicio Local" },
    { value: "landing-page", label: "Landing Page" },
    { value: "social-post", label: "Post para Redes Sociales" },
    { value: "gmb-post", label: "Post Google My Business" },
    { value: "local-event", label: "Contenido de Evento Local" },
    { value: "voice-search", label: "Optimizado para Voz" }
  ];

  const businessTypes = [
    "Restaurante", "Tienda", "Servicios", "Salud", "Belleza", "Educación", "Inmobiliaria", "Legal", "Tecnología", "Otro"
  ];

  const keywordSuggestions = [
    "cerca de mí",
    "en [ciudad]",
    "mejor [servicio] local",
    "[servicio] [ciudad]",
    "horarios de atención",
    "dirección y contacto"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Generador SEO con IA
        </h1>
        <p className="text-muted-foreground">
          Crea contenido optimizado para buscadores con inteligencia artificial
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card data-testid="card-content-config" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Generador SEO Local con IA
            </CardTitle>
            <CardDescription>
              Características distintivas para visibilidad digital local
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="local">SEO Local</TabsTrigger>
                <TabsTrigger value="advanced">Avanzado</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="content-type">Tipo de Contenido</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger data-testid="select-content-type">
                      <SelectValue placeholder="Selecciona el tipo de contenido" />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Palabras Clave Objetivo</Label>
                  <Input
                    id="keywords"
                    placeholder="Ej: restaurante italiano, cerca de mí"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    data-testid="input-keywords"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Patrones locales:</span>
                    {keywordSuggestions.map((keyword) => (
                      <Badge 
                        key={keyword} 
                        variant="outline" 
                        className="cursor-pointer hover-elevate"
                        onClick={() => setKeywords(keyword)}
                        data-testid={`badge-keyword-${keyword.replace(/\s+/g, '-')}`}
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="business-info">Información del Negocio</Label>
                  <Textarea
                    id="business-info"
                    placeholder="Describe tu negocio, servicios, ubicación y audiencia objetivo..."
                    value={businessInfo}
                    onChange={(e) => setBusinessInfo(e.target.value)}
                    rows={4}
                    data-testid="textarea-business-info"
                  />
                </div>
              </TabsContent>

              <TabsContent value="local" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Ubicación
                    </Label>
                    <Input
                      placeholder="Ej: Madrid, España"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      data-testid="input-location"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      Tipo de Negocio
                    </Label>
                    <Select value={businessType} onValueChange={setBusinessType}>
                      <SelectTrigger data-testid="select-business-type">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Audiencia Objetivo
                  </Label>
                  <Input
                    placeholder="Ej: Familias jóvenes en Madrid centro"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    data-testid="input-target-audience"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Competidores Locales
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Agrega un competidor"
                      value={newCompetitor}
                      onChange={(e) => setNewCompetitor(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
                      data-testid="input-new-competitor"
                    />
                    <Button 
                      type="button" 
                      onClick={addCompetitor}
                      size="icon"
                      variant="outline"
                      data-testid="button-add-competitor"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {competitors.map((competitor) => (
                      <Badge key={competitor} variant="secondary" className="flex items-center gap-1">
                        {competitor}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeCompetitor(competitor)}
                          data-testid={`button-remove-competitor-${competitor}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Eventos Locales
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ej: Navidad 2025, Fiestas de Madrid"
                      value={newEvent}
                      onChange={(e) => setNewEvent(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addLocalEvent()}
                      data-testid="input-new-event"
                    />
                    <Button 
                      type="button" 
                      onClick={addLocalEvent}
                      size="icon"
                      variant="outline"
                      data-testid="button-add-event"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {localEvents.map((event) => (
                      <Badge key={event} variant="secondary" className="flex items-center gap-1">
                        {event}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeLocalEvent(event)}
                          data-testid={`button-remove-event-${event}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="voice-search"
                    checked={voiceSearchOptimized}
                    onCheckedChange={setVoiceSearchOptimized}
                    data-testid="switch-voice-search"
                  />
                  <Label htmlFor="voice-search" className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    Optimizar para búsquedas por voz
                  </Label>
                </div>
              </TabsContent>
            </Tabs>

            <Separator />
            
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={handleGenerate}
                disabled={isGenerating || !contentType || !keywords}
                data-testid="button-generate-content"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando Contenido SEO Local...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generar Contenido con IA
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Local Tools Panel */}
        <div className="space-y-6">
          <Card data-testid="card-gmb-tools">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Google My Business
              </CardTitle>
              <CardDescription>
                Genera posts optimizados para GMB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleGenerateGMB}
                disabled={isGeneratingGMB || !businessInfo || !location}
                data-testid="button-generate-gmb"
              >
                {isGeneratingGMB ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Crear Post GMB
                  </>
                )}
              </Button>
              
              {gmbPost && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{gmbPost}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(gmbPost)}
                    className="mt-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card data-testid="card-competitor-analysis">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Análisis de Competencia
              </CardTitle>
              <CardDescription>
                Análisis local de competidores
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleAnalyzeCompetitors}
                disabled={isAnalyzingCompetitors || !businessInfo || !location || competitors.length === 0}
                data-testid="button-analyze-competitors"
              >
                {isAnalyzingCompetitors ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analizar Competencia
                  </>
                )}
              </Button>
              
              {competitorAnalysis && (
                <div className="p-3 bg-muted rounded-lg">
                  <div 
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderTextSafe(competitorAnalysis)
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(competitorAnalysis)}
                    className="mt-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-1 gap-6 mt-6">

        {/* Preview Panel */}
        <Card data-testid="card-content-preview">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contenido SEO Local Generado
                </CardTitle>
                <CardDescription>
                  Contenido optimizado con características distintivas para visibilidad local
                </CardDescription>
              </div>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(generatedContent.content)}
                    data-testid="button-copy-content"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-download-content">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                  <TabsTrigger value="seo-data">SEO Local</TabsTrigger>
                  <TabsTrigger value="voice-search">Búsquedas Voz</TabsTrigger>
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="mt-4">
                  <div className="space-y-4">
                    {/* SEO Meta Data */}
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium text-sm mb-2">Datos SEO</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Título:</strong> {generatedContent.title}</div>
                        <div><strong>Meta descripción:</strong> {generatedContent.metaDescription}</div>
                      </div>
                    </div>
                    
                    {/* Content Preview */}
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: renderTextSafe(generatedContent.content)
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seo-data" className="mt-4">
                  <div className="space-y-6">
                    {/* Local Keywords */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Keywords Locales Sugeridas
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {generatedContent.localKeywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Local Optimization Tips */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Consejos de Optimización Local
                      </h4>
                      <div className="space-y-2">
                        {generatedContent.localOptimizationTips.map((tip, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="voice-search" className="mt-4">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Consultas de Búsquedas por Voz
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Consultas optimizadas para búsquedas por voz y asistentes virtuales
                    </p>
                    <div className="space-y-3">
                      {generatedContent.voiceSearchQueries.map((query, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-start gap-2">
                            <Mic className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-sm">{query}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="markdown" className="mt-4">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    {generatedContent.content}
                  </pre>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configura los parámetros y genera contenido SEO local para ver la vista previa</p>
                <p className="text-xs mt-2">Características distintivas: SEO geolocalizado, análisis de competencia, eventos locales, optimización para voz</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Local SEO Distinctive Features */}
      <Card data-testid="card-seo-tips">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Características Distintivas de Altevia vs MonetizeMore
          </CardTitle>
          <CardDescription>
            Mientras MonetizeMore se enfoca en monetización publicitaria, Altevia optimiza tu visibilidad digital local
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-chart-2 mt-1" />
              <div>
                <h4 className="font-medium mb-1">SEO Geolocalizado</h4>
                <p className="text-sm text-muted-foreground">
                  Genera contenido optimizado para búsquedas "cerca de mí" y ubicaciones específicas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-chart-3 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Google My Business</h4>
                <p className="text-sm text-muted-foreground">
                  Posts automáticos y optimizados para aumentar visibilidad en Google Maps
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mic className="h-5 w-5 text-chart-4 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Búsquedas por Voz</h4>
                <p className="text-sm text-muted-foreground">
                  Contenido optimizado para consultas naturales y asistentes virtuales
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-chart-5 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Competencia Local</h4>
                <p className="text-sm text-muted-foreground">
                  Análisis automático de competidores locales con estrategias de diferenciación
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium mb-1">Eventos Locales</h4>
                <p className="text-sm text-muted-foreground">
                  Integración de tendencias y eventos locales para contenido relevante
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-chart-1 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Enfoque Local</h4>
                <p className="text-sm text-muted-foreground">
                  Contenido específico para tu ubicación y área de servicio
                </p>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-center">
            <Badge variant="outline" className="px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Diferencia clave: Generación de tráfico orgánico local vs Monetización de tráfico existente
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOGenerator;