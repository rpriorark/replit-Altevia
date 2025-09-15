import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  Download, 
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Zap,
  Crown,
  Star,
  Shield
} from "lucide-react";

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
  invoiceUrl: string;
}

interface UsageData {
  category: string;
  used: number;
  total: number;
  percentage: number;
  overage?: number;
}

const Billing = () => {
  // todo: remove mock functionality
  const [currentPlan] = useState("pro");
  const [billingCycle] = useState("monthly");
  const [nextBilling] = useState(new Date("2024-02-15"));

  const planDetails = {
    starter: {
      name: "Starter",
      price: 19,
      features: [
        "10 contenidos SEO mensuales",
        "Gestión básica de reseñas", 
        "Dashboard de métricas",
        "Soporte por email"
      ]
    },
    pro: {
      name: "Pro", 
      price: 49,
      features: [
        "30 contenidos SEO mensuales",
        "IA para respuestas automáticas",
        "Dashboard completo + alertas", 
        "Análisis de competidores",
        "Soporte prioritario"
      ]
    },
    agency: {
      name: "Agency",
      price: 99, 
      features: [
        "Contenido SEO ilimitado",
        "Gestión multiubicación",
        "Marca blanca disponible",
        "Reportes avanzados", 
        "Account manager dedicado"
      ]
    }
  };

  const usageData: UsageData[] = [
    {
      category: "Contenidos SEO",
      used: 23,
      total: 30,
      percentage: 77
    },
    {
      category: "Respuestas IA",
      used: 156,
      total: 200,
      percentage: 78
    },
    {
      category: "Análisis Competidores",
      used: 8,
      total: 10,
      percentage: 80
    },
    {
      category: "Reportes Exportados",
      used: 4,
      total: 15,
      percentage: 27
    }
  ];

  const billingHistory: BillingHistory[] = [
    {
      id: "inv_001",
      date: "2024-01-15",
      amount: 49,
      status: "paid",
      plan: "Pro Plan",
      invoiceUrl: "#"
    },
    {
      id: "inv_002", 
      date: "2023-12-15",
      amount: 49,
      status: "paid",
      plan: "Pro Plan",
      invoiceUrl: "#"
    },
    {
      id: "inv_003",
      date: "2023-11-15", 
      amount: 49,
      status: "paid",
      plan: "Pro Plan",
      invoiceUrl: "#"
    },
    {
      id: "inv_004",
      date: "2023-10-15",
      amount: 19,
      status: "paid", 
      plan: "Starter Plan",
      invoiceUrl: "#"
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-chart-2" />;
      case 'pending': return <Clock className="h-4 w-4 text-chart-3" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'paid': return 'Pagada';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallida';
      default: return 'Desconocido';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch(plan) {
      case 'starter': return <Zap className="h-5 w-5 text-primary" />;
      case 'pro': return <Crown className="h-5 w-5 text-chart-2" />;
      case 'agency': return <Star className="h-5 w-5 text-chart-5" />;
      default: return <Zap className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-primary" />
            Plan y Facturación
          </h1>
          <p className="text-muted-foreground">
            Gestiona tu suscripción y revisa tu historial de pagos
          </p>
        </div>
      </div>

      {/* Plan Actual */}
      <Card data-testid="card-current-plan">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getPlanIcon(currentPlan)}
              <div>
                <CardTitle className="text-xl">
                  Plan {planDetails[currentPlan as keyof typeof planDetails].name}
                </CardTitle>
                <CardDescription>
                  Facturación {billingCycle === 'monthly' ? 'mensual' : 'anual'}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                ${planDetails[currentPlan as keyof typeof planDetails].price}
                <span className="text-sm text-muted-foreground font-normal">/mes</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Próximo cobro: {formatDate(nextBilling.toISOString().split('T')[0])}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button data-testid="button-upgrade-plan">
              <TrendingUp className="h-4 w-4 mr-2" />
              Actualizar Plan
            </Button>
            <Button variant="outline" data-testid="button-change-cycle">
              <Calendar className="h-4 w-4 mr-2" />
              Cambiar Ciclo
            </Button>
            <Button variant="outline" data-testid="button-cancel-plan">
              Cancelar Suscripción
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uso Actual */}
      <Card data-testid="card-usage">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Uso del Mes Actual
          </CardTitle>
          <CardDescription>
            Revisa tu consumo de recursos del plan Pro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {usageData.map((usage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{usage.category}</span>
                  <span className="text-sm text-muted-foreground">
                    {usage.used} / {usage.total}
                  </span>
                </div>
                <Progress 
                  value={usage.percentage} 
                  className={`h-2 ${usage.percentage > 90 ? 'bg-destructive/20' : ''}`}
                />
                {usage.percentage > 90 && (
                  <div className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Cerca del límite
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Gestión */}
      <Tabs defaultValue="plans" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Cambiar Plan</TabsTrigger>
          <TabsTrigger value="payment">Método de Pago</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(planDetails).map(([key, plan]) => (
              <Card 
                key={key} 
                className={`hover-elevate ${key === currentPlan ? 'ring-2 ring-primary shadow-lg' : ''}`}
                data-testid={`card-plan-${key}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPlanIcon(key)}
                      <CardTitle>{plan.name}</CardTitle>
                    </div>
                    {key === currentPlan && (
                      <Badge className="bg-primary text-primary-foreground">Actual</Badge>
                    )}
                  </div>
                  <CardDescription>
                    <span className="text-2xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-chart-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {key !== currentPlan && (
                    <Button className="w-full" data-testid={`button-select-${key}`}>
                      {plan.price > planDetails[currentPlan as keyof typeof planDetails].price 
                        ? 'Actualizar' : 'Cambiar'} a {plan.name}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card data-testid="card-payment-method">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Método de Pago
              </CardTitle>
              <CardDescription>
                Gestiona tu método de pago principal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center text-white text-xs font-semibold">
                    VISA
                  </div>
                  <div>
                    <div className="font-medium">•••• •••• •••• 4242</div>
                    <div className="text-sm text-muted-foreground">Expira 12/26</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-chart-2 border-chart-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Verificada
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" data-testid="button-update-payment">
                  Actualizar Tarjeta
                </Button>
                <Button variant="outline" data-testid="button-add-payment">
                  Agregar Método
                </Button>
              </div>

              <div className="p-4 bg-chart-2/10 border border-chart-2/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-chart-2" />
                  <span className="font-medium text-chart-2">Pago Seguro</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Todos los pagos están protegidos con encriptación SSL de 256 bits. 
                  No almacenamos información completa de tarjetas de crédito.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card data-testid="card-billing-history">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Historial de Facturación
                  </CardTitle>
                  <CardDescription>
                    Todas tus facturas y pagos anteriores
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" data-testid="button-download-all">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Todo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {billingHistory.map((bill) => (
                  <div 
                    key={bill.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(bill.status)}
                      <div>
                        <div className="font-medium">{bill.plan}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(bill.date)} • {bill.id}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">${bill.amount}</div>
                        <div className="text-sm text-muted-foreground">
                          {getStatusText(bill.status)}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        data-testid={`button-download-${bill.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Billing;