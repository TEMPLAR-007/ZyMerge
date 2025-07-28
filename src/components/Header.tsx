import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { CustomLogo } from "./Logo";
import { Search, Heart, LogOut, Home, LogIn, Rocket, Bell } from "lucide-react";
import { useState } from "react";
import { UpdatesModal } from "./UpdatesModal";

interface HeaderProps {
  currentView: "home" | "search" | "favorites" | "nasa";
  setCurrentView: (view: "home" | "search" | "favorites" | "nasa") => void;
  onSignInClick?: () => void;
}

export function Header({ currentView, setCurrentView, onSignInClick }: HeaderProps) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setCurrentView("home")}
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <CustomLogo size="sm" className="sm:hidden" showText={false} />
            <CustomLogo size="md" className="hidden sm:flex" />
            <span className="hidden xs:inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
              Beta
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant={currentView === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("home")}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>

          <Button
            variant={currentView === "search" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("search")}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>

          <Button
            variant={currentView === "nasa" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("nasa")}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 relative overflow-hidden group transition-all duration-300 ${currentView === "nasa"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg explore-button-active"
              : "explore-button-inactive hover:text-blue-400"
              }`}
          >
            {/* Animated cosmic background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-blue-400 rounded-full explore-sparkle" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-purple-400 rounded-full explore-sparkle" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1 left-4 w-0.5 h-0.5 bg-blue-300 rounded-full explore-sparkle" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Rocket icon with enhanced animation */}
            <Rocket className={`rocket-icon h-4 w-4 relative z-10 transition-all duration-300 ${currentView === "nasa"
              ? "text-white drop-shadow-sm"
              : "group-hover:text-blue-400 group-hover:drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]"
              }`} />

            {/* Text with enhanced gradient effect */}
            <span className={`hidden sm:inline relative z-10 font-medium transition-all duration-300 ${currentView === "nasa"
              ? "text-white drop-shadow-sm"
              : "group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent group-hover:drop-shadow-none"
              }`}>
              Explore
            </span>

            {/* Enhanced sparkle effects */}
            {currentView !== "nasa" && (
              <>
                <div className="absolute top-0 right-0 w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute bottom-0 left-0 w-0.5 h-0.5 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300" style={{ animationDelay: '0.8s' }}></div>
              </>
            )}

            {/* Subtle border glow when active */}
            {currentView === "nasa" && (
              <div className="absolute inset-0 rounded-md border border-white/20 pointer-events-none"></div>
            )}
          </Button>

          {isAuthenticated && (
            <Button
              variant={currentView === "favorites" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView("favorites")}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Favorites</span>
            </Button>
          )}

          {isAuthenticated ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void signOut()}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sign out</span>
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onSignInClick}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Sign in</span>
            </Button>
          )}

          {/* Notification Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsUpdatesModalOpen(true)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 relative group"
            title="View recent updates and improvements"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Updates</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </Button>
        </div>
      </div>

      <UpdatesModal
        isOpen={isUpdatesModalOpen}
        onClose={() => setIsUpdatesModalOpen(false)}
        onNavigate={setCurrentView}
      />
    </header>
  );
}