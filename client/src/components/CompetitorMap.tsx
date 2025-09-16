import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Building2, 
  Star, 
  Phone,
  Globe,
  Eye,
  Users,
  Target,
  Layers,
  Navigation,
  TrendingUp,
  TrendingDown,
  Route,
  ExternalLink
} from "lucide-react";
import L from "leaflet";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Interfaces extending the existing Location interface
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
  latitude?: number;
  longitude?: number;
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

interface Competitor {
  id: string;
  name: string;
  address: string;
  businessType: string;
  latitude: number;
  longitude: number;
  rating?: number;
  totalReviews?: number;
  category: "direct" | "indirect" | "local";
  website?: string;
  phone?: string;
  distance?: number; // km from business location
}

interface CompetitorMapProps {
  business: Business;
  selectedLocationId?: string;
  className?: string;
}

// Mock competitor data for demonstration
const mockCompetitors: Competitor[] = [
  {
    id: "comp-1",
    name: "Ristorante Milano",
    address: "456 Roma Norte, Ciudad de México",
    businessType: "Restaurante Italiano",
    latitude: 19.4185,
    longitude: -99.1398,
    rating: 4.3,
    totalReviews: 89,
    category: "direct",
    website: "https://milanorestaurant.com",
    phone: "+1 (555) 987-6543",
    distance: 1.2
  },
  {
    id: "comp-2",
    name: "Café Central",
    address: "789 Polanco, Ciudad de México",
    businessType: "Café & Bistro",
    latitude: 19.4326,
    longitude: -99.1332,
    rating: 4.1,
    totalReviews: 156,
    category: "indirect",
    website: "https://cafecentral.mx",
    phone: "+1 (555) 456-7890",
    distance: 2.8
  },
  {
    id: "comp-3",
    name: "Trattoria Nonna",
    address: "321 Centro Histórico, Ciudad de México",
    businessType: "Restaurante Familiar",
    latitude: 19.4342,
    longitude: -99.1386,
    rating: 4.6,
    totalReviews: 234,
    category: "direct",
    website: "https://trattorianonna.com",
    distance: 0.8
  },
  {
    id: "comp-4",
    name: "Pizzeria Roma",
    address: "654 Condesa, Ciudad de México",
    businessType: "Pizzeria",
    latitude: 19.4067,
    longitude: -99.1517,
    rating: 3.9,
    totalReviews: 67,
    category: "indirect",
    phone: "+1 (555) 321-0987",
    distance: 3.5
  },
  {
    id: "comp-5",
    name: "Local Taco Shop",
    address: "987 Doctores, Ciudad de México",
    businessType: "Comida Rápida",
    latitude: 19.4195,
    longitude: -99.1438,
    rating: 4.0,
    totalReviews: 45,
    category: "local",
    distance: 1.9
  }
];

// Custom marker icons
const createCustomIcon = (color: string, type: "business" | "competitor") => {
  const svgIcon = `
    <svg width="25" height="35" viewBox="0 0 25 35" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.875 12.5 35 12.5 35S25 21.875 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="6" fill="white"/>
      <text x="12.5" y="16" text-anchor="middle" fill="${color}" font-size="10" font-weight="bold">
        ${type === "business" ? "B" : "C"}
      </text>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    iconSize: [25, 35],
    iconAnchor: [12.5, 35],
    popupAnchor: [0, -35],
    className: 'custom-marker'
  });
};

// Map center controller component
function MapCenterController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

export function CompetitorMap({ business, selectedLocationId, className }: CompetitorMapProps) {
  const [showCompetitors, setShowCompetitors] = useState(true);
  const [competitorFilter, setCompetitorFilter] = useState<"all" | "direct" | "indirect" | "local">("all");
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.4326, -99.1332]); // Mexico City default

  // Add coordinates to business locations (mock data for demonstration)
  const locationsWithCoords: Location[] = business.locations.map((location, index) => ({
    ...location,
    latitude: 19.4326 + (index * 0.01), // Spread locations around Mexico City
    longitude: -99.1332 + (index * 0.01)
  }));

  // Find selected location or use first active location
  const selectedLocation = selectedLocationId 
    ? locationsWithCoords.find(loc => loc.id === selectedLocationId)
    : locationsWithCoords.find(loc => loc.isActive) || locationsWithCoords[0];

  // Update map center when location changes
  useEffect(() => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      setMapCenter([selectedLocation.latitude, selectedLocation.longitude]);
    }
  }, [selectedLocation]);

  const filteredCompetitors = mockCompetitors.filter(competitor => {
    if (competitorFilter === "all") return true;
    return competitor.category === competitorFilter;
  });

  const getCategoryBadge = (category: string) => {
    const variants = {
      direct: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
      indirect: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      local: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
    };
    
    const labels = {
      direct: "Competidor Directo",
      indirect: "Competidor Indirecto", 
      local: "Negocio Local"
    };

    return (
      <Badge className={variants[category as keyof typeof variants]}>
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="text-xs text-muted-foreground ml-1">({rating})</span>
      </div>
    );
  };

  // Analyze competitor strengths and weaknesses
  const analyzeCompetitor = (competitor: Competitor) => {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Analyze rating
    if (competitor.rating && competitor.rating >= 4.5) {
      strengths.push("Calificación excelente");
    } else if (!competitor.rating || competitor.rating < 3.5) {
      weaknesses.push("Calificación baja");
    }

    // Analyze review volume
    if (competitor.totalReviews && competitor.totalReviews >= 100) {
      strengths.push("Gran volumen de reseñas");
    } else if (!competitor.totalReviews || competitor.totalReviews < 50) {
      weaknesses.push("Pocas reseñas");
    }

    // Analyze online presence
    if (!competitor.website) {
      weaknesses.push("Sin sitio web");
    } else {
      strengths.push("Presencia online");
    }

    if (!competitor.phone) {
      weaknesses.push("Sin teléfono público");
    }

    // Analyze proximity advantage
    if (competitor.distance && competitor.distance <= 1.0) {
      weaknesses.push("Muy cerca de tu ubicación");
    }

    return { strengths, weaknesses };
  };

  // Center map function
  const centerMap = () => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      setMapCenter([selectedLocation.latitude, selectedLocation.longitude]);
    }
  };

  // Generate Google Maps URLs
  const getGoogleMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  const getDirectionsUrl = (lat: number, lng: number) => {
    if (selectedLocation?.latitude && selectedLocation?.longitude) {
      return `https://www.google.com/maps/dir/${selectedLocation.latitude},${selectedLocation.longitude}/${lat},${lng}`;
    }
    return `https://www.google.com/maps/dir//${lat},${lng}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Map Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Mapa de Competencia
              </CardTitle>
              <CardDescription>
                Visualiza tus ubicaciones y competidores cercanos
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-competitors"
                  checked={showCompetitors}
                  onCheckedChange={setShowCompetitors}
                  data-testid="switch-show-competitors"
                />
                <Label htmlFor="show-competitors" className="text-sm">
                  Mostrar competidores
                </Label>
              </div>
              <Button variant="outline" size="sm" onClick={centerMap} data-testid="button-center-map">
                <Navigation className="h-4 w-4 mr-2" />
                Centrar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Filtrar competidores:</Label>
            </div>
            <div className="flex gap-2">
              {["all", "direct", "indirect", "local"].map((filter) => (
                <Button
                  key={filter}
                  variant={competitorFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompetitorFilter(filter as any)}
                  data-testid={`button-filter-${filter}`}
                >
                  {filter === "all" ? "Todos" : 
                   filter === "direct" ? "Directos" :
                   filter === "indirect" ? "Indirectos" : "Locales"}
                </Button>
              ))}
            </div>
          </div>

          {/* Map Legend */}
          <div className="flex items-center gap-6 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-sm">Tus ubicaciones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-sm">Competidores directos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-sm">Competidores indirectos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-sm">Negocios locales</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[500px] w-full relative overflow-hidden rounded-lg" data-testid="map-container">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              className="rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <MapCenterController center={mapCenter} />

              {/* Business Location Markers */}
              {locationsWithCoords.map((location) => (
                location.latitude && location.longitude && (
                  <Marker
                    key={`business-${location.id}`}
                    position={[location.latitude, location.longitude]}
                    icon={createCustomIcon("hsl(var(--primary))", "business")}
                  >
                    <Popup className="custom-popup">
                      <div className="space-y-3 min-w-[250px]">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{location.name}</h3>
                          <Badge variant={location.isActive ? "default" : "secondary"}>
                            {location.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {location.address}, {location.city}
                          </p>
                          
                          {location.phone && (
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {location.phone}
                            </p>
                          )}
                          
                          {location.managerName && (
                            <p className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              Manager: {location.managerName}
                            </p>
                          )}
                        </div>

                        {location.averageRating && (
                          <div className="pt-2 border-t">
                            {getRatingStars(location.averageRating)}
                            <p className="text-xs text-muted-foreground mt-1">
                              {location.totalReviews} reseñas
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-location-${location.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            Ver detalles
                          </Button>
                          {location.gmbUrl && (
                            <Button variant="outline" size="sm" className="flex-1" data-testid={`button-gmb-${location.id}`}>
                              <Globe className="h-3 w-3 mr-1" />
                              Google
                            </Button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}

              {/* Competitor Markers */}
              {showCompetitors && filteredCompetitors.map((competitor) => {
                const markerColor = competitor.category === "direct" ? "#ef4444" :
                                  competitor.category === "indirect" ? "#eab308" : "#3b82f6";
                
                return (
                  <Marker
                    key={`competitor-${competitor.id}`}
                    position={[competitor.latitude, competitor.longitude]}
                    icon={createCustomIcon(markerColor, "competitor")}
                  >
                    <Popup className="custom-popup">
                      <div className="space-y-3 min-w-[280px]">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">{competitor.name}</h3>
                          {getCategoryBadge(competitor.category)}
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <p className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {competitor.businessType}
                          </p>
                          
                          <p className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {competitor.address}
                          </p>
                          
                          {competitor.phone && (
                            <p className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {competitor.phone}
                            </p>
                          )}

                          {competitor.distance && (
                            <p className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {competitor.distance} km de distancia
                            </p>
                          )}
                        </div>

                        {competitor.rating && (
                          <div className="pt-2 border-t">
                            {getRatingStars(competitor.rating)}
                            <p className="text-xs text-muted-foreground mt-1">
                              {competitor.totalReviews || 0} reseñas
                            </p>
                          </div>
                        )}

                        {/* Strengths and Weaknesses Analysis */}
                        {(() => {
                          const analysis = analyzeCompetitor(competitor);
                          return (
                            <div className="pt-2 border-t space-y-2">
                              {analysis.strengths.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <TrendingUp className="h-3 w-3 text-green-600" />
                                    <span className="text-xs font-medium text-green-700 dark:text-green-400">Fortalezas:</span>
                                  </div>
                                  <ul className="text-xs text-muted-foreground ml-4 space-y-0.5">
                                    {analysis.strengths.map((strength, index) => (
                                      <li key={index} className="flex items-center gap-1">
                                        <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                        {strength}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {analysis.weaknesses.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <TrendingDown className="h-3 w-3 text-orange-600" />
                                    <span className="text-xs font-medium text-orange-700 dark:text-orange-400">Debilidades:</span>
                                  </div>
                                  <ul className="text-xs text-muted-foreground ml-4 space-y-0.5">
                                    {analysis.weaknesses.map((weakness, index) => (
                                      <li key={index} className="flex items-center gap-1">
                                        <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                                        {weakness}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1" 
                              onClick={() => window.open(getGoogleMapsUrl(competitor.latitude, competitor.longitude), '_blank', 'noopener,noreferrer')}
                              data-testid={`button-google-maps-${competitor.id}`}
                            >
                              <MapPin className="h-3 w-3 mr-1" />
                              Ver en Maps
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1" 
                              onClick={() => window.open(getDirectionsUrl(competitor.latitude, competitor.longitude), '_blank', 'noopener,noreferrer')}
                              data-testid={`button-directions-${competitor.id}`}
                            >
                              <Route className="h-3 w-3 mr-1" />
                              Cómo llegar
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="flex-1" data-testid={`button-analyze-competitor-${competitor.id}`}>
                              <Target className="h-3 w-3 mr-1" />
                              Analizar
                            </Button>
                            {competitor.website ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1" 
                                onClick={() => window.open(competitor.website, '_blank', 'noopener,noreferrer')}
                                data-testid={`button-competitor-website-${competitor.id}`}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Sitio web
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" className="flex-1" disabled data-testid={`button-competitor-website-${competitor.id}`}>
                                <Globe className="h-3 w-3 mr-1" />
                                Sin sitio
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Stats Summary */}
      {showCompetitors && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {filteredCompetitors.filter(c => c.category === "direct").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Competidores Directos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {filteredCompetitors.filter(c => c.category === "indirect").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Competidores Indirectos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {filteredCompetitors.filter(c => c.category === "local").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Negocios Locales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}