import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Rocket, 
  CheckCircle2, 
  Clock, 
  Star,
  Globe,
  Users,
  Zap
} from "lucide-react";

const trialSignupSchema = z.object({
  businessName: z.string().min(1, "Nombre del negocio es requerido").max(255),
  contactEmail: z.string().email("Email válido es requerido"),
  phone: z.string().max(20).optional(),
  industry: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  websiteUrl: z.string().url("URL válida requerida").optional().or(z.literal("")),
  currentReviewPlatforms: z.array(z.string()).optional(),
  mainChallenges: z.string().max(1000).optional(),
  heardAboutUs: z.string().max(100).optional(),
  acceptTerms: z.boolean().refine(val => val, "Debes aceptar los términos y condiciones")
});

type TrialSignupForm = z.infer<typeof trialSignupSchema>;

export default function TrialSignup() {
  const { toast } = useToast();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<TrialSignupForm>({
    resolver: zodResolver(trialSignupSchema),
    defaultValues: {
      businessName: "",
      contactEmail: "",
      phone: "",
      industry: "",
      city: "",
      websiteUrl: "",
      currentReviewPlatforms: [],
      mainChallenges: "",
      heardAboutUs: "",
      acceptTerms: false
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: TrialSignupForm) => {
      const response = await apiRequest('/api/trial-signup', {
        method: 'POST',
        data: {
          ...data,
          currentReviewPlatforms: selectedPlatforms
        }
      });
      return response;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "¡Registro Exitoso!",
        description: "Tu prueba gratis de 14 días ha comenzado. Revisa tu email para más información.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar tu registro. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const reviewPlatforms = [
    { id: 'google', label: 'Google My Business' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'tripadvisor', label: 'TripAdvisor' },
    { id: 'yelp', label: 'Yelp' },
    { id: 'other', label: 'Otros' }
  ];

  const industries = [
    'Restaurantes y Comida',
    'Salud y Bienestar',
    'Belleza y Estética',
    'Retail y Comercio',
    'Servicios Profesionales',
    'Turismo y Hotelería',
    'Automotriz',
    'Inmobiliaria',
    'Tecnología',
    'Otro'
  ];

  const hearAboutUsOptions = [
    'Búsqueda en Google',
    'Redes Sociales',
    'Recomendación',
    'Publicidad Online',
    'Otro'
  ];

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    if (checked) {
      setSelectedPlatforms(prev => [...prev, platformId]);
    } else {
      setSelectedPlatforms(prev => prev.filter(id => id !== platformId));
    }
  };

  const onSubmit = (data: TrialSignupForm) => {
    signupMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6" data-testid="trial-success">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold" data-testid="title-success">¡Registro Exitoso!</h2>
              <p className="text-lg text-muted-foreground">
                Tu prueba gratis de 14 días ha comenzado
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Hemos enviado un email de bienvenida a tu correo con los siguientes pasos.
                </p>
                <p className="text-sm text-muted-foreground">
                  También hemos notificado a nuestro equipo para que puedan ayudarte a sacar el máximo provecho de Altevia.
                </p>
              </div>
              <div className="pt-4">
                <Button onClick={() => window.location.href = '/dashboard'} data-testid="button-go-dashboard">
                  Ir al Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="trial-signup">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <div className="p-3 bg-primary/10 rounded-full">
            <Rocket className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight" data-testid="title-trial">
          Comienza tu Prueba Gratis de 14 Días
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Mejora la visibilidad digital de tu negocio con herramientas de IA para SEO, gestión de reseñas y análisis de competencia
        </p>
      </div>

      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">IA para SEO Local</h3>
            <p className="text-sm text-muted-foreground">
              Genera contenido optimizado para tu ubicación automáticamente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Gestión de Reseñas</h3>
            <p className="text-sm text-muted-foreground">
              Respuestas inteligentes y monitoreo automático de reputación
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Análisis de Competencia</h3>
            <p className="text-sm text-muted-foreground">
              Conoce cómo te comparas con tu competencia local
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Signup Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Información de tu Negocio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nombre del Negocio *</Label>
                <Input
                  id="businessName"
                  {...form.register("businessName")}
                  placeholder="Ej: Restaurante La Vista"
                  data-testid="input-business-name"
                />
                {form.formState.errors.businessName && (
                  <p className="text-sm text-red-600">{form.formState.errors.businessName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email de Contacto *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...form.register("contactEmail")}
                  placeholder="contacto@negocio.com"
                  data-testid="input-contact-email"
                />
                {form.formState.errors.contactEmail && (
                  <p className="text-sm text-red-600">{form.formState.errors.contactEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="+52 55 1234 5678"
                  data-testid="input-phone"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="Ciudad de México"
                  data-testid="input-city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industria</Label>
                <select
                  id="industry"
                  {...form.register("industry")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  data-testid="select-industry"
                >
                  <option value="">Selecciona una industria</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Sitio Web</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  {...form.register("websiteUrl")}
                  placeholder="https://www.negocio.com"
                  data-testid="input-website-url"
                />
                {form.formState.errors.websiteUrl && (
                  <p className="text-sm text-red-600">{form.formState.errors.websiteUrl.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>¿En qué plataformas tienes reseñas actualmente?</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {reviewPlatforms.map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform.id}
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={(checked) => handlePlatformChange(platform.id, !!checked)}
                      data-testid={`checkbox-platform-${platform.id}`}
                    />
                    <Label htmlFor={platform.id} className="text-sm">
                      {platform.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mainChallenges">¿Cuáles son tus principales desafíos con la visibilidad online?</Label>
              <Textarea
                id="mainChallenges"
                {...form.register("mainChallenges")}
                placeholder="Ej: Pocas reseñas online, baja visibilidad en Google, competencia fuerte..."
                rows={3}
                data-testid="textarea-main-challenges"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heardAboutUs">¿Cómo supiste de Altevia?</Label>
              <select
                id="heardAboutUs"
                {...form.register("heardAboutUs")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="select-heard-about-us"
              >
                <option value="">Selecciona una opción</option>
                {hearAboutUsOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                {...form.register("acceptTerms")}
                data-testid="checkbox-accept-terms"
              />
              <Label htmlFor="acceptTerms" className="text-sm">
                Acepto los{" "}
                <a href="/terms" target="_blank" className="text-primary hover:underline">
                  términos y condiciones
                </a>{" "}
                y la{" "}
                <a href="/privacy" target="_blank" className="text-primary hover:underline">
                  política de privacidad
                </a>
              </Label>
            </div>
            {form.formState.errors.acceptTerms && (
              <p className="text-sm text-red-600">{form.formState.errors.acceptTerms.message}</p>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">14 días gratis, sin compromiso</p>
                  <p className="text-sm text-muted-foreground">
                    Cancela en cualquier momento. No se requiere tarjeta de crédito.
                  </p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={signupMutation.isPending}
                data-testid="button-start-trial"
              >
                {signupMutation.isPending ? (
                  'Procesando...'
                ) : (
                  'Comenzar Prueba Gratis'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}