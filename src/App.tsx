import { useState, useEffect } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Header } from "./components/Header";
import { SignInForm } from "./components/SignInForm";
import { ImageSearch } from "./components/ImageSearch";
import { FavoritesView } from "./components/FavoritesView";
import { LandingPage } from "./components/LandingPage";
import { RouteLoading } from "./components/RouteLoading";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "search" | "favorites">("home");
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [targetView, setTargetView] = useState<"home" | "search" | "favorites" | undefined>();

  const handleViewChange = (newView: "home" | "search" | "favorites") => {
    if (newView === currentView) return;

    setIsRouteLoading(true);
    setTargetView(newView);

    // Simulate loading time for smooth transition
    setTimeout(() => {
      setCurrentView(newView);
      setIsRouteLoading(false);
      setTargetView(undefined);
    }, 300); // Reduced from 800ms to 300ms for faster transitions
  };

  return (
    <div className="min-h-screen bg-background">
      <Header currentView={currentView} setCurrentView={handleViewChange} />

      <RouteLoading isLoading={isRouteLoading} targetView={targetView} />

      <main className="flex-1">
        {currentView === "home" && (
          <LandingPage
            onNavigateToSearch={() => handleViewChange("search")}
            onNavigateToFavorites={() => handleViewChange("favorites")}
          />
        )}

        {currentView === "search" && <ImageSearch />}

        {currentView === "favorites" && (
          <Authenticated>
            <FavoritesView />
          </Authenticated>
        )}

        {currentView === "favorites" && (
          <Unauthenticated>
            <div className="container mx-auto px-4 py-8">
              <SignInForm />
            </div>
          </Unauthenticated>
        )}
      </main>
    </div>
  );
}
