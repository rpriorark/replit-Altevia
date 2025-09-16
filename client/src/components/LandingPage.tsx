import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, TrendingUp, MessageSquare, BarChart3, Zap, Shield, Play } from "lucide-react";
import { Link } from "wouter";
import VideoPlayerModal from "@/components/VideoPlayerModal";
import heroImage from "@assets/generated_images/Hero_section_image_19f86e27.png";
import dashboardMockup from "@assets/generated_images/Dashboard_analytics_mockup_cf3ad6f5.png";
import alteviaLogo from "@assets/generated_images/Altevia_logo_design_2c146ee7.png";
import contactTeam from "@assets/generated_images/Contact_support_team_4d485b69.png";
import gradientBg from "@assets/generated_images/Gradient_background_pattern_2cd3cbce.png";
import seoIllustration from "@assets/generated_images/SEO_content_creation_f4be6e19.png";
import reviewsIllustration from "@assets/generated_images/Customer_reviews_illustration_d82b69a3.png";
import analyticsChart from "@assets/generated_images/Analytics_growth_chart_d1d69646.png";

const LandingPage = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  
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
      <section className="relative py-16 lg:py-24 overflow-hidden">
        {/* Gradient Background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${gradientBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30" data-testid="badge-beta">
                ✨ Beta Abierta
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Transforma la <span className="text-primary">visibilidad digital</span> de tu negocio local
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Plataforma integral que combina generación de contenido SEO con IA y gestión inteligente de reseñas para maximizar tu presencia online.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-primary to-primary/80 shadow-lg" data-testid="button-start-free">
                  Comenzar Gratis
                  <Zap className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 border-primary/20 hover:bg-primary/5" 
                  onClick={() => setShowVideoModal(true)}
                  data-testid="button-video"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Ver Video
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-chart-2" />
                  Sin tarjeta requerida
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-chart-3" />
                  7 días gratis
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur-lg" />
              <img 
                src={heroImage} 
                alt="Dashboard de Altevia mostrando métricas de crecimiento" 
                className="relative rounded-lg shadow-2xl border border-primary/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gradient-to-br from-secondary/20 via-background to-accent/10">
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
            <Card className="hover-elevate border-primary/20 bg-gradient-to-br from-primary/5 to-transparent" data-testid="card-seo-generator">
              <CardHeader>
                <div className="relative mb-4">
                  <img 
                    src={seoIllustration} 
                    alt="SEO Content Creation" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <CardTitle className="text-primary">Generador SEO con IA</CardTitle>
                <CardDescription>
                  Crea artículos, descripciones de productos y contenido para blogs optimizado para buscadores
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate border-chart-2/20 bg-gradient-to-br from-chart-2/5 to-transparent" data-testid="card-review-booster">
              <CardHeader>
                <div className="relative mb-4">
                  <img 
                    src={reviewsIllustration} 
                    alt="Customer Reviews" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-chart-2 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                </div>
                <CardTitle className="text-chart-2">ReviewBooster AI</CardTitle>
                <CardDescription>
                  Solicita reseñas automáticamente y responde con IA para mejorar tu reputación online
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover-elevate border-chart-3/20 bg-gradient-to-br from-chart-3/5 to-transparent" data-testid="card-reputation-dashboard">
              <CardHeader>
                <div className="relative mb-4">
                  <img 
                    src={analyticsChart} 
                    alt="Analytics Dashboard" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-chart-3 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                </div>
                <CardTitle className="text-chart-3">Dashboard de Reputación</CardTitle>
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

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                ¿Listo para transformar tu <span className="text-primary">presencia digital</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Nuestro equipo de expertos está aquí para ayudarte a maximizar tu visibilidad online. 
                Comienza tu prueba gratuita hoy mismo.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>Configuración gratuita y soporte personalizado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-chart-2 rounded-full"></div>
                  <span>Resultados visibles en los primeros 30 días</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-chart-3 rounded-full"></div>
                  <span>Soporte 24/7 con expertos en marketing digital</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80" data-testid="button-contact-sales">
                  Hablar con Ventas
                </Button>
                <Button variant="outline" size="lg" className="border-primary/20" data-testid="button-free-trial">
                  Prueba Gratuita
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur-lg" />
              <img 
                src={contactTeam} 
                alt="Equipo de soporte de Altevia" 
                className="relative rounded-lg shadow-xl border border-primary/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-gradient-to-br from-background via-muted/30 to-secondary/10">
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
            <Card className="hover-elevate border-muted bg-gradient-to-b from-card to-muted/50" data-testid="card-plan-starter">
              <CardHeader>
                <CardTitle className="text-primary">Starter</CardTitle>
                <CardDescription>Perfecto para empezar</CardDescription>
                <div className="text-3xl font-bold text-primary">$19<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full"></div> 10 contenidos SEO mensuales</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full"></div> Gestión básica de reseñas</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full"></div> Dashboard de métricas</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full"></div> Soporte por email</li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80" data-testid="button-select-starter">
                  Seleccionar Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary shadow-2xl scale-105 bg-gradient-to-b from-primary/5 to-primary/10 relative overflow-hidden" data-testid="card-plan-pro">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-chart-2 to-accent"></div>
              <CardHeader>
                <Badge className="w-fit mb-2 bg-gradient-to-r from-primary to-chart-2 text-white">✨ Más Popular</Badge>
                <CardTitle className="text-primary">Pro</CardTitle>
                <CardDescription>Para negocios en crecimiento</CardDescription>
                <div className="text-3xl font-bold text-primary">$49<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full"></div> 30 contenidos SEO mensuales</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-chart-2 rounded-full"></div> IA para respuestas automáticas</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-chart-3 rounded-full"></div> Dashboard completo + alertas</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-accent rounded-full"></div> Análisis de competidores</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-primary rounded-full"></div> Soporte prioritario</li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-primary via-chart-2 to-primary shadow-lg" data-testid="button-select-pro">
                  Seleccionar Plan
                </Button>
              </CardContent>
            </Card>

            <Card className="hover-elevate border-chart-5/30 bg-gradient-to-b from-card to-chart-5/10" data-testid="card-plan-agency">
              <CardHeader>
                <CardTitle className="text-chart-5">Agency</CardTitle>
                <CardDescription>Para agencias y múltiples ubicaciones</CardDescription>
                <div className="text-3xl font-bold text-chart-5">$99<span className="text-sm font-normal text-muted-foreground">/mes</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-chart-5 rounded-full"></div> Contenido SEO ilimitado</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-chart-5 rounded-full"></div> Gestión multiubicación</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-chart-5 rounded-full"></div> Marca blanca disponible</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-chart-5 rounded-full"></div> Reportes avanzados</li>
                  <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 bg-chart-5 rounded-full"></div> Account manager dedicado</li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-chart-5 to-chart-5/80" data-testid="button-select-agency">
                  Seleccionar Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-primary/5 via-background to-secondary/5 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <img src={alteviaLogo} alt="Altevia" className="h-8 w-8" />
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-sm -z-10"></div>
              </div>
              <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Altevia</span>
            </div>
            <p className="text-muted-foreground mb-6">
              Transformando la visibilidad digital de negocios locales
            </p>
            <div className="flex gap-8 text-sm text-muted-foreground mb-6">
              <a href="#privacy" className="hover:text-primary transition-colors">Privacidad</a>
              <a href="#terms" className="hover:text-primary transition-colors">Términos</a>
              <a href="#support" className="hover:text-primary transition-colors">Soporte</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contacto</a>
            </div>
            <div className="text-xs text-muted-foreground">
              © 2024 Altevia. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-background to-muted/50" data-testid="modal-video">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-primary">
              Descubre cómo Altevia transforma tu visibilidad digital
            </DialogTitle>
          </DialogHeader>
          <VideoPlayerModal onClose={() => setShowVideoModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;