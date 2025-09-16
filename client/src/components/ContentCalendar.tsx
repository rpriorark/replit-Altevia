import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Calendar as CalendarIcon,
  Plus,
  Edit,
  Check,
  X,
  Clock,
  Eye,
  Sparkles,
  Target,
  TrendingUp,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Bot,
  Settings,
  RefreshCw
} from "lucide-react";

interface ContentPost {
  id: string;
  title: string;
  content: string;
  platform: 'gmb' | 'facebook' | 'instagram' | 'blog' | 'linkedin';
  contentType: 'promotional' | 'educational' | 'engagement' | 'seasonal';
  scheduledDate: string;
  status: 'suggested' | 'approved' | 'published' | 'rejected';
  hashtags?: string[];
  keywords?: string[];
  imagePrompt?: string;
  isGenerated: boolean;
  optimalTime?: string;
}

interface ContentCalendarResponse {
  posts: Array<{
    date: string;
    platform: string;
    contentType: string;
    title: string;
    content: string;
    hashtags: string[];
    keywords: string[];
    imagePrompt?: string;
    optimalTime: string;
  }>;
  summary: {
    totalPosts: number;
    postsByPlatform: Record<string, number>;
    postsByType: Record<string, number>;
  };
}

const platformIcons = {
  gmb: Globe,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  blog: MessageSquare
};

const platformColors = {
  gmb: 'bg-blue-500',
  facebook: 'bg-blue-600',
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  linkedin: 'bg-blue-700',
  blog: 'bg-gray-600'
};

const contentTypeColors = {
  promotional: 'bg-green-100 text-green-800',
  educational: 'bg-blue-100 text-blue-800',
  engagement: 'bg-purple-100 text-purple-800',
  seasonal: 'bg-orange-100 text-orange-800'
};

export function ContentCalendar() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [selectedPost, setSelectedPost] = useState<ContentPost | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  // Get available locations - use proper URL construction
  const { data: locations = [], isLoading: isLoadingLocations, error: locationsError } = useQuery({
    queryKey: ['/api/locations'],
    staleTime: 0
  }) as { data: Array<{
    id: string;
    name: string;
    businessName: string;
    city: string;
    state: string;
  }>, isLoading: boolean, error: any };

  // Initialize selectedLocation with first available location
  useEffect(() => {
    if (locations.length > 0 && !selectedLocation) {
      setSelectedLocation(locations[0].id);
    }
  }, [locations, selectedLocation]);

  // Invalidate stale cache on mount
  useEffect(() => {
    queryClient.invalidateQueries({ 
      predicate: q => Array.isArray(q.queryKey) && q.queryKey.length > 0 && String(q.queryKey[0]).includes('/api/content-calendar/posts')
    });
  }, []);

  // Get calendar posts for current month (only if location is selected)
  // Construct proper URL that matches backend endpoint: /api/content-calendar/posts/:locationId?month=X&year=Y&platform=Z&status=W
  const postsQueryParams = new URLSearchParams();
  postsQueryParams.append('month', selectedMonth.toString());
  postsQueryParams.append('year', selectedYear.toString());
  if (filterPlatform !== 'all') postsQueryParams.append('platform', filterPlatform);
  if (filterStatus !== 'all') postsQueryParams.append('status', filterStatus);
  
  const { data: postsResponse, isLoading, error: postsError } = useQuery({
    queryKey: [`/api/content-calendar/posts/${selectedLocation}?${postsQueryParams.toString()}`],
    staleTime: 0,
    enabled: !!selectedLocation
  });
  
  // Extract posts array from response, handling both formats
  const posts = (() => {
    if (!postsResponse) return [];
    if (Array.isArray(postsResponse)) return postsResponse as ContentPost[];
    if (postsResponse && Array.isArray(postsResponse.posts)) return postsResponse.posts as ContentPost[];
    console.warn('Unexpected posts response format:', postsResponse);
    return [];
  })();

  // Generate content calendar mutation
  const generateCalendarMutation = useMutation({
    mutationFn: async (params: {
      platforms: string[];
      contentTypes?: string[];
      includeHolidays?: boolean;
      includeLocalEvents?: boolean;
      customKeywords?: string[];
    }) => {
      const response = await apiRequest('/api/content-calendar/generate', {
        method: 'POST',
        data: {
          locationId: selectedLocation,
          month: selectedMonth,
          year: selectedYear,
          ...params
        }
      });
      return (await response.json()) as ContentCalendarResponse;
    },
    onSuccess: (data) => {
      // Backend now handles saving posts automatically
      // Invalidate all content calendar queries for current location to refresh data
      queryClient.invalidateQueries({ 
        predicate: q => Array.isArray(q.queryKey) && q.queryKey.length > 0 && 
                        String(q.queryKey[0]).includes(`/api/content-calendar/posts/${selectedLocation}`)
      });
      toast({
        title: "Calendario generado",
        description: `Se generaron ${data.posts.length} publicaciones para ${getMonthName(selectedMonth)} ${selectedYear}`
      });
    },
    onError: (error) => {
      toast({
        title: "Error al generar calendario",
        description: "No se pudo generar el calendario de contenido. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  });

  // Update post status mutation
  const updatePostStatusMutation = useMutation({
    mutationFn: async ({ postId, status }: { postId: string; status: string }) => {
      const response = await apiRequest(`/api/content-calendar/posts/${postId}/status`, {
        method: 'PATCH',
        data: { postId, status }
      });
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate all content calendar queries for current location to refresh data
      queryClient.invalidateQueries({ 
        predicate: q => Array.isArray(q.queryKey) && q.queryKey.length > 0 && 
                        String(q.queryKey[0]).includes(`/api/content-calendar/posts/${selectedLocation}`)
      });
      toast({
        title: "Estado actualizado",
        description: "El estado de la publicación ha sido actualizado."
      });
    }
  });

  // Generate AI suggestions
  const generateSuggestions = async () => {
    setIsGenerating(true);
    try {
      await generateCalendarMutation.mutateAsync({
        platforms: ['gmb', 'facebook', 'instagram', 'linkedin', 'blog'],
        contentTypes: ['promotional', 'educational', 'engagement', 'seasonal'],
        includeHolidays: true,
        includeLocalEvents: true,
        customKeywords: []
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Calendar helper functions
  const getMonthName = (month: number) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month - 1];
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const getPostsForDate = (date: string) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledDate).toDateString();
      const targetDate = new Date(date).toDateString();
      return postDate === targetDate;
    });
  };

  const handleApprove = (postId: string) => {
    updatePostStatusMutation.mutate({ postId, status: 'approved' });
  };

  const handleReject = (postId: string) => {
    updatePostStatusMutation.mutate({ postId, status: 'rejected' });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Render calendar grid
  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-700"></div>
      );
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayPosts = getPostsForDate(date);
      const isToday = new Date().toDateString() === new Date(date).toDateString();
      
      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-1 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayPosts.slice(0, 2).map((post) => {
              const PlatformIcon = platformIcons[post.platform];
              return (
                <div
                  key={post.id}
                  className={`text-xs p-1 rounded cursor-pointer truncate ${
                    post.status === 'suggested' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                    post.status === 'approved' ? 'bg-green-100 dark:bg-green-900/30' :
                    post.status === 'rejected' ? 'bg-red-100 dark:bg-red-900/30' :
                    'bg-blue-100 dark:bg-blue-900/30'
                  }`}
                  onClick={() => {
                    setSelectedPost(post);
                    setIsEditDialogOpen(true);
                  }}
                  data-testid={`post-${post.id}`}
                >
                  <div className="flex items-center gap-1">
                    <PlatformIcon className="h-3 w-3" />
                    <span className="truncate">{post.title}</span>
                  </div>
                </div>
              );
            })}
            {dayPosts.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{dayPosts.length - 2} más
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  // Render post list view
  const renderPostList = () => {
    const filteredPosts = posts.filter(post => {
      if (filterPlatform !== 'all' && post.platform !== filterPlatform) return false;
      if (filterStatus !== 'all' && post.status !== filterStatus) return false;
      return true;
    });

    return (
      <div className="space-y-4">
        {filteredPosts.map((post) => {
          const PlatformIcon = platformIcons[post.platform];
          return (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`p-1 rounded ${platformColors[post.platform]} text-white`}>
                        <PlatformIcon className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold">{post.title}</h3>
                      <Badge className={contentTypeColors[post.contentType]}>{post.contentType}</Badge>
                      <Badge variant={
                        post.status === 'suggested' ? 'secondary' :
                        post.status === 'approved' ? 'default' :
                        post.status === 'rejected' ? 'destructive' : 'outline'
                      }>
                        {post.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {new Date(post.scheduledDate).toLocaleDateString('es-ES')}
                      </span>
                      {post.optimalTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.optimalTime}
                        </span>
                      )}
                      {post.isGenerated && (
                        <span className="flex items-center gap-1">
                          <Bot className="h-3 w-3" />
                          IA
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedPost(post);
                        setIsEditDialogOpen(true);
                      }}
                      data-testid={`button-edit-${post.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {post.status === 'suggested' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(post.id)}
                          data-testid={`button-approve-${post.id}`}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(post.id)}
                          data-testid={`button-reject-${post.id}`}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
            Calendario de Contenido SEO Automatizado
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Calendario de Contenido
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Planificación inteligente y automatizada con IA para todas tus plataformas
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={generateSuggestions}
              disabled={isGenerating}
              data-testid="button-generate-calendar"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Generar con IA
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                data-testid="button-prev-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold">
                {getMonthName(selectedMonth)} {selectedYear}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "calendar" | "list")}>
                <TabsList>
                  <TabsTrigger value="calendar" data-testid="tab-calendar">Calendario</TabsTrigger>
                  <TabsTrigger value="list" data-testid="tab-list">Lista</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="location-selector">Ubicación</Label>
              <Select 
                value={selectedLocation} 
                onValueChange={setSelectedLocation}
                disabled={isLoadingLocations}
              >
                <SelectTrigger data-testid="select-location">
                  <SelectValue placeholder="Selecciona una ubicación" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.businessName} - {location.name} ({location.city}, {location.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="platform-filter">Plataforma</Label>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger data-testid="select-platform-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las plataformas</SelectItem>
                  <SelectItem value="gmb">Google My Business</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="suggested">Sugerido</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calendar or List View */}
          {viewMode === 'calendar' ? (
            <div>
              <div className="grid grid-cols-7 gap-0 mb-4">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                  <div key={day} className="p-2 text-center font-semibold text-sm bg-gray-100 dark:bg-gray-800">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0 border border-gray-200 dark:border-gray-700">
                {renderCalendarGrid()}
              </div>
            </div>
          ) : (
            renderPostList()
          )}
        </CardContent>
      </Card>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Publicación</DialogTitle>
            <DialogDescription>
              Modifica el contenido de la publicación antes de aprobarla
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded ${platformColors[selectedPost.platform]} text-white`}>
                  {(() => {
                    const PlatformIcon = platformIcons[selectedPost.platform];
                    return <PlatformIcon className="h-4 w-4" />;
                  })()}
                </div>
                <span className="font-medium capitalize">{selectedPost.platform}</span>
                <Badge className={contentTypeColors[selectedPost.contentType]}>
                  {selectedPost.contentType}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="post-title">Título</Label>
                <Input 
                  id="post-title"
                  value={selectedPost.title}
                  onChange={(e) => setSelectedPost({...selectedPost, title: e.target.value})}
                  data-testid="input-post-title"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="post-content">Contenido</Label>
                <Textarea 
                  id="post-content"
                  value={selectedPost.content}
                  onChange={(e) => setSelectedPost({...selectedPost, content: e.target.value})}
                  rows={6}
                  data-testid="textarea-post-content"
                />
              </div>
              
              {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                <div className="space-y-2">
                  <Label>Hashtags</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.hashtags.map((tag, index) => (
                      <Badge key={index} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPost.imagePrompt && (
                <div className="space-y-2">
                  <Label>Prompt para imagen</Label>
                  <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 p-3 rounded">
                    {selectedPost.imagePrompt}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between">
                <div className="flex gap-2">
                  {selectedPost.status === 'suggested' && (
                    <>
                      <Button
                        onClick={() => {
                          handleApprove(selectedPost.id);
                          setIsEditDialogOpen(false);
                        }}
                        data-testid="button-approve-dialog"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Aprobar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleReject(selectedPost.id);
                          setIsEditDialogOpen(false);
                        }}
                        data-testid="button-reject-dialog"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-close-dialog"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContentCalendar;