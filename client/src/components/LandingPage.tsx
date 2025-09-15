import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, MessageSquare, BarChart3, Zap, Shield } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_section_image_19f86e27.png";
import dashboardMockup from "@assets/generated_images/Dashboard_analytics_mockup_cf3ad6f5.png";
import alteviaLogo from "@assets/generated_images/Altevia_logo_design_2c146ee7.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={alteviaLogo} alt="Altevia" className="h-8 w-8" />
            <span className="text-xl font-semibold">Altevia</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Características</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Precios</a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">Acerca de</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" data-testid="button-login">Iniciar Sesión</Button>
            <Button data-testid="button-signup">Comenzar Gratis</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4" data-testid="badge-beta">Beta Abierta</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Transforma la <span className="text-primary">visibilidad digital</span> de tu negocio local
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Plataforma integral que combina generación de contenido SEO con IA y gestión inteligente de reseñas para maximizar tu presencia online.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="text-lg px-8" data-testid="button-start-free">
                  Comenzar Gratis
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="text-lg px-8" data-testid="button-demo">
                  Ver Demo
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Sin tarjeta requerida
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  7 días gratis
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={heroImage} 
                alt="Dashboard de Altevia mostrando métricas de crecimiento" 
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Todo lo que necesitas para crecer
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Módulos integrados que trabajan juntos para maximizar tu visibilidad digital
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover-elevate" data-testid="card-seo-generator">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Generador SEO con IA</CardTitle>
                <CardDescription>
                  Crea artículos, descripciones de productos y contenido para blogs optimizado para buscadores
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate" data-testid="card-review-booster">
              <CardHeader>
                <div className="h-12 w-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-chart-2" />
                </div>
                <CardTitle>ReviewBooster AI</CardTitle>
                <CardDescription>
                  Solicita reseñas automáticamente y responde con IA para mejorar tu reputación online
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate" data-testid="card-reputation-dashboard">
              <CardHeader>
                <div className="h-12 w-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-chart-3" />
                </div>
                <CardTitle>Dashboard de Reputación</CardTitle>
                <CardDescription>
                  Visualiza la evolución de tus reseñas, palabras clave frecuentes y alertas en tiempo real
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Dashboard potente y fácil de usar
            </h2>
            <p className="text-xl text-muted-foreground">
              Controla toda tu estrategia de visibilidad desde una sola pantalla
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <img 
              src={dashboardMockup} 
              alt="Dashboard completo de Altevia" 
              className="rounded-lg shadow-2xl border"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Planes que se adaptan a tu negocio
            </h2>
            <p className="text-xl text-muted-foreground">
              Desde emprendedores hasta agencias, tenemos el plan perfecto para ti
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card data-testid="card-plan-starter">
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Perfecto para empezar</CardDescription>
                <div className="text-3xl font-bold">$19<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>• 10 contenidos SEO mensuales</li>
                  <li>• Gestión básica de reseñas</li>
                  <li>• Dashboard de métricas</li>
                  <li>• Soporte por email</li>
                </ul>
                <Button className="w-full" data-testid="button-select-starter">
                  Seleccionar Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary shadow-lg scale-105" data-testid="card-plan-pro">
              <CardHeader>
                <Badge className="w-fit mb-2">Más Popular</Badge>
                <CardTitle>Pro</CardTitle>
                <CardDescription>Para negocios en crecimiento</CardDescription>
                <div className="text-3xl font-bold">$49<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>• 30 contenidos SEO mensuales</li>
                  <li>• IA para respuestas automáticas</li>
                  <li>• Dashboard completo + alertas</li>
                  <li>• Análisis de competidores</li>
                  <li>• Soporte prioritario</li>
                </ul>
                <Button className="w-full" data-testid="button-select-pro">
                  Seleccionar Plan
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-plan-agency">
              <CardHeader>
                <CardTitle>Agency</CardTitle>
                <CardDescription>Para agencias y múltiples ubicaciones</CardDescription>
                <div className="text-3xl font-bold">$99<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li>• Contenido SEO ilimitado</li>
                  <li>• Gestión multiubicación</li>
                  <li>• Marca blanca disponible</li>
                  <li>• Reportes avanzados</li>
                  <li>• Account manager dedicado</li>
                </ul>
                <Button className="w-full" data-testid="button-select-agency">
                  Seleccionar Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <img src={alteviaLogo} alt="Altevia" className="h-6 w-6" />
              <span className="text-lg font-semibold">Altevia</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Transformando la visibilidad digital de negocios locales
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#privacy" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#terms" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#support" className="hover:text-foreground transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;