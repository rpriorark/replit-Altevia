import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Building2, 
  Star, 
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  BarChart3,
  Globe,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Target,
  Settings,
  Map
} from "lucide-react";
import { CompetitorMap } from "./CompetitorMap";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  managerName?: string;
  isActive: boolean;
  averageRating?: number;
  totalReviews: number;
  gmbUrl?: string;
}

interface Business {
  id: string;
  name: string;
  industry: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  locations: Location[];
}

export function MultiLocationDashboard() {
  // Mock data for demonstration - this would come from the API
  const mockBusiness: Business = {
    id: "1",
    name: "Bella Vista Restaurants",
    industry: "Restaurantes",
    description: "Cadena de restaurantes italianos con enfoque en comida casera auténtica",
    website: "https://bellavista.com",
    phone: "+1 (555) 123-4567",
    email: "contacto@bellavista.com",
    locations: [
      {
        id: "1",
        name: "Bella Vista Centro",
        address: "123 Main Street",
        city: "Ciudad de México",
        state: "CDMX",
        zipCode: "06600",
        phone: "+1 (555) 123-4567",
        email: "centro@bellavista.com",
        managerName: "María González",
        isActive: true,
        averageRating: 4.5,
        totalReviews: 127,
        gmbUrl: "https://goo.gl/maps/example1"
      },
      {
        id: "2",
        name: "Bella Vista Polanco",
        address: "456 Polanco Ave",
        city: "Ciudad de México",
        state: "CDMX",
        zipCode: "11560",
        phone: "+1 (555) 234-5678",
        email: "polanco@bellavista.com",
        managerName: "Carlos Rodríguez",
        isActive: true,
        averageRating: 4.7,
        totalReviews: 89,
        gmbUrl: "https://goo.gl/maps/example2"
      },
      {
        id: "3",
        name: "Bella Vista Roma Norte",
        address: "789 Roma Street",
        city: "Ciudad de México",
        state: "CDMX",
        zipCode: "06700",
        phone: "+1 (555) 345-6789",
        email: "roma@bellavista.com",
        managerName: "Ana Martínez",
        isActive: false,
        averageRating: 4.2,
        totalReviews: 34,
        gmbUrl: "https://goo.gl/maps/example3"
      }
    ]
  };

  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(mockBusiness);
  const [activeView, setActiveView] = useState<"overview" | "locations" | "performance" | "map">("overview");
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    managerName: ""
  });

  const { toast } = useToast();

  const addLocation = () => {
    if (!newLocation.name || !newLocation.address || !newLocation.city) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa al menos el nombre, dirección y ciudad.",
        variant: "destructive"
      });
      return;
    }

    // Here would be the API call to add the location
    toast({
      title: "Ubicación agregada",
      description: `La ubicación ${newLocation.name} ha sido agregada exitosamente.`
    });

    setNewLocation({
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      managerName: ""
    });
    setIsAddingLocation(false);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="text-green-600">Activo</Badge>
    ) : (
      <Badge variant="outline" className="text-red-600">Inactivo</Badge>
    );
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  const getPerformanceMetrics = () => {
    if (!selectedBusiness) return null;

    const totalReviews = selectedBusiness.locations.reduce((sum, loc) => sum + loc.totalReviews, 0);
    const avgRating = selectedBusiness.locations.reduce((sum, loc) => sum + (loc.averageRating || 0), 0) / selectedBusiness.locations.length;
    const activeLocations = selectedBusiness.locations.filter(loc => loc.isActive).length;

    return {
      totalReviews,
      avgRating: Number(avgRating.toFixed(1)),
      activeLocations,
      totalLocations: selectedBusiness.locations.length
    };
  };

  if (!selectedBusiness) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No hay negocios configurados</h2>
          <p className="text-muted-foreground">Agrega tu primer negocio para comenzar a gestionar múltiples ubicaciones.</p>
        </div>
      </div>
    );
  }

  const metrics = getPerformanceMetrics();

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full">
          <Building2 className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Multi-Location Dashboard
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              {selectedBusiness.name}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Gestión centralizada de {selectedBusiness.locations.length} ubicaciones
            </p>
          </div>
          <Button 
            onClick={() => setIsAddingLocation(true)}
            data-testid="button-add-location"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Ubicación
          </Button>
        </div>
      </div>

      {/* Business Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.totalLocations}</p>
                <p className="text-sm text-muted-foreground">Ubicaciones Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.activeLocations}</p>
                <p className="text-sm text-muted-foreground">Ubicaciones Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.avgRating}</p>
                <p className="text-sm text-muted-foreground">Calificación Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.totalReviews}</p>
                <p className="text-sm text-muted-foreground">Reseñas Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Vista General</TabsTrigger>
          <TabsTrigger value="locations" data-testid="tab-locations">Ubicaciones</TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="map" data-testid="tab-map">
            <Map className="h-4 w-4 mr-2" />
            Mapa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Business Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Información del Negocio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Industria</Label>
                  <p className="text-sm">{selectedBusiness.industry}</p>
                </div>
                
                {selectedBusiness.description && (
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <p className="text-sm text-muted-foreground">{selectedBusiness.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {selectedBusiness.website && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        Sitio Web
                      </Label>
                      <a href={selectedBusiness.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                        {selectedBusiness.website}
                      </a>
                    </div>
                  )}

                  {selectedBusiness.phone && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Teléfono
                      </Label>
                      <p className="text-sm">{selectedBusiness.phone}</p>
                    </div>
                  )}
                </div>

                {selectedBusiness.email && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm">{selectedBusiness.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start" data-testid="button-generate-seo-all">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generar SEO para todas las ubicaciones
                </Button>
                
                <Button variant="outline" className="w-full justify-start" data-testid="button-sync-reviews">
                  <Star className="mr-2 h-4 w-4" />
                  Sincronizar reseñas de Google My Business
                </Button>
                
                <Button variant="outline" className="w-full justify-start" data-testid="button-export-report">
                  <Calendar className="mr-2 h-4 w-4" />
                  Exportar reporte de rendimiento
                </Button>

                <Button variant="outline" className="w-full justify-start" data-testid="button-bulk-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración masiva
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          {/* Add Location Form */}
          {isAddingLocation && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nueva Ubicación</CardTitle>
                <CardDescription>
                  Agrega una nueva ubicación a tu negocio para gestionar su presencia digital.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locationName">Nombre de la Ubicación *</Label>
                    <Input
                      id="locationName"
                      data-testid="input-location-name"
                      placeholder="Sucursal Centro"
                      value={newLocation.name}
                      onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="managerName">Nombre del Manager</Label>
                    <Input
                      id="managerName"
                      data-testid="input-manager-name"
                      placeholder="Juan Pérez"
                      value={newLocation.managerName}
                      onChange={(e) => setNewLocation({ ...newLocation, managerName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    data-testid="input-address"
                    placeholder="123 Calle Principal"
                    value={newLocation.address}
                    onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ciudad *</Label>
                    <Input
                      id="city"
                      data-testid="input-city"
                      placeholder="Ciudad de México"
                      value={newLocation.city}
                      onChange={(e) => setNewLocation({ ...newLocation, city: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      data-testid="input-state"
                      placeholder="CDMX"
                      value={newLocation.state}
                      onChange={(e) => setNewLocation({ ...newLocation, state: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Código Postal</Label>
                    <Input
                      id="zipCode"
                      data-testid="input-zip-code"
                      placeholder="06600"
                      value={newLocation.zipCode}
                      onChange={(e) => setNewLocation({ ...newLocation, zipCode: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      data-testid="input-phone"
                      placeholder="+1 (555) 123-4567"
                      value={newLocation.phone}
                      onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      data-testid="input-email"
                      placeholder="sucursal@negocio.com"
                      value={newLocation.email}
                      onChange={(e) => setNewLocation({ ...newLocation, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={addLocation} data-testid="button-save-location">
                    Guardar Ubicación
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingLocation(false)} data-testid="button-cancel-location">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Locations List */}
          <div className="grid gap-4">
            {selectedBusiness.locations.map((location) => (
              <Card key={location.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{location.name}</h3>
                        {getStatusBadge(location.isActive)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>{location.address}</p>
                        <p>{location.city}, {location.state} {location.zipCode}</p>
                        {location.phone && <p>Tel: {location.phone}</p>}
                        {location.email && <p>Email: {location.email}</p>}
                        {location.managerName && <p>Manager: {location.managerName}</p>}
                      </div>

                      {location.averageRating && (
                        <div className="flex items-center gap-4 pt-2">
                          {getRatingStars(location.averageRating)}
                          <span className="text-sm text-muted-foreground">
                            {location.totalReviews} reseñas
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" data-testid={`button-view-${location.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${location.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`button-delete-${location.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento por Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedBusiness.locations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{location.name}</h4>
                        <p className="text-sm text-muted-foreground">{location.city}, {location.state}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{location.averageRating || 'N/A'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{location.totalReviews} reseñas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Generales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{metrics?.avgRating}</p>
                    <p className="text-sm text-muted-foreground">Calificación Promedio General</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{metrics?.activeLocations}</p>
                      <p className="text-xs text-muted-foreground">Ubicaciones Activas</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{metrics?.totalReviews}</p>
                      <p className="text-xs text-muted-foreground">Total de Reseñas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <CompetitorMap 
            business={selectedBusiness} 
            selectedLocationId={undefined}
            className="w-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}