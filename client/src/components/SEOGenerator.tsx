import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  FileText, 
  Copy, 
  Download, 
  TrendingUp,
  Target,
  Lightbulb
} from "lucide-react";

const SEOGenerator = () => {
  // todo: remove mock functionality
  const [contentType, setContentType] = useState("");
  const [keywords, setKeywords] = useState("");
  const [businessInfo, setBusinessInfo] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    console.log('Generating content with AI');
    setIsGenerating(true);
    
    // Simular generación de contenido
    setTimeout(() => {
      setGeneratedContent(`# Mejores Prácticas de ${keywords || 'Marketing Digital'} para Tu Negocio

En el competitivo mundo del marketing digital, es fundamental conocer las estrategias que realmente funcionan para hacer crecer tu negocio. En este artículo, exploraremos las mejores prácticas que puedes implementar desde hoy mismo.

## ¿Por qué es importante el ${keywords || 'marketing digital'}?

El marketing digital se ha convertido en una herramienta esencial para cualquier negocio que busque:
- Aumentar su visibilidad online
- Conectar con su audiencia objetivo
- Generar más leads y ventas
- Competir efectivamente en el mercado actual

## Estrategias Clave para el Éxito

### 1. Optimización para Motores de Búsqueda (SEO)
El SEO sigue siendo fundamental para el éxito online. Asegúrate de:
- Usar palabras clave relevantes en tu contenido
- Crear contenido de alta calidad y valor
- Optimizar la velocidad de carga de tu sitio web

### 2. Marketing de Contenidos
Crear contenido valioso que resuelva los problemas de tu audiencia es clave para:
- Establecer autoridad en tu industria
- Mejorar tu posicionamiento en buscadores
- Generar confianza con tus clientes potenciales

## Conclusión

Implementar estas estrategias de manera consistente te ayudará a alcanzar tus objetivos de marketing digital. Recuerda que el éxito requiere tiempo, paciencia y constancia en la aplicación de estas técnicas.

¿Estás listo para llevar tu estrategia de marketing digital al siguiente nivel? ¡Comienza implementando estas prácticas hoy mismo!`);
      setIsGenerating(false);
    }, 2000);
  };

  const contentTypes = [
    { value: "blog-article", label: "Artículo de Blog" },
    { value: "product-description", label: "Descripción de Producto" },
    { value: "service-page", label: "Página de Servicio" },
    { value: "landing-page", label: "Landing Page" },
    { value: "social-post", label: "Post para Redes Sociales" }
  ];

  const keywordSuggestions = [
    "marketing digital",
    "SEO local",
    "reputación online",
    "redes sociales",
    "contenido viral",
    "estrategia digital"
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card data-testid="card-content-config">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Configuración del Contenido
            </CardTitle>
            <CardDescription>
              Define los parámetros para generar contenido optimizado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                placeholder="Ej: marketing digital, SEO local, reputación online"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                data-testid="input-keywords"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-muted-foreground">Sugerencias:</span>
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

            <Button 
              className="w-full" 
              onClick={handleGenerate}
              disabled={isGenerating || !contentType || !keywords}
              data-testid="button-generate-content"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generando Contenido...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generar con IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card data-testid="card-content-preview">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Vista Previa del Contenido
                </CardTitle>
                <CardDescription>
                  Contenido generado y optimizado para SEO
                </CardDescription>
              </div>
              {generatedContent && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-copy-content">
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Vista Previa</TabsTrigger>
                  <TabsTrigger value="markdown">Markdown</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: generatedContent.replace(/\n/g, '<br>').replace(/^# (.*$)/gim, '<h1>$1</h1>').replace(/^## (.*$)/gim, '<h2>$1</h2>').replace(/^### (.*$)/gim, '<h3>$1</h3>')
                    }}
                  />
                </TabsContent>
                <TabsContent value="markdown" className="mt-4">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    {generatedContent}
                  </pre>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configura los parámetros y genera contenido para ver la vista previa</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SEO Tips */}
      <Card data-testid="card-seo-tips">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Consejos SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-chart-2 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Palabras Clave Longtail</h4>
                <p className="text-sm text-muted-foreground">
                  Usa frases específicas de 3-4 palabras para mejor posicionamiento
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-chart-3 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Audiencia Local</h4>
                <p className="text-sm text-muted-foreground">
                  Incluye referencias geográficas y términos locales relevantes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-primary mt-1" />
              <div>
                <h4 className="font-medium mb-1">Contenido Valioso</h4>
                <p className="text-sm text-muted-foreground">
                  Resuelve problemas reales de tu audiencia objetivo
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOGenerator;