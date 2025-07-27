import { useState, useEffect } from "react";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { Header } from "./components/Header";
import { SignInForm } from "./components/SignInForm";
import { SignInModal } from "./components/SignInModal";
import { ImageSearch } from "./components/ImageSearch";
import { FavoritesView } from "./components/FavoritesView";
import { LandingPage } from "./components/LandingPage";
import { RouteLoading } from "./components/RouteLoading";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "search" | "favorites">("home");
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [targetView, setTargetView] = useState<"home" | "search" | "favorites" | undefined>();
  const [signInModal, setSignInModal] = useState(false);
  const { isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (!isAuthenticated && currentView === "favorites") {
      handleViewChange("home");
    }
  }, [isAuthenticated, currentView]);

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
      <Header
        currentView={currentView}
        setCurrentView={handleViewChange}
        onSignInClick={() => setSignInModal(true)}
      />

      <RouteLoading isLoading={isRouteLoading} targetView={targetView} />

      <main className="flex-1">
        {currentView === "home" && (
          <LandingPage
            onNavigateToSearch={() => handleViewChange("search")}
            onNavigateToFavorites={() => handleViewChange("favorites")}
            onSignInRequired={() => setSignInModal(true)}
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
              <SignInForm
                title="Access Your Favorites"
                description="Sign in to view and manage your saved images"
              />
            </div>
          </Unauthenticated>
        )}
      </main>

      <SignInModal
        isOpen={signInModal}
        onClose={() => setSignInModal(false)}
        title="Sign in to ZyMerge"
        message="Where creators connect and content flows. Sign in to save your favorite images and access them across all your devices."
      />
    </div>
  );
}
