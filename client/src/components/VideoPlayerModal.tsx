import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Volume2, VolumeX, Maximize2, X } from "lucide-react";

// Video analytics events - Enhanced for modal usage
const trackVideoEvent = (event: string, data?: any) => {
  console.log('Video Analytics:', event, data);
  // Track modal-specific analytics
  // Use type-safe approach to check for gtag
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', event, {
      event_category: 'video_modal',
      event_label: 'altevia_demo',
      ...data
    });
  }
  // In production this would be sent to analytics service
};

interface VideoPlayerModalProps {
  onClose?: () => void;
}

export function VideoPlayerModal({ onClose }: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Using the same video URL from PromoVideo component
  const videoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  useEffect(() => {
    // Track modal open event
    trackVideoEvent('modal_opened', { 
      timestamp: new Date().toISOString(),
      source: 'landing_page'
    });

    return () => {
      // Track modal close event
      trackVideoEvent('modal_closed', { 
        timestamp: new Date().toISOString(),
        video_progress: progress,
        video_completed: progress > 95
      });
    };
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        trackVideoEvent('pause', { 
          currentTime: videoRef.current.currentTime,
          progress: progress
        });
      } else {
        videoRef.current.play();
        if (!hasStarted) {
          setHasStarted(true);
          trackVideoEvent('first_play', { timestamp: new Date().toISOString() });
        } else {
          trackVideoEvent('play', { 
            currentTime: videoRef.current.currentTime,
            progress: progress
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      trackVideoEvent('mute_toggle', { 
        muted: !isMuted,
        currentTime: videoRef.current.currentTime
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);

      // Track milestone events
      const milestones = [25, 50, 75, 90, 100];
      milestones.forEach(milestone => {
        if (Math.abs(percent - milestone) < 1 && hasStarted) {
          trackVideoEvent(`milestone_${milestone}`, { 
            currentTime: videoRef.current!.currentTime,
            duration: videoRef.current!.duration,
            percentage: percent
          });
        }
      });
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
        trackVideoEvent('fullscreen_requested', { 
          currentTime: videoRef.current.currentTime
        });
      }
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    trackVideoEvent('video_completed', { 
      duration: videoRef.current?.duration,
      completion_rate: 100
    });
  };

  return (
    <div className="relative mx-6 mb-6">
      {/* Close button */}
      <div className="absolute -top-2 -right-2 z-10">
        <Button
          variant="outline" 
          size="icon"
          className="h-8 w-8 rounded-full bg-background/80 border-primary/20 hover:bg-background"
          onClick={onClose}
          data-testid="button-close-video-modal"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Card className="overflow-hidden shadow-2xl">
        <CardContent className="p-0 relative">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='24' fill='%236b7280'%3EAltevia Demo Video%3C/text%3E%3C/svg%3E"
              className="w-full aspect-video"
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              onLoadedMetadata={() => trackVideoEvent('video_loaded')}
              onError={() => trackVideoEvent('video_error')}
              data-testid="video-modal-player"
            />
            
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={handlePlayPause}
                  data-testid="button-modal-play-pause"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={handleMuteToggle}
                  data-testid="button-modal-mute"
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg"
                  onClick={handleFullscreen}
                  data-testid="button-modal-fullscreen"
                >
                  <Maximize2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
              <div 
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${progress}%` }}
                data-testid="video-progress-bar"
              />
            </div>

            {/* Video Info Overlay (shows when not playing) */}
            {!isPlaying && !hasStarted && (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
                <div className="text-center space-y-4 text-white">
                  <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Demo de la Plataforma Altevia</h3>
                  <p className="text-white/90 max-w-md mx-auto text-sm">
                    Ve cómo nuestra plataforma transforma la presencia digital de tu negocio
                  </p>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 bg-chart-2 rounded-full"></div>
                      <span>Generación automática de contenido SEO</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 bg-chart-3 rounded-full"></div>
                      <span>Gestión inteligente de reseñas con IA</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                      <span>Dashboard de métricas en tiempo real</span>
                    </div>
                  </div>
                  <Button 
                    className="mt-6 bg-gradient-to-r from-primary to-chart-2 shadow-lg"
                    onClick={handlePlayPause}
                    data-testid="button-modal-start-video"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Reproducir Demo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default VideoPlayerModal;