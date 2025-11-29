
import React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  status?: "online" | "offline";
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
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "rounded-full flex items-center justify-center bg-ecole-primary text-white overflow-hidden",
          sizeClasses[size],
          className
        )}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-medium">{getInitials(alt)}</span>
        )}
      </div>
      {status && (
        <div
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full",
            status === "online" ? "bg-ecole-accent" : "bg-ecole-offline"
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
