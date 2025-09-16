import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Plus, 
  Calendar, 
  MapPin, 
  Edit2,
  Trash2,
  Send,
  Eye,
  BarChart3,
  Clock,
  CheckCircle2
} from "lucide-react";
import type { GmbPost, Location } from "@shared/schema";

const createGmbPostSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().min(1, "El contenido es requerido").max(1500),
  postType: z.enum(["offer", "event", "product", "standard"]).default("standard"),
  callToAction: z.enum(["learn_more", "call", "order", "book"]).optional(),
  buttonUrl: z.string().url("URL válida requerida").optional().or(z.literal("")),
  imageUrl: z.string().url("URL válida requerida").optional().or(z.literal("")),
  scheduledDate: z.string().optional()
});

type GmbPostForm = z.infer<typeof createGmbPostSchema>;

export default function GmbPostCreator() {
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [editingPost, setEditingPost] = useState<GmbPost | null>(null);

  const form = useForm<GmbPostForm>({
    resolver: zodResolver(createGmbPostSchema),
    defaultValues: {
      title: "",
      content: "",
      postType: "standard",
      callToAction: undefined,
      buttonUrl: "",
      imageUrl: "",
      scheduledDate: ""
    }
  });

  // Get locations
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/businesses/locations'],
  });

  // Get GMB posts for selected location
  const { data: gmbPosts = [], isLoading, refetch } = useQuery<GmbPost[]>({
    queryKey: ['/api/locations', selectedLocation, 'gmb-posts'],
    enabled: !!selectedLocation,
  });

  // Create GMB post mutation
  const createPost = useMutation({
    mutationFn: async (data: GmbPostForm) => {
      const response = await apiRequest(`/api/locations/${selectedLocation}/gmb-posts`, {
        method: 'POST',
        data
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Post Creado",
        description: "El post de Google My Business se creó correctamente.",
      });
      form.reset();
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el post de GMB.",
        variant: "destructive",
      });
    },
  });

  // Update GMB post mutation
  const updatePost = useMutation({
    mutationFn: async ({ postId, data }: { postId: string; data: Partial<GmbPostForm> }) => {
      const response = await apiRequest(`/api/gmb-posts/${postId}`, {
        method: 'PUT',
        data
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Post Actualizado",
        description: "El post se actualizó correctamente.",
      });
      setEditingPost(null);
      form.reset();
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el post.",
        variant: "destructive",
      });
    },
  });

  // Publish GMB post mutation
  const publishPost = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest(`/api/gmb-posts/${postId}/publish`, {
        method: 'POST'
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Post Publicado",
        description: "El post se publicó en Google My Business.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo publicar el post.",
        variant: "destructive",
      });
    },
  });

  // Delete GMB post mutation
  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      await apiRequest(`/api/gmb-posts/${postId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Post Eliminado",
        description: "El post se eliminó correctamente.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el post.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: GmbPostForm) => {
    if (editingPost) {
      updatePost.mutate({ postId: editingPost.id, data });
    } else {
      createPost.mutate(data);
    }
  };

  const handleEdit = (post: GmbPost) => {
    setEditingPost(post);
    form.reset({
      title: post.title || "",
      content: post.content,
      postType: post.postType as "offer" | "event" | "product" | "standard",
      callToAction: post.callToAction as "learn_more" | "call" | "order" | "book" | undefined,
      buttonUrl: post.buttonUrl || "",
      imageUrl: post.imageUrl || "",
      scheduledDate: post.scheduledDate ? new Date(post.scheduledDate).toISOString().slice(0, 16) : ""
    });
  };

  const handleCancelEdit = () => {
    setEditingPost(null);
    form.reset();
  };

  const handleDelete = (postId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
      deletePost.mutate(postId);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      draft: { label: 'Borrador', variant: 'secondary' as const },
      scheduled: { label: 'Programado', variant: 'default' as const },
      published: { label: 'Publicado', variant: 'default' as const },
      failed: { label: 'Error', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPostTypeLabel = (type: string) => {
    const typeMap = {
      standard: 'Estándar',
      offer: 'Oferta',
      event: 'Evento',
      product: 'Producto'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6" data-testid="gmb-post-creator">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-gmb-posts">Posts de Google My Business</h1>
          <p className="text-muted-foreground">
            Crea y gestiona posts para tu perfil de Google My Business
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create/Edit Post Form */}
          <Card data-testid="post-form">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingPost ? 'Editar Post' : 'Crear Nuevo Post'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título (Opcional)</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Título del post"
                    data-testid="input-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Contenido *</Label>
                  <Textarea
                    id="content"
                    {...form.register("content")}
                    placeholder="Escribe el contenido de tu post..."
                    rows={4}
                    data-testid="textarea-content"
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-600">{form.formState.errors.content.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postType">Tipo de Post</Label>
                    <Select 
                      value={form.watch("postType")} 
                      onValueChange={(value) => form.setValue("postType", value as any)}
                    >
                      <SelectTrigger data-testid="select-post-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Estándar</SelectItem>
                        <SelectItem value="offer">Oferta</SelectItem>
                        <SelectItem value="event">Evento</SelectItem>
                        <SelectItem value="product">Producto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="callToAction">Llamada a la Acción</Label>
                    <Select 
                      value={form.watch("callToAction") || ""} 
                      onValueChange={(value) => form.setValue("callToAction", value as any)}
                    >
                      <SelectTrigger data-testid="select-call-to-action">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Ninguna</SelectItem>
                        <SelectItem value="learn_more">Saber Más</SelectItem>
                        <SelectItem value="call">Llamar</SelectItem>
                        <SelectItem value="order">Ordenar</SelectItem>
                        <SelectItem value="book">Reservar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buttonUrl">URL del Botón (Opcional)</Label>
                  <Input
                    id="buttonUrl"
                    type="url"
                    {...form.register("buttonUrl")}
                    placeholder="https://ejemplo.com"
                    data-testid="input-button-url"
                  />
                  {form.formState.errors.buttonUrl && (
                    <p className="text-sm text-red-600">{form.formState.errors.buttonUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de Imagen (Opcional)</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    {...form.register("imageUrl")}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    data-testid="input-image-url"
                  />
                  {form.formState.errors.imageUrl && (
                    <p className="text-sm text-red-600">{form.formState.errors.imageUrl.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Fecha de Programación (Opcional)</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    {...form.register("scheduledDate")}
                    data-testid="input-scheduled-date"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createPost.isPending || updatePost.isPending}
                    data-testid="button-save-post"
                  >
                    {createPost.isPending || updatePost.isPending ? (
                      'Guardando...'
                    ) : editingPost ? (
                      'Actualizar Post'
                    ) : (
                      'Crear Post'
                    )}
                  </Button>
                  
                  {editingPost && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelEdit}
                      data-testid="button-cancel-edit"
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Posts List */}
          <Card data-testid="posts-list">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Posts Creados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : gmbPosts.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold">No hay posts creados</h3>
                  <p className="text-muted-foreground">
                    Crea tu primer post para Google My Business
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {gmbPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-3" data-testid={`post-${post.id}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(post.status)}
                            <Badge variant="outline">{getPostTypeLabel(post.postType)}</Badge>
                          </div>
                          {post.title && (
                            <h4 className="font-semibold mb-1" data-testid={`post-title-${post.id}`}>
                              {post.title}
                            </h4>
                          )}
                          <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`post-content-${post.id}`}>
                            {post.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(post)}
                            data-testid={`button-edit-${post.id}`}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          {post.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => publishPost.mutate(post.id)}
                              disabled={publishPost.isPending}
                              data-testid={`button-publish-${post.id}`}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(post.id)}
                            data-testid={`button-delete-${post.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Post metadata */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {post.scheduledDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Programado: {formatDate(post.scheduledDate)}</span>
                          </div>
                        )}
                        {post.publishedDate && (
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Publicado: {formatDate(post.publishedDate)}</span>
                          </div>
                        )}
                        {post.status === 'published' && (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{post.views} vistas</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              <span>{post.clicks} clics</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}