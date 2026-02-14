
import React from "react";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/config";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = "md",
  status,
  className,
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  const [imgError, setImgError] = React.useState(false);

  const getImageUrl = (source?: string) => {
    if (!source) return null;
    if (source.startsWith("http") || source.startsWith("data:")) return source;
    if (source === "default.jpg") return `${API_URL}/${source}`;
    return `${API_URL}/uploads/${source}`;
  };

  const fullSrc = getImageUrl(src);

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-full flex items-center justify-center bg-wa-panel text-wa-primary overflow-hidden border border-border",
          sizeClasses[size],
          className
        )}
      >
        {fullSrc && !imgError ? (
          <img
            src={fullSrc}
            alt={alt}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="font-bold opacity-70">{getInitials(alt)}</span>
        )}
      </div>
      {status && (
        <div
          className={cn(
            "absolute bottom-0.5 right-0.5 w-3 h-3 border-2 border-wa-bg rounded-full",
            status === "online" ? "bg-wa-primary" :
              status === "busy" ? "bg-red-500" :
                status === "away" ? "bg-yellow-500" :
                  "bg-gray-500"
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
