import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { CustomLogo } from "./Logo";
import { Search, Heart, LogOut, Home, LogIn } from "lucide-react";

interface HeaderProps {
  currentView: "home" | "search" | "favorites";
  setCurrentView: (view: "home" | "search" | "favorites") => void;
  onSignInClick?: () => void;
}

export function Header({ currentView, setCurrentView, onSignInClick }: HeaderProps) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        </div>
      </div>
    </header>
  );
}