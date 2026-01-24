import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Trash2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  value?: string | null;
  onPhotoChange?: (url: string | null) => void;
  onChange?: (url: string | null) => void;
  folder: "students" | "teachers" | "alumni" | "institution";
  entityId?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
};

export function PhotoUpload({
  currentPhotoUrl,
  value,
  onPhotoChange,
  onChange,
  folder,
  entityId,
  size = "md",
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const initialUrl = value || currentPhotoUrl || null;
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (url: string | null) => {
    if (onChange) onChange(url);
    if (onPhotoChange) onPhotoChange(url);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "শুধুমাত্র ছবি আপলোড করুন", variant: "destructive" });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "ছবি ২MB এর কম হতে হবে", variant: "destructive" });
      return;
    }

    setUploading(true);

    try {
      // Create a unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${entityId || Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      handleChange(publicUrl);
      toast({ title: "ছবি আপলোড হয়েছে" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({ 
        title: "আপলোড সমস্যা", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (previewUrl) {
      // Extract file path from URL
      const urlParts = previewUrl.split("/photos/");
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from("photos").remove([filePath]);
      }
    }
    setPreviewUrl(null);
    handleChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} border-2 border-border`}>
          <AvatarImage src={previewUrl || undefined} className="object-cover" />
          <AvatarFallback className="bg-muted">
            <User className="w-1/2 h-1/2 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Camera className="w-4 h-4 mr-1" />
          {previewUrl ? "পরিবর্তন" : "ছবি আপলোড"}
        </Button>
        
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemovePhoto}
            disabled={uploading}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
