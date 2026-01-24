import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  Settings,
  Youtube,
} from "lucide-react";

interface VideoPlayerProps {
  videoUrl?: string;
  youtubeUrl?: string;
  title: string;
  thumbnail?: string;
  onProgress?: (percentage: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ 
  videoUrl, 
  youtubeUrl, 
  title, 
  thumbnail,
  onProgress,
  onComplete,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match?.[1] || null;
  };

  const youtubeVideoId = youtubeUrl ? getYouTubeVideoId(youtubeUrl) : null;

  if (youtubeVideoId) {
    return (
      <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl">
        {/* YouTube Embed */}
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&showinfo=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* Video Title Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-600 text-white">
              <Youtube className="w-3 h-3 mr-1" />
              YouTube
            </Badge>
            <h3 className="text-white font-semibold text-sm line-clamp-1">
              {title}
            </h3>
          </div>
        </div>
      </div>
    );
  }

  // Native video player for uploaded videos
  if (videoUrl) {
    return (
      <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl">
        <div className="aspect-video">
          <video
            src={videoUrl}
            poster={thumbnail}
            controls
            className="w-full h-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={(e) => {
              const video = e.currentTarget;
              const percentage = (video.currentTime / video.duration) * 100;
              onProgress?.(percentage);
              if (percentage >= 90) {
                onComplete?.();
              }
            }}
          >
            আপনার ব্রাউজার ভিডিও সাপোর্ট করে না।
          </video>
        </div>

        {/* Video Title Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
          <h3 className="text-white font-semibold text-sm line-clamp-1">
            {title}
          </h3>
        </div>
      </div>
    );
  }

  // Placeholder when no video
  return (
    <Card className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
          <Play className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">ভিডিও এখনো আপলোড করা হয়নি</p>
      </div>
    </Card>
  );
}
