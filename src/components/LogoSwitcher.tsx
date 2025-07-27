import { Logo, CustomLogo } from "./Logo";

interface LogoSwitcherProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  useCustomLogo?: boolean;
}

/**
 * LogoSwitcher - Easy way to switch between placeholder and custom logo
 * 
 * Usage:
 * - Set useCustomLogo={false} to use the animated SVG placeholder
 * - Set useCustomLogo={true} to use your uploaded custom logo
 * 
 * When you upload your logo files to /public/images/, 
 * uncomment the img tags in CustomLogo component and set useCustomLogo={true}
 */
export function LogoSwitcher({ 
  className, 
  size = "md", 
  showText = true, 
  useCustomLogo = false 
}: LogoSwitcherProps) {
  if (useCustomLogo) {
    return <CustomLogo className={className} size={size} showText={showText} />;
  }
  
  return <Logo className={className} size={size} showText={showText} />;
}

// Export for easy switching in your components
export { Logo, CustomLogo };