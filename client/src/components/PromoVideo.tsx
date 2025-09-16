import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Play, Pause, Volume2, VolumeX, Maximize2, CheckCircle } from "lucide-react";
import { Link } from "wouter";

// Video analytics events
const trackVideoEvent = (event: string, data?: any) => {
  console.log('Video Analytics:', event, data);
  // En producción esto se enviaría a un servicio de analytics
};

export default function PromoVideo() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // SEO Meta Tags
  useEffect(() => {
    const originalTitle = document.title;
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Set page title
    document.title = 'Video Promocional - Altevia | SaaS de Visibilidad Digital para Empresas Locales';
    
    // Set meta description
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta');
      descriptionMeta.setAttribute('name', 'description');
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute('content', 'Descubre cómo Altevia está transformando la visibilidad digital de empresas locales en México. Mira nuestro video promocional y conoce todas las funcionalidades de nuestro SaaS integral.');
    
    // Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: 'Video Promocional - Altevia | SaaS de Visibilidad Digital' },
      { property: 'og:description', content: 'Descubre cómo Altevia transforma la visibilidad digital de empresas locales con IA, SEO automatizado y gestión integral de reseñas.' },
      { property: 'og:type', content: 'video.other' },
      { property: 'og:url', content: window.location.href },
      { property: 'og:site_name', content: 'Altevia' },
      { property: 'og:locale', content: 'es_MX' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Video Promocional - Altevia | SaaS de Visibilidad Digital' },
      { name: 'twitter:description', content: 'Mira cómo Altevia revoluciona la presencia digital de empresas locales' }
    ];
    
    const addedMetaTags: HTMLMetaElement[] = [];
    
    ogTags.forEach(tag => {
      const selector = tag.property ? `meta[property="${tag.property}"]` : `meta[name="${tag.name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (tag.property) {
          meta.setAttribute('property', tag.property);
        } else if (tag.name) {
          meta.setAttribute('name', tag.name);
        }
        document.head.appendChild(meta);
        addedMetaTags.push(meta);
      }
      
      meta.setAttribute('content', tag.content);
    });
    
    // Cleanup function
    return () => {
      document.title = originalTitle;
      if (descriptionMeta && originalDescription) {
        descriptionMeta.setAttribute('content', originalDescription);
      }
      // Remove added meta tags
      addedMetaTags.forEach(meta => {
        if (meta.parentNode) {
          meta.parentNode.removeChild(meta);
        }
      });
    };
  }, []);

  // Video demo funcional - usando Big Buck Bunny como placeholder
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        trackVideoEvent('pause', { currentTime: videoRef.current.currentTime });
      } else {
        videoRef.current.play();
        trackVideoEvent('play', { currentTime: videoRef.current.currentTime });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      trackVideoEvent('mute_toggle', { muted: !isMuted });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);

      // Track milestone events
      const milestones = [25, 50, 75, 100];
      milestones.forEach(milestone => {
        if (Math.abs(percent - milestone) < 1) {
          trackVideoEvent(`milestone_${milestone}`, { 
            currentTime: videoRef.current!.currentTime,
            duration: videoRef.current!.duration 
          });
        }
      });
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
        trackVideoEvent('fullscreen');
      }
    }
  };

  const benefits = [
    "Aumenta tu visibilidad online hasta 300%",
    "Genera contenido SEO optimizado automáticamente",
    "Gestiona todas tus reseñas desde un solo lugar",
    "Análisis de competencia con IA avanzada",
    "Dashboard multi-ubicación integrado"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl">Altevia</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/">Inicio</Link>
            </Button>
            <Button asChild data-testid="button-start-trial">
              <Link href="/">Empezar Prueba Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Video Promocional
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Descubre Altevia en Acción
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Mira cómo nuestro SaaS está transformando la visibilidad digital de empresas locales en todo México
          </p>
        </div>

        {/* Video Player */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="overflow-hidden shadow-2xl">
            <CardContent className="p-0 relative">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='24' fill='%236b7280'%3EAltevia Demo Video%3C/text%3E%3C/svg%3E"
                  className="w-full aspect-video"
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => {
                    setIsPlaying(false);
                    trackVideoEvent('ended');
                  }}
                  data-testid="video-player"
                />
                
                {/* Video Controls Overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-white/90 hover:bg-white"
                      onClick={handlePlayPause}
                      data-testid="button-play-pause"
                    >
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
                      onClick={handleMuteToggle}
                      data-testid="button-mute"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/90 hover:bg-white"
                      onClick={handleFullscreen}
                      data-testid="button-fullscreen"
                    >
                      <Maximize2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            ¿Por qué elegir Altevia?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-16" />

        {/* CTA Section */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para transformar tu negocio?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete a cientos de empresas que ya están mejorando su presencia digital con Altevia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild data-testid="button-start-free-trial">
              <Link href="/">
                Empezar Prueba Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <Link href="/">Ver Planes</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No se requiere tarjeta de crédito • Configuración en 2 minutos
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl">Altevia</span>
          </div>
          <p className="text-gray-400 mb-6">
            Transformando la visibilidad digital de empresas locales
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/" className="hover:text-blue-400 transition-colors">Términos</Link>
            <Link href="/" className="hover:text-blue-400 transition-colors">Privacidad</Link>
            <Link href="/" className="hover:text-blue-400 transition-colors">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}