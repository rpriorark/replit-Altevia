import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Settings as SettingsIcon, 
  User,
  Building,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  Upload
} from "lucide-react";

interface NotificationSettings {
  emailReports: boolean;
  newReviews: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
  marketingUpdates: boolean;
}

interface ProfileData {
  name: string;
  email: string;
  company: string;
  website: string;
  phone: string;
  timezone: string;
  bio: string;
}

const Settings = () => {
  // todo: remove mock functionality
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "María García",
    email: "maria@altevia.com",
    company: "Altevia",
    website: "https://altevia.com",
    phone: "+34 600 123 456",
    timezone: "Europe/Madrid",
    bio: "Especialista en marketing digital y crecimiento de negocios locales."
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailReports: true,
    newReviews: true,
    weeklyDigest: false,
    securityAlerts: true,
    marketingUpdates: false
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileUpdate = () => {
    console.log('Updating profile:', profileData);
    // Simular actualización del perfil
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      console.error('Passwords do not match');
      return;
    }
    console.log('Changing password');
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleNotificationToggle = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    console.log('Notification updated:', key, !notifications[key]);
  };

  const handleExportData = () => {
    console.log('Exporting user data');
  };

  const handleDeleteAccount = () => {
    console.log('Delete account requested');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-primary" />
          Configuración
        </h1>
        <p className="text-muted-foreground">
          Gestiona tu perfil, preferencias y configuración de la cuenta
        </p>
      </div>

      {/* Tabs de Configuración */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="company">Empresa</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card data-testid="card-profile-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información de perfil y datos de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" data-testid="button-upload-avatar">
                    <Upload className="h-4 w-4 mr-2" />
                    Cambiar Foto
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-remove-avatar">
                    Eliminar
                  </Button>
                </div>
              </div>

              {/* Formulario de Perfil */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select 
                    value={profileData.timezone} 
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger data-testid="select-timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                      <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                      <SelectItem value="America/Mexico_City">Ciudad de México (GMT-6)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  placeholder="Describe brevemente tu experiencia y especialidades..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                  data-testid="textarea-bio"
                />
              </div>

              <Button onClick={handleProfileUpdate} data-testid="button-save-profile">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card data-testid="card-company-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Información de la Empresa
              </CardTitle>
              <CardDescription>
                Configura los datos de tu empresa y marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Nombre de la Empresa</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                    data-testid="input-company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                    data-testid="input-website"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Logo de la Empresa</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                    <Building className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid="button-upload-logo">
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Logo
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-remove-logo">
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>

              <Button data-testid="button-save-company">
                <Save className="h-4 w-4 mr-2" />
                Guardar Información
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card data-testid="card-notifications">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription>
                Controla qué notificaciones deseas recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Reportes por Email</div>
                    <div className="text-sm text-muted-foreground">
                      Recibe reportes mensuales de rendimiento
                    </div>
                  </div>
                  <Switch
                    checked={notifications.emailReports}
                    onCheckedChange={() => handleNotificationToggle('emailReports')}
                    data-testid="switch-email-reports"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Nuevas Reseñas</div>
                    <div className="text-sm text-muted-foreground">
                      Notificación inmediata cuando recibas una nueva reseña
                    </div>
                  </div>
                  <Switch
                    checked={notifications.newReviews}
                    onCheckedChange={() => handleNotificationToggle('newReviews')}
                    data-testid="switch-new-reviews"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Resumen Semanal</div>
                    <div className="text-sm text-muted-foreground">
                      Resumen de actividad y métricas cada semana
                    </div>
                  </div>
                  <Switch
                    checked={notifications.weeklyDigest}
                    onCheckedChange={() => handleNotificationToggle('weeklyDigest')}
                    data-testid="switch-weekly-digest"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Alertas de Seguridad</div>
                    <div className="text-sm text-muted-foreground">
                      Notificaciones sobre actividad sospechosa en tu cuenta
                    </div>
                  </div>
                  <Switch
                    checked={notifications.securityAlerts}
                    onCheckedChange={() => handleNotificationToggle('securityAlerts')}
                    data-testid="switch-security-alerts"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Actualizaciones de Marketing</div>
                    <div className="text-sm text-muted-foreground">
                      Noticias, consejos y nuevas funcionalidades de Altevia
                    </div>
                  </div>
                  <Switch
                    checked={notifications.marketingUpdates}
                    onCheckedChange={() => handleNotificationToggle('marketingUpdates')}
                    data-testid="switch-marketing-updates"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card data-testid="card-password-change">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>
                Actualiza tu contraseña para mantener tu cuenta segura
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña Actual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="input-confirm-password"
                />
              </div>
              <Button 
                onClick={handlePasswordChange}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                data-testid="button-change-password"
              >
                <Shield className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-account-security">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad de la Cuenta
              </CardTitle>
              <CardDescription>
                Configuraciones adicionales de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-chart-2" />
                  <span className="font-medium">Autenticación de Dos Factores</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Añade una capa extra de seguridad a tu cuenta
                </p>
                <Button variant="outline" size="sm" data-testid="button-setup-2fa">
                  Configurar 2FA
                </Button>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Sesiones Activas</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Revisa y gestiona las sesiones activas en tus dispositivos
                </p>
                <Button variant="outline" size="sm" data-testid="button-manage-sessions">
                  Gestionar Sesiones
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card data-testid="card-app-preferences">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Preferencias de la Aplicación
              </CardTitle>
              <CardDescription>
                Personaliza tu experiencia en Altevia
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Idioma de la Interfaz</Label>
                  <Select defaultValue="es">
                    <SelectTrigger className="w-48" data-testid="select-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Fecha</Label>
                  <Select defaultValue="es">
                    <SelectTrigger className="w-48" data-testid="select-date-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">DD/MM/YYYY</SelectItem>
                      <SelectItem value="us">MM/DD/YYYY</SelectItem>
                      <SelectItem value="iso">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select defaultValue="eur">
                    <SelectTrigger className="w-48" data-testid="select-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-data-management">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Gestión de Datos
              </CardTitle>
              <CardDescription>
                Exporta o elimina tus datos de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Exportar Datos</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Descarga una copia completa de todos tus datos
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleExportData}
                  data-testid="button-export-data"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Datos
                </Button>
              </div>

              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Zona Peligrosa
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Eliminar tu cuenta es permanente e irreversible
                </p>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Cuenta
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;