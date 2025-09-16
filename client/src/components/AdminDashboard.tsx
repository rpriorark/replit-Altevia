import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Shield, 
  Users, 
  CreditCard, 
  Building,
  MapPin,
  TrendingUp,
  DollarSign,
  Clock,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Calendar,
  LogOut
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const adminLoginSchema = z.object({
  username: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida")
});

type AdminLoginForm = z.infer<typeof adminLoginSchema>;

interface AdminStats {
  userCount: number;
  businessCount: number;
  locationCount: number;
  activeSubscriptionCount: number;
  trialSignupCount: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

interface TrialSignup {
  id: string;
  businessName: string;
  contactEmail: string;
  phone: string | null;
  industry: string | null;
  city: string | null;
  websiteUrl: string | null;
  mainChallenges: string | null;
  trialStartDate: string;
  trialEndDate: string;
  status: string;
  notifiedAdmin: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showTrialDetails, setShowTrialDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id: string, username: string} | null>(null);

  const form = useForm<AdminLoginForm>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Check authentication status on load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await apiRequest('/api/admin/verify');
        const data = await response.json();
        setIsAuthenticated(true);
        setCurrentUser(data.user);
      } catch (error) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Admin login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginForm) => {
      const response = await apiRequest('/api/admin/login', {
        method: 'POST',
        data
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsAuthenticated(true);
      setCurrentUser(data.user);
      queryClient.invalidateQueries();
      toast({
        title: "Acceso Autorizado",
        description: "Bienvenido al panel de administración.",
      });
    },
    onError: () => {
      toast({
        title: "Error de Autenticación",
        description: "Usuario o contraseña incorrectos.",
        variant: "destructive",
      });
    },
  });

  // Admin logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('/api/admin/logout', {
        method: 'POST'
      });
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      queryClient.clear();
      toast({
        title: "Sesión Cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Error al cerrar sesión.",
        variant: "destructive",
      });
    },
  });

  // Get admin statistics
  const { data: statsResponse, isLoading: statsLoading } = useQuery<{stats: AdminStats}>({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated,
  });

  // Get trial signups
  const { data: signupsResponse, isLoading: trialsLoading } = useQuery<{signups: TrialSignup[]}>({
    queryKey: ['/api/admin/trial-signups'],
    enabled: isAuthenticated,
  });

  const stats = statsResponse?.stats;
  const trialSignups = signupsResponse?.signups || [];

  const handleLogin = (data: AdminLoginForm) => {
    loginMutation.mutate(data);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" data-testid="admin-loading">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Verificando autenticación...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Activo', variant: 'default' as const },
      expired: { label: 'Expirado', variant: 'destructive' as const },
      converted: { label: 'Convertido', variant: 'secondary' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" data-testid="admin-login">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl" data-testid="title-admin-login">Panel de Administración</CardTitle>
              <p className="text-muted-foreground">Acceso restringido - Solo administradores</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  {...form.register("username")}
                  placeholder="Ingresa tu usuario"
                  data-testid="input-username"
                />
                {form.formState.errors.username && (
                  <p className="text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="Ingresa tu contraseña"
                  data-testid="input-password"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? 'Verificando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" data-testid="admin-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-admin-dashboard">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Gestión y estadísticas del sistema Altevia
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-600">Administrador: {currentUser?.username}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="stat-users">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-users">{stats.userCount}</div>
              <p className="text-xs text-muted-foreground">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-businesses">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Negocios</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-businesses">{stats.businessCount}</div>
              <p className="text-xs text-muted-foreground">Negocios creados</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-locations">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ubicaciones</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-locations">{stats.locationCount}</div>
              <p className="text-xs text-muted-foreground">Ubicaciones totales</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-subscriptions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-subscriptions">{stats.activeSubscriptionCount}</div>
              <p className="text-xs text-muted-foreground">Clientes pagando</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-trials">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pruebas Gratis</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="count-trials">{stats.trialSignupCount}</div>
              <p className="text-xs text-muted-foreground">Usuarios en prueba</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-monthly-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="amount-monthly-revenue">
                {formatCurrency(stats.monthlyRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Mes actual</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-revenue">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="amount-total-revenue">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Histórico</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-conversion">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="conversion-rate">
                {stats.trialSignupCount > 0 
                  ? Math.round((stats.activeSubscriptionCount / stats.trialSignupCount) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Prueba a pago</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trial Signups Management */}
      <Card data-testid="trial-signups-section">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Solicitudes de Prueba Gratis
            </CardTitle>
            <Dialog open={showTrialDetails} onOpenChange={setShowTrialDetails}>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="button-view-trial-details">
                  Ver Detalles
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Detalles de Solicitudes de Prueba</DialogTitle>
                  <DialogDescription>
                    Información completa de todas las solicitudes de prueba gratis
                  </DialogDescription>
                </DialogHeader>
                
                {trialsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trialSignups.map((trial) => (
                      <Card key={trial.id} data-testid={`trial-${trial.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{trial.businessName}</CardTitle>
                              <p className="text-sm text-muted-foreground">{trial.contactEmail}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(trial.status)}
                              {!trial.notifiedAdmin && (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {trial.phone && (
                              <div>
                                <span className="font-medium">Teléfono:</span>
                                <p>{trial.phone}</p>
                              </div>
                            )}
                            {trial.industry && (
                              <div>
                                <span className="font-medium">Industria:</span>
                                <p>{trial.industry}</p>
                              </div>
                            )}
                            {trial.city && (
                              <div>
                                <span className="font-medium">Ciudad:</span>
                                <p>{trial.city}</p>
                              </div>
                            )}
                          </div>
                          
                          {trial.websiteUrl && (
                            <div className="text-sm">
                              <span className="font-medium">Sitio web:</span>
                              <a 
                                href={trial.websiteUrl} 
                                target="_blank" 
                                className="text-primary hover:underline ml-1"
                              >
                                {trial.websiteUrl}
                              </a>
                            </div>
                          )}
                          
                          {trial.mainChallenges && (
                            <div className="text-sm">
                              <span className="font-medium">Principales desafíos:</span>
                              <p className="mt-1 text-muted-foreground">{trial.mainChallenges}</p>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                            <div>
                              <span className="font-medium">Inicio de prueba:</span>
                              <p>{formatDate(trial.trialStartDate)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Fin de prueba:</span>
                              <p>{formatDate(trial.trialEndDate)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {trialsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : trialSignups.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay solicitudes de prueba registradas
            </p>
          ) : (
            <div className="space-y-3">
              {trialSignups.slice(0, 5).map((trial) => (
                <div key={trial.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`trial-preview-${trial.id}`}>
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium">{trial.businessName}</p>
                      {getStatusBadge(trial.status)}
                      {!trial.notifiedAdmin && (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trial.contactEmail} • {formatDate(trial.createdAt)}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Prueba hasta</p>
                    <p className="font-medium">{formatDate(trial.trialEndDate)}</p>
                  </div>
                </div>
              ))}
              
              {trialSignups.length > 5 && (
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Y {trialSignups.length - 5} solicitudes más...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}