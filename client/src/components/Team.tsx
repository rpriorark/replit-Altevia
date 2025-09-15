import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Crown,
  Shield,
  Eye,
  Edit,
  Trash2,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  lastActive: string;
  joinedDate: string;
  avatar?: string;
  permissions: string[];
}

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  sentDate: string;
  status: 'pending' | 'expired';
}

const Team = () => {
  // todo: remove mock functionality
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");

  const teamMembers: TeamMember[] = [
    {
      id: "1",
      name: "María García",
      email: "maria@altevia.com",
      role: "owner",
      status: "active",
      lastActive: "Hace 2 minutos",
      joinedDate: "2023-01-15",
      permissions: ["all"]
    },
    {
      id: "2", 
      name: "Carlos Mendoza",
      email: "carlos@empresa.com",
      role: "admin",
      status: "active",
      lastActive: "Hace 1 hora",
      joinedDate: "2023-03-20",
      permissions: ["manage_content", "manage_reviews", "view_analytics"]
    },
    {
      id: "3",
      name: "Ana López",
      email: "ana@empresa.com", 
      role: "editor",
      status: "active",
      lastActive: "Hace 3 horas",
      joinedDate: "2023-06-10",
      permissions: ["manage_content", "manage_reviews"]
    },
    {
      id: "4",
      name: "Roberto Silva",
      email: "roberto@empresa.com",
      role: "viewer", 
      status: "inactive",
      lastActive: "Hace 2 días",
      joinedDate: "2023-09-05",
      permissions: ["view_content", "view_analytics"]
    }
  ];

  const invitations: Invitation[] = [
    {
      id: "inv_1",
      email: "nuevo@empresa.com", 
      role: "editor",
      sentDate: "2024-01-10",
      status: "pending"
    },
    {
      id: "inv_2",
      email: "colaborador@empresa.com",
      role: "viewer",
      sentDate: "2023-12-28", 
      status: "expired"
    }
  ];

  const roleConfig = {
    owner: {
      name: "Propietario",
      description: "Acceso completo a toda la cuenta",
      icon: <Crown className="h-4 w-4 text-chart-5" />,
      color: "text-chart-5"
    },
    admin: {
      name: "Administrador", 
      description: "Gestión de equipo y configuración",
      icon: <Shield className="h-4 w-4 text-primary" />,
      color: "text-primary"
    },
    editor: {
      name: "Editor",
      description: "Crear y editar contenido",
      icon: <Edit className="h-4 w-4 text-chart-2" />,
      color: "text-chart-2"
    },
    viewer: {
      name: "Visualizador",
      description: "Solo lectura de reportes", 
      icon: <Eye className="h-4 w-4 text-muted-foreground" />,
      color: "text-muted-foreground"
    }
  };

  const permissions = {
    all: "Todos los permisos",
    manage_content: "Gestionar contenido SEO",
    manage_reviews: "Gestionar reseñas",
    view_analytics: "Ver analytics",
    view_content: "Ver contenido",
    manage_team: "Gestionar equipo",
    manage_billing: "Gestionar facturación"
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': 
        return <Badge className="bg-chart-2 text-white">Activo</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-chart-3 border-chart-3">Pendiente</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const handleInvite = () => {
    console.log('Inviting user:', { email: inviteEmail, role: inviteRole });
    setInviteEmail("");
    setInviteRole("");
    setShowInviteForm(false);
  };

  const handleRemoveMember = (id: string) => {
    console.log('Removing member:', id);
  };

  const handleResendInvitation = (id: string) => {
    console.log('Resending invitation:', id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestión de Equipo
          </h1>
          <p className="text-muted-foreground">
            Administra miembros del equipo y sus permisos
          </p>
        </div>
        <Button 
          onClick={() => setShowInviteForm(true)}
          data-testid="button-invite-member"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invitar Miembro
        </Button>
      </div>

      {/* Resumen del Equipo */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card data-testid="card-total-members">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
            <div className="text-xs text-muted-foreground">
              {teamMembers.filter(m => m.status === 'active').length} activos
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-pending-invites">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invitaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invitations.filter(i => i.status === 'pending').length}
            </div>
            <div className="text-xs text-muted-foreground">Pendientes</div>
          </CardContent>
        </Card>

        <Card data-testid="card-admins">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers.filter(m => ['owner', 'admin'].includes(m.role)).length}
            </div>
            <div className="text-xs text-muted-foreground">Con permisos elevados</div>
          </CardContent>
        </Card>

        <Card data-testid="card-active-today">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Activos Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <div className="text-xs text-muted-foreground">Última actividad</div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de Invitación */}
      {showInviteForm && (
        <Card data-testid="card-invite-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitar Nuevo Miembro
            </CardTitle>
            <CardDescription>
              Envía una invitación por email para unirse al equipo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="usuario@empresa.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  data-testid="input-invite-email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Rol</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger data-testid="select-invite-role">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleInvite}
                disabled={!inviteEmail || !inviteRole}
                data-testid="button-send-invite"
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Invitación
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowInviteForm(false)}
                data-testid="button-cancel-invite"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Gestión */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="members">Miembros</TabsTrigger>
          <TabsTrigger value="invitations">Invitaciones</TabsTrigger>
          <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="hover-elevate" data-testid={`card-member-${member.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{member.name}</h4>
                          {member.role === 'owner' && (
                            <Badge className="bg-chart-5 text-white">Propietario</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            {roleConfig[member.role].icon}
                            <span className={`text-xs ${roleConfig[member.role].color}`}>
                              {roleConfig[member.role].name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {member.lastActive}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(member.status)}
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`button-edit-${member.id}`}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        {member.role !== 'owner' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            data-testid={`button-remove-${member.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm">
                      <span className="font-medium">Permisos: </span>
                      {member.permissions.map((perm, idx) => (
                        <span key={idx} className="text-muted-foreground">
                          {permissions[perm as keyof typeof permissions]}
                          {idx < member.permissions.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Miembro desde {formatDate(member.joinedDate)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card data-testid="card-pending-invitations">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invitaciones Pendientes
              </CardTitle>
              <CardDescription>
                Gestiona las invitaciones enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invitations.length > 0 ? (
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div 
                      key={invitation.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        {invitation.status === 'pending' ? (
                          <AlertCircle className="h-4 w-4 text-chart-3" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-sm text-muted-foreground">
                            Rol: {roleConfig[invitation.role].name} • 
                            Enviada: {formatDate(invitation.sentDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={invitation.status === 'pending' ? 'default' : 'outline'}
                          className={invitation.status === 'pending' ? 'bg-chart-3 text-white' : ''}
                        >
                          {invitation.status === 'pending' ? 'Pendiente' : 'Expirada'}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResendInvitation(invitation.id)}
                          data-testid={`button-resend-${invitation.id}`}
                        >
                          Reenviar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay invitaciones pendientes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(roleConfig).map(([key, role]) => (
              <Card key={key} data-testid={`card-role-${key}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {role.icon}
                    {role.name}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Permisos incluidos:</h5>
                    <ul className="text-sm space-y-1">
                      {key === 'owner' && (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Todos los permisos de la cuenta
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Gestión de facturación y plan
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Eliminar cuenta
                          </li>
                        </>
                      )}
                      {key === 'admin' && (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Gestionar equipo e invitaciones
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Acceso completo a contenido
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Ver todos los analytics
                          </li>
                        </>
                      )}
                      {key === 'editor' && (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Crear y editar contenido SEO
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Gestionar reseñas
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Ver analytics básicos
                          </li>
                        </>
                      )}
                      {key === 'viewer' && (
                        <>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Ver contenido existente
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Ver reportes y analytics
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-chart-2" />
                            Exportar reportes
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Team;