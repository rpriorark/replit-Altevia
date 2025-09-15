import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Star, 
  Send, 
  Filter,
  Search,
  Sparkles,
  ThumbsUp,
  Clock,
  ExternalLink
} from "lucide-react";

interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
  platform: string;
  status: 'pending' | 'responded' | 'escalated';
  sentiment: 'positive' | 'neutral' | 'negative';
}

const ReviewsManager = () => {
  // todo: remove mock functionality
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  const reviews: Review[] = [
    {
      id: 1,
      author: "María González",
      rating: 5,
      text: "Excelente servicio, muy recomendado. El equipo es muy profesional y la atención al cliente es excepcional. Volveré sin duda.",
      date: "2024-01-15",
      platform: "Google",
      status: "pending",
      sentiment: "positive"
    },
    {
      id: 2,
      author: "Carlos Mendoza",
      rating: 4,
      text: "Muy buena atención y rapidez en la respuesta. Solo mejoraría un poco los tiempos de espera, pero en general muy satisfecho.",
      date: "2024-01-14",
      platform: "TripAdvisor",
      status: "responded",
      sentiment: "positive"
    },
    {
      id: 3,
      author: "Ana López",
      rating: 2,
      text: "El servicio no cumplió mis expectativas. Tuve que esperar mucho tiempo y la atención no fue la mejor. Espero mejoren.",
      date: "2024-01-13",
      platform: "Google",
      status: "escalated",
      sentiment: "negative"
    },
    {
      id: 4,
      author: "Roberto Silva",
      rating: 5,
      text: "Superó mis expectativas. El producto es de excelente calidad y la entrega fue muy rápida. Definitivamente volveré a comprar.",
      date: "2024-01-12",
      platform: "Facebook",
      status: "responded",
      sentiment: "positive"
    },
    {
      id: 5,
      author: "Carmen Torres",
      rating: 3,
      text: "Está bien, pero podría mejorar. El servicio es correcto pero nada excepcional. Los precios son justos.",
      date: "2024-01-11",
      platform: "Google",
      status: "pending",
      sentiment: "neutral"
    }
  ];

  const generateAIResponse = (review: Review) => {
    console.log('Generating AI response for review:', review.id);
    setIsGeneratingResponse(true);
    
    setTimeout(() => {
      let response = "";
      
      if (review.sentiment === "positive") {
        response = `¡Hola ${review.author}! 😊

Muchas gracias por tomarte el tiempo de compartir tu experiencia con nosotros. Nos llena de alegría saber que nuestro servicio superó tus expectativas y que te sentiste bien atendido/a.

Comentarios como el tuyo nos motivan a seguir mejorando cada día y a mantener nuestro compromiso con la excelencia en el servicio.

¡Esperamos verte pronto de nuevo!

Saludos cordiales,
El equipo de [Nombre del Negocio]`;
      } else if (review.sentiment === "negative") {
        response = `Hola ${review.author},

Lamentamos profundamente que tu experiencia no haya sido la esperada. Valoramos mucho tu feedback y queremos hacer las cosas bien.

Nos gustaría ponernos en contacto contigo para entender mejor lo sucedido y poder solucionarlo. Te enviaremos un mensaje privado para que podamos conversar y mejorar tu experiencia.

Tu opinión es muy importante para nosotros y nos ayuda a crecer.

Atentamente,
El equipo de [Nombre del Negocio]`;
      } else {
        response = `Hola ${review.author},

Gracias por compartir tu opinión con nosotros. Valoramos todos los comentarios, ya que nos ayudan a seguir mejorando.

Trabajamos constantemente para brindar el mejor servicio posible y esperamos poder sorprenderte positivamente en tu próxima visita.

¡Gracias por elegirnos!

Saludos,
El equipo de [Nombre del Negocio]`;
      }
      
      setAiResponse(response);
      setIsGeneratingResponse(false);
    }, 1500);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = filterStatus === "all" || review.status === filterStatus;
    const matchesPlatform = filterPlatform === "all" || review.platform === filterPlatform;
    const matchesSearch = review.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesPlatform && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "outline", text: "Pendiente", color: "text-chart-3" },
      responded: { variant: "default", text: "Respondida", color: "text-chart-2" },
      escalated: { variant: "destructive", text: "Escalada", color: "text-destructive" }
    };
    
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getSentimentIcon = (sentiment: string) => {
    if (sentiment === "positive") return "😊";
    if (sentiment === "negative") return "😞";
    return "😐";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-primary" />
          Gestión de Reseñas
        </h1>
        <p className="text-muted-foreground">
          Administra y responde a las reseñas de tus clientes con IA
        </p>
      </div>

      {/* Filters */}
      <Card data-testid="card-filters">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por autor o contenido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-reviews"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-status">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="responded">Respondidas</SelectItem>
                <SelectItem value="escalated">Escaladas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-filter-platform">
                <SelectValue placeholder="Plataforma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las plataformas</SelectItem>
                <SelectItem value="Google">Google</SelectItem>
                <SelectItem value="TripAdvisor">TripAdvisor</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reviews List */}
        <Card data-testid="card-reviews-list">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Reseñas ({filteredReviews.length})</span>
              <Button variant="outline" size="sm" data-testid="button-request-reviews">
                <Send className="h-4 w-4 mr-2" />
                Solicitar Reseñas
              </Button>
            </CardTitle>
            <CardDescription>
              Haz clic en una reseña para responder con IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className={`border rounded-lg p-4 cursor-pointer hover-elevate transition-colors ${
                  selectedReview?.id === review.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedReview(review)}
                data-testid={`review-item-${review.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{review.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{review.author}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{review.platform}</Badge>
                        <span className="text-xs">{getSentimentIcon(review.sentiment)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                    {getStatusBadge(review.status)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{review.text}</p>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {review.date}
                  </span>
                  {review.status === 'responded' && (
                    <span className="flex items-center gap-1 text-chart-2">
                      <ThumbsUp className="h-3 w-3" />
                      Respondida
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Response Panel */}
        <Card data-testid="card-response-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Respuesta Inteligente
            </CardTitle>
            <CardDescription>
              {selectedReview ? `Responder a ${selectedReview.author}` : 'Selecciona una reseña para responder'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedReview ? (
              <>
                {/* Selected Review Display */}
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{selectedReview.author}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < selectedReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm">{selectedReview.text}</p>
                  <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                    <span>{selectedReview.platform}</span>
                    <Button variant="ghost" size="sm" data-testid="button-view-original">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver original
                    </Button>
                  </div>
                </div>

                {/* AI Response Generation */}
                <div className="space-y-4">
                  <Button 
                    onClick={() => generateAIResponse(selectedReview)}
                    disabled={isGeneratingResponse}
                    className="w-full"
                    data-testid="button-generate-ai-response"
                  >
                    {isGeneratingResponse ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generando respuesta...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generar Respuesta con IA
                      </>
                    )}
                  </Button>

                  {aiResponse && (
                    <div className="space-y-4">
                      <Textarea
                        value={aiResponse}
                        onChange={(e) => setAiResponse(e.target.value)}
                        rows={8}
                        placeholder="La respuesta generada aparecerá aquí..."
                        data-testid="textarea-ai-response"
                      />
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          data-testid="button-send-response"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Enviar Respuesta
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => generateAIResponse(selectedReview)}
                          data-testid="button-regenerate-response"
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecciona una reseña de la lista para generar una respuesta inteligente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewsManager;