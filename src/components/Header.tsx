import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Search, Heart, LogOut, Home } from "lucide-react";

interface HeaderProps {
  currentView: "home" | "search" | "favorites";
  setCurrentView: (view: "home" | "search" | "favorites") => void;
}

export function Header({ currentView, setCurrentView }: HeaderProps) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold tracking-tight">Media Hub</h1>
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
            Beta
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={currentView === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("home")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>

          <Button
            variant={currentView === "search" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("search")}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>

          <Button
            variant={currentView === "favorites" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("favorites")}
            className="flex items-center gap-2"
          >
            <Heart className="h-4 w-4" />
            Favorites
          </Button>

          {isAuthenticated && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void signOut()}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}