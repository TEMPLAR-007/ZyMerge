import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl"
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Placeholder SVG - Replace with your custom logo */}
      <svg
        className={cn(sizeClasses[size], "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]")}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V15C21 16.1046 20.1046 17 19 17H5C3.89543 17 3 16.1046 3 15V9Z"
          stroke="currentColor"
          strokeWidth="2"
          className="animate-pulse"
        />
        <circle
          cx="8"
          cy="12"
          r="2"
          fill="currentColor"
          className="animate-bounce"
          style={{ animationDelay: '0.1s' }}
        />
        <circle
          cx="16"
          cy="12"
          r="2"
          fill="currentColor"
          className="animate-bounce"
          style={{ animationDelay: '0.3s' }}
        />
        <path
          d="M8 12H16"
          stroke="currentColor"
          strokeWidth="1.5"
          className="animate-pulse"
          style={{ animationDelay: '0.2s' }}
        />
      </svg>

      {showText && (
        <span className={cn(textSizeClasses[size], "font-bold text-blue-400")}>
          ZyMerge
        </span>
      )}
    </div>
  );
}

// Custom logo version - use this when you upload your logo files
export function CustomLogo({ className, size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
    xl: "text-5xl"
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Your custom logo */}
      <img
        src="/images/zy-removebg-preview.png"
        alt="ZyMerge Logo"
        className={cn(sizeClasses[size], "object-contain")}
      />

      {showText && (
        <span className={cn(textSizeClasses[size], "font-bold text-blue-400")}>
          ZyMerge
        </span>
      )}
    </div>
  );
}