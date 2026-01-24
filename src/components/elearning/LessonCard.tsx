import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  Lock,
  CheckCircle2,
  Video,
  Youtube,
} from "lucide-react";

interface LessonCardProps {
  lesson: {
    id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    duration_minutes?: number;
    video_type?: string;
    youtube_url?: string;
    recording_url?: string;
    is_free: boolean;
    is_premium: boolean;
    lesson_order: number;
    status?: string;
  };
  isLocked?: boolean;
  isCompleted?: boolean;
  onPlay?: () => void;
}

const videoTypeIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="w-4 h-4" />,
  upload: <Video className="w-4 h-4" />,
  live: <Video className="w-4 h-4 text-red-500" />,
};

export function LessonCard({ lesson, isLocked, isCompleted, onPlay }: LessonCardProps) {
  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const thumbnail = lesson.thumbnail_url || 
    (lesson.youtube_url ? getYouTubeThumbnail(lesson.youtube_url) : null);

  return (
    <Card 
      className={`overflow-hidden transition-all duration-200 ${
        isLocked ? 'opacity-70' : 'hover:shadow-lg cursor-pointer'
      } ${isCompleted ? 'border-green-500/50' : 'border-border'}`}
      onClick={() => !isLocked && onPlay?.()}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 aspect-video sm:aspect-auto sm:h-28 bg-gradient-to-br from-primary/20 to-accent/20 shrink-0">
          {thumbnail ? (
            <img 
              src={thumbnail}
              alt={lesson.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {videoTypeIcons[lesson.video_type || 'youtube']}
            </div>
          )}

          {/* Play/Lock overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            {isLocked ? (
              <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                <Lock className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-5 h-5 text-primary ml-0.5" />
              </div>
            )}
          </div>

          {/* Duration */}
          {lesson.duration_minutes && (
            <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
              {lesson.duration_minutes} মি.
            </Badge>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-4 flex flex-col justify-center">
          <div className="flex items-start gap-3">
            {/* Order number */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
              isCompleted 
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-secondary text-secondary-foreground'
            }`}>
              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : lesson.lesson_order}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground line-clamp-1">
                  {lesson.title}
                </h4>
                {lesson.is_free && (
                  <Badge variant="outline" className="text-green-600 border-green-500 text-xs shrink-0">
                    ফ্রি
                  </Badge>
                )}
                {lesson.is_premium && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs shrink-0">
                    প্রিমিয়াম
                  </Badge>
                )}
              </div>

              {lesson.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {lesson.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                {lesson.duration_minutes && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lesson.duration_minutes} মিনিট
                  </span>
                )}
                <span className="flex items-center gap-1">
                  {videoTypeIcons[lesson.video_type || 'youtube']}
                  {lesson.video_type === 'youtube' ? 'YouTube' : 
                   lesson.video_type === 'live' ? 'লাইভ' : 'ভিডিও'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
