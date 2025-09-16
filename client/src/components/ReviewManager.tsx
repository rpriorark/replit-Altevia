import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { renderTextSafe } from "@/lib/markdown";
import { 
  MessageSquare, 
  Star, 
  Copy, 
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Heart,
  Settings
} from "lucide-react";

export function ReviewManager() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [reviewerName, setReviewerName] = useState("");
  const [responseStyle, setResponseStyle] = useState<"professional" | "friendly" | "concise" | "detailed">("professional");
  const [includeApology, setIncludeApology] = useState(false);
  const [includeCallToAction, setIncludeCallToAction] = useState(true);
  const [customInstructions, setCustomInstructions] = useState("");
  const [generatedResponse, setGeneratedResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { toast } = useToast();

  const generateResponse = async () => {
    if (!businessName || !businessType || !reviewText) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa el nombre del negocio, tipo de negocio y texto de la reseña.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await apiRequest("POST", "/api/reviews/generate-response", {
        businessName,
        businessType,
        reviewText,
        rating,
        reviewerName: reviewerName || undefined,
        responseStyle,
        includeApology,
        includeCallToAction,
        customInstructions: customInstructions || undefined
      });

      const result = await response.json();
      setGeneratedResponse(result.response);
      toast({
        title: "Respuesta generada",
        description: "La respuesta a la reseña ha sido generada exitosamente."
      });
    } catch (error) {
      console.error("Error generating review response:", error);
      toast({
        title: "Error",
        description: "No se pudo generar la respuesta. Verifica tu configuración de OpenAI.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copiado",
        description: "El texto ha sido copiado al portapapeles."
      });
    });
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) return <ThumbsUp className="h-4 w-4 text-green-500" />;
    if (rating === 3) return <Meh className="h-4 w-4 text-yellow-500" />;
    return <ThumbsDown className="h-4 w-4 text-red-500" />;
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4) return <Badge variant="outline" className="text-green-600">Positiva</Badge>;
    if (rating === 3) return <Badge variant="outline" className="text-yellow-600">Neutral</Badge>;
    return <Badge variant="outline" className="text-red-600">Negativa</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
            AI Review Response Manager
          </span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
          Gestión Inteligente de Reseñas
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Genera respuestas profesionales y empáticas a reseñas de clientes usando IA. 
          Mejora la reputación online de tu negocio local.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Respuesta
            </CardTitle>
            <CardDescription>
              Configura los detalles de tu negocio y la reseña a responder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nombre del Negocio *</Label>
                <Input
                  id="businessName"
                  data-testid="input-business-name"
                  placeholder="Restaurante La Casa Verde"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType">Tipo de Negocio *</Label>
                <Input
                  id="businessType"
                  data-testid="input-business-type"
                  placeholder="Restaurante, Spa, Tienda, etc."
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Review Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Información de la Reseña</Label>
                {rating && getRatingBadge(rating)}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reviewText">Texto de la Reseña *</Label>
                <Textarea
                  id="reviewText"
                  data-testid="input-review-text"
                  placeholder="Escribe aquí el texto completo de la reseña del cliente..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Calificación</Label>
                  <Select value={rating.toString()} onValueChange={(value) => setRating(parseInt(value))}>
                    <SelectTrigger data-testid="select-rating">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          1 estrella
                        </div>
                      </SelectItem>
                      <SelectItem value="2">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2].map(i => (
                              <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                            ))}
                          </div>
                          2 estrellas
                        </div>
                      </SelectItem>
                      <SelectItem value="3">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3].map(i => (
                              <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                            ))}
                          </div>
                          3 estrellas
                        </div>
                      </SelectItem>
                      <SelectItem value="4">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4].map(i => (
                              <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                            ))}
                          </div>
                          4 estrellas
                        </div>
                      </SelectItem>
                      <SelectItem value="5">
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                            ))}
                          </div>
                          5 estrellas
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reviewerName">Nombre del Cliente (Opcional)</Label>
                  <Input
                    id="reviewerName"
                    data-testid="input-reviewer-name"
                    placeholder="María García"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Response Configuration */}
            <div className="space-y-4">
              <Label>Configuración de Respuesta</Label>

              <div className="space-y-2">
                <Label>Estilo de Respuesta</Label>
                <Select value={responseStyle} onValueChange={(value: "professional" | "friendly" | "concise" | "detailed") => setResponseStyle(value)}>
                  <SelectTrigger data-testid="select-response-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profesional</SelectItem>
                    <SelectItem value="friendly">Amigable</SelectItem>
                    <SelectItem value="concise">Conciso</SelectItem>
                    <SelectItem value="detailed">Detallado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeApology">Incluir disculpa (para reseñas negativas)</Label>
                  <Switch
                    id="includeApology"
                    data-testid="switch-include-apology"
                    checked={includeApology}
                    onCheckedChange={setIncludeApology}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="includeCallToAction">Incluir llamada a la acción</Label>
                  <Switch
                    id="includeCallToAction"
                    data-testid="switch-include-call-to-action"
                    checked={includeCallToAction}
                    onCheckedChange={setIncludeCallToAction}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customInstructions">Instrucciones Personalizadas (Opcional)</Label>
                <Textarea
                  id="customInstructions"
                  data-testid="input-custom-instructions"
                  placeholder="Instrucciones específicas para personalizar la respuesta..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Button 
              onClick={generateResponse} 
              disabled={isGenerating || !businessName || !businessType || !reviewText}
              className="w-full"
              data-testid="button-generate-response"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generando Respuesta...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Generar Respuesta
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Respuesta Generada
            </CardTitle>
            <CardDescription>
              Tu respuesta profesional lista para publicar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedResponse ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getRatingIcon(rating)}
                    <span className="text-sm text-muted-foreground">
                      Respuesta para reseña {rating >= 4 ? 'positiva' : rating === 3 ? 'neutral' : 'negativa'}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(generatedResponse)}
                    data-testid="button-copy-response"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-4 bg-muted rounded-lg">
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderTextSafe(generatedResponse)
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configura los detalles y genera una respuesta para ver la vista previa</p>
                <p className="text-xs mt-2">IA especializada en gestión de reputación y respuestas empáticas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20 border-none">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">Características del Gestor de Reseñas</h3>
            <p className="text-muted-foreground">Herramientas avanzadas para gestión de reputación online</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-chart-1 mt-1" />
              <div>
                <h4 className="font-medium mb-1">IA Empática</h4>
                <p className="text-sm text-muted-foreground">
                  Respuestas que muestran empatía y profesionalismo
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-chart-2 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Múltiples Estilos</h4>
                <p className="text-sm text-muted-foreground">
                  Adapta el tono según tu marca y el contexto
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="h-5 w-5 text-chart-3 mt-1" />
              <div>
                <h4 className="font-medium mb-1">Mejora Reputación</h4>
                <p className="text-sm text-muted-foreground">
                  Convierte experiencias negativas en oportunidades
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}