import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Clock, 
  BookOpen, 
  Users, 
  Star,
  GraduationCap,
} from "lucide-react";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string;
    thumbnail_url?: string;
    price: number;
    is_free: boolean;
    total_lessons: number;
    total_duration_minutes: number;
    enrollment_count: number;
    rating: number;
    difficulty_level: string;
    department?: string;
    instructor?: {
      full_name: string;
      photo_url?: string;
    };
  };
}

const difficultyLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: "প্রাথমিক", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  intermediate: { label: "মধ্যম", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  advanced: { label: "উচ্চতর", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

const departmentLabels: Record<string, string> = {
  hifz: "হিফজ",
  kitab: "কিতাব",
  nurani: "নূরানী",
  tajweed: "তাজবীদ",
};

export function CourseCard({ course }: CourseCardProps) {
  const difficulty = difficultyLabels[course.difficulty_level] || difficultyLabels.beginner;
  const hours = Math.floor(course.total_duration_minutes / 60);
  const minutes = course.total_duration_minutes % 60;

  return (
    <Link to={`/course/${course.id}`}>
      <Card className="h-full overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          {course.thumbnail_url ? (
            <img 
              src={course.thumbnail_url} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-primary/40" />
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 dark:bg-gray-900/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
              <Play className="w-6 h-6 text-primary ml-1" />
            </div>
          </div>

          {/* Price badge */}
          <div className="absolute top-3 right-3">
            {course.is_free ? (
              <Badge className="bg-green-500 text-white shadow-lg">ফ্রি</Badge>
            ) : (
              <Badge className="bg-primary text-primary-foreground shadow-lg">
                ৳{course.price.toLocaleString('bn-BD')}
              </Badge>
            )}
          </div>

          {/* Duration badge */}
          <Badge className="absolute bottom-3 right-3 bg-black/70 text-white">
            <Clock className="w-3 h-3 mr-1" />
            {hours > 0 ? `${hours} ঘণ্টা ${minutes} মি.` : `${minutes} মিনিট`}
          </Badge>
        </div>

        <CardContent className="p-4">
          {/* Tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className={difficulty.color}>
              {difficulty.label}
            </Badge>
            {course.department && (
              <Badge variant="secondary">
                {departmentLabels[course.department] || course.department}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {course.description}
            </p>
          )}

          {/* Instructor */}
          {course.instructor && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-secondary">
                {course.instructor.photo_url ? (
                  <img 
                    src={course.instructor.photo_url} 
                    alt={course.instructor.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-primary">
                    {course.instructor.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {course.instructor.full_name}
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t border-border">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.total_lessons} লেসন</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{course.enrollment_count}</span>
            </div>
            {course.rating > 0 && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span>{course.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
