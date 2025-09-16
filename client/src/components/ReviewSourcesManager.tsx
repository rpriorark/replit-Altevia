import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ReviewSource, Location } from "@shared/schema";
import { 
  Plus, 
  Star, 
  Globe, 
  Facebook, 
  MapPin,
  Settings,
  Trash2,
  Calendar,
  BarChart3,
  ExternalLink
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


export default function ReviewSourcesManager() {
  const { toast } = useToast();
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<ReviewSource | null>(null);
  const [formData, setFormData] = useState({
    sourceName: '',
    sourceUrl: '',
    syncFrequency: 24,
    isActive: true
  });

  // Get locations
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/businesses/locations'],
  });

  // Get review sources for selected location
  const { data: reviewSources = [], isLoading, refetch } = useQuery<ReviewSource[]>({
    queryKey: ['/api/locations', selectedLocation, 'review-sources'],
    enabled: !!selectedLocation,
  });

  // Create review source mutation
  const createSource = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(`/api/locations/${selectedLocation}/review-sources`, {
        method: 'POST',
        data: data
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Fuente Agregada",
        description: "La fuente de reseñas se agregó correctamente.",
      });
      setIsDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar la fuente de reseñas.",
        variant: "destructive",
      });
    },
  });

  // Update review source mutation
  const updateSource = useMutation({
    mutationFn: async ({ sourceId, data }: { sourceId: string; data: any }) => {
      const response = await apiRequest(`/api/review-sources/${sourceId}`, {
        method: 'PUT',
        data: data
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Fuente Actualizada",
        description: "La fuente de reseñas se actualizó correctamente.",
      });
      setIsDialogOpen(false);
      setEditingSource(null);
      resetForm();
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la fuente de reseñas.",
        variant: "destructive",
      });
    },
  });

  // Delete review source mutation
  const deleteSource = useMutation({
    mutationFn: async (sourceId: string) => {
      await apiRequest(`/api/review-sources/${sourceId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Fuente Eliminada",
        description: "La fuente de reseñas se eliminó correctamente.",
      });
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la fuente de reseñas.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      sourceName: '',
      sourceUrl: '',
      syncFrequency: 24,
      isActive: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSource) {
      updateSource.mutate({ sourceId: editingSource.id, data: formData });
    } else {
      createSource.mutate(formData);
    }
  };

  const handleEdit = (source: ReviewSource) => {
    setEditingSource(source);
    setFormData({
      sourceName: source.sourceName,
      sourceUrl: source.sourceUrl || '',
      syncFrequency: source.syncFrequency || 24,
      isActive: source.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (sourceId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta fuente de reseñas?')) {
      deleteSource.mutate(sourceId);
    }
  };

  const getSourceIcon = (sourceName: string) => {
    switch (sourceName.toLowerCase()) {
      case 'google':
        return <Globe className="h-5 w-5 text-blue-600" />;
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-800" />;
      case 'tripadvisor':
        return <MapPin className="h-5 w-5 text-green-600" />;
      case 'yelp':
        return <Star className="h-5 w-5 text-red-600" />;
      default:
        return <Globe className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatLastSync = (lastSyncAt: Date | string | null) => {
    if (!lastSyncAt) return 'Nunca';
    const date = lastSyncAt instanceof Date ? lastSyncAt : new Date(lastSyncAt);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6" data-testid="review-sources-manager">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-review-sources">Fuentes de Reseñas</h1>
          <p className="text-muted-foreground">
            Configura las plataformas desde donde obtener reseñas
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
        <>
          {/* Add Source Button */}
          <div className="flex justify-end">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingSource(null); resetForm(); }} data-testid="button-add-source">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Fuente
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSource ? 'Editar' : 'Agregar'} Fuente de Reseñas
                  </DialogTitle>
                  <DialogDescription>
                    Configura una nueva plataforma para obtener reseñas de tu negocio.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sourceName">Plataforma</Label>
                    <Select 
                      value={formData.sourceName} 
                      onValueChange={(value) => setFormData({ ...formData, sourceName: value })}
                    >
                      <SelectTrigger data-testid="select-source-name">
                        <SelectValue placeholder="Selecciona una plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google">Google My Business</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                        <SelectItem value="yelp">Yelp</SelectItem>
                        <SelectItem value="custom">Personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sourceUrl">URL (Opcional)</Label>
                    <Input
                      id="sourceUrl"
                      type="url"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://ejemplo.com/reviews"
                      data-testid="input-source-url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="syncFrequency">Frecuencia de Sincronización (horas)</Label>
                    <Input
                      id="syncFrequency"
                      type="number"
                      min="1"
                      max="168"
                      value={formData.syncFrequency}
                      onChange={(e) => setFormData({ ...formData, syncFrequency: parseInt(e.target.value) })}
                      data-testid="input-sync-frequency"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      data-testid="switch-is-active"
                    />
                    <Label htmlFor="isActive">Fuente activa</Label>
                  </div>

                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!formData.sourceName || createSource.isPending || updateSource.isPending}
                      data-testid="button-save-source"
                    >
                      {(createSource.isPending || updateSource.isPending) ? 'Guardando...' : 'Guardar'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Review Sources List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : reviewSources.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center space-y-2">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold">No hay fuentes configuradas</h3>
                    <p className="text-muted-foreground">
                      Agrega tu primera fuente de reseñas para comenzar
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviewSources.map((source) => (
                  <Card key={source.id} data-testid={`source-${source.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getSourceIcon(source.sourceName)}
                          <div>
                            <CardTitle className="text-lg capitalize">
                              {source.sourceName}
                            </CardTitle>
                            <Badge variant={source.isActive ? 'default' : 'secondary'}>
                              {source.isActive ? 'Activa' : 'Inactiva'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(source)}
                            data-testid={`button-edit-${source.id}`}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(source.id)}
                            data-testid={`button-delete-${source.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Star className="h-3 w-3" />
                            Reseñas
                          </span>
                          <p className="font-semibold" data-testid={`total-reviews-${source.id}`}>
                            {source.totalReviews}
                          </p>
                        </div>
                        <div>
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <BarChart3 className="h-3 w-3" />
                            Promedio
                          </span>
                          <p className="font-semibold" data-testid={`average-rating-${source.id}`}>
                            {source.averageRating ? `${source.averageRating}⭐` : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Última sincronización
                        </span>
                        <p data-testid={`last-sync-${source.id}`}>
                          {formatLastSync(source.lastSyncAt)}
                        </p>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Frecuencia:</span>
                        <span className="ml-1">Cada {source.syncFrequency} horas</span>
                      </div>

                      {source.sourceUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(source.sourceUrl!, '_blank')}
                          data-testid={`button-visit-${source.id}`}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Visitar
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}