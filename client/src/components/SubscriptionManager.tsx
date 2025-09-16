import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  CreditCard, 
  Crown, 
  Calendar, 
  AlertCircle, 
  CheckCircle2,
  X,
  DollarSign
} from "lucide-react";
// API response types (dates come as strings from JSON)
interface SubscriptionPlanApi {
  id: string;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  interval: string;
  features: string;
  maxLocations: number | null;
  maxUsers: number | null;
  isActive: boolean;
}

interface SubscriptionApi {
  id: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlanApi;
}

interface PaymentApi {
  id: string;
  amount: string;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface CreateSubscriptionResponse {
  checkoutUrl?: string;
  id: string;
  status: string;
}

export default function SubscriptionManager() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Get subscription plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlanApi[]>({
    queryKey: ['/api/subscription-plans'],
  });

  // Get current user subscription
  const { data: subscription, isLoading: subscriptionLoading } = useQuery<SubscriptionApi | null>({
    queryKey: ['/api/users/subscription'],
  });

  // Get payment history
  const { data: payments = [], isLoading: paymentsLoading } = useQuery<PaymentApi[]>({
    queryKey: ['/api/users/payments'],
  });

  // Create subscription mutation
  const createSubscription = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiRequest('/api/subscriptions/create', {
        method: 'POST',
        data: { 
          planId,
          paymentMethodId: 'credit_card' // Mock payment method
        }
      });
      return await response.json() as CreateSubscriptionResponse;
    },
    onSuccess: (data) => {
      toast({
        title: "Suscripción Creada",
        description: "Redirigiendo a MercadoPago para completar el pago...",
      });
      
      // Redirect to MercadoPago checkout
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/users/subscription'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la suscripción. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscription = useMutation({
    mutationFn: async (subscriptionId: string) => {
      const response = await apiRequest(`/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST'
      });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Suscripción Cancelada",
        description: "Tu suscripción se cancelará al final del período actual.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/users/subscription'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo cancelar la suscripción.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    createSubscription.mutate(planId);
  };

  const handleCancel = () => {
    if (subscription?.id) {
      cancelSubscription.mutate(subscription.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      active: { label: 'Activa', variant: 'default' as const },
      trialing: { label: 'Prueba Gratis', variant: 'secondary' as const },
      past_due: { label: 'Vencida', variant: 'destructive' as const },
      cancelled: { label: 'Cancelada', variant: 'outline' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
      case 'cancelled':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (plansLoading || subscriptionLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="subscription-manager">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-subscriptions">Suscripciones</h1>
          <p className="text-muted-foreground">
            Gestiona tu plan de suscripción y historial de pagos
          </p>
        </div>
      </div>

      {/* Current Subscription Status */}
      {subscription && (
        <Card data-testid="current-subscription">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Suscripción Actual
              </CardTitle>
              {getStatusBadge(subscription?.status || '')}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">{subscription?.plan?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precio</p>
                <p className="text-lg font-semibold">
                  ${subscription?.plan?.price} {subscription?.plan?.currency}/{subscription?.plan?.interval === 'monthly' ? 'mes' : 'año'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximo Pago</p>
                <p className="text-lg font-semibold">{formatDate(subscription?.currentPeriodEnd || '')}</p>
              </div>
            </div>
            
            {subscription?.plan?.description && (
              <p className="text-muted-foreground">{subscription.plan.description}</p>
            )}
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Período: {formatDate(subscription?.currentPeriodStart || '')} - {formatDate(subscription?.currentPeriodEnd || '')}
                </span>
              </div>
            </div>

            {subscription?.status === 'active' && !subscription?.cancelAtPeriodEnd && (
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={handleCancel}
                  disabled={cancelSubscription.isPending}
                  data-testid="button-cancel-subscription"
                >
                  {cancelSubscription.isPending ? 'Cancelando...' : 'Cancelar Suscripción'}
                </Button>
              </div>
            )}

            {subscription?.cancelAtPeriodEnd && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Tu suscripción se cancelará el {formatDate(subscription?.currentPeriodEnd || '')}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      {(!subscription || subscription?.status === 'cancelled') && (
        <div>
          <h2 className="text-2xl font-bold mb-4" data-testid="title-available-plans">Planes Disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan: SubscriptionPlanApi) => (
              <Card key={plan.id} className={`relative ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`} data-testid={`plan-${plan.id}`}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">
                      {plan.currency}/{plan.interval === 'monthly' ? 'mes' : 'año'}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {JSON.parse(plan.features || '[]').map((feature: string, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Ubicaciones:</span>
                      <span className="ml-1">{plan.maxLocations || 'Ilimitadas'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Usuarios:</span>
                      <span className="ml-1">{plan.maxUsers || 'Ilimitados'}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={createSubscription.isPending && selectedPlan === plan.id}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    {createSubscription.isPending && selectedPlan === plan.id ? (
                      'Procesando...'
                    ) : (
                      'Suscribirse'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <Card data-testid="payment-history">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Historial de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay pagos registrados
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: PaymentApi) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`payment-${payment.id}`}>
                  <div className="flex items-center gap-3">
                    {getPaymentStatusIcon(payment.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">${payment.amount || '0'} {payment.currency || 'MXN'}</span>
                        <Badge variant={payment.status === 'approved' ? 'default' : 'secondary'}>
                          {payment.status === 'approved' ? 'Aprobado' : payment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payment.paidAt ? formatDate(payment.paidAt) : formatDate(payment.createdAt || '')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}