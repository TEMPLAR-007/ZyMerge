import { useState, useEffect, useCallback } from "react";
import { Authenticated, Unauthenticated, useConvexAuth } from "convex/react";
import { Header } from "./components/Header";
import { SignInForm } from "./components/SignInForm";
import { SignInModal } from "./components/SignInModal";
import { ImageSearch } from "./components/ImageSearch";
import { FavoritesView } from "./components/FavoritesView";
import { LandingPage } from "./components/LandingPage";
import { NASAExplorer } from "./components/NASAExplorer";
import { RouteLoading } from "./components/RouteLoading";
import { UpdatesModal } from "./components/UpdatesModal";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "search" | "favorites" | "nasa">("home");
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [targetView, setTargetView] = useState<"home" | "search" | "favorites" | "nasa" | undefined>();
  const [signInModal, setSignInModal] = useState(false);
  const [showUpdatesModal, setShowUpdatesModal] = useState(false);
  const [isUpdatesLoading, setIsUpdatesLoading] = useState(false);
  const { isAuthenticated } = useConvexAuth();

  // Initialize route from URL on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view') as "home" | "search" | "favorites" | "nasa";

    if (viewParam && ["home", "search", "favorites", "nasa"].includes(viewParam)) {
      setCurrentView(viewParam);
    }
  }, []);

  // Show updates modal on first visit
  useEffect(() => {
    const hasSeenUpdates = localStorage.getItem('hasSeenUpdates_v1');
    if (!hasSeenUpdates) {
      // Show loading first
      setIsUpdatesLoading(true);

      // Show modal after loading delay
      const timer = setTimeout(() => {
        setIsUpdatesLoading(false);
        setShowUpdatesModal(true);
        localStorage.setItem('hasSeenUpdates_v1', 'true');
      }, 2500); // 2.5 seconds total for better UX
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view') as "home" | "search" | "favorites" | "nasa";

      if (viewParam && ["home", "search", "favorites", "nasa"].includes(viewParam)) {
        setCurrentView(viewParam);
      } else {
        setCurrentView("home");
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when currentView changes
  useEffect(() => {
    const url = new URL(window.location.href);
    const currentUrlView = url.searchParams.get('view');

    if (currentView === "home") {
      url.searchParams.delete('view');
    } else {
      url.searchParams.set('view', currentView);
    }

    // Only update URL if it's different from current URL
    if (currentUrlView !== (currentView === "home" ? null : currentView)) {
      // Use pushState for navigation changes to enable back/forward buttons
      window.history.pushState({}, '', url.toString());
    }
  }, [currentView]);

  useEffect(() => {
    if (!isAuthenticated && currentView === "favorites") {
      handleViewChange("home");
    }
  }, [isAuthenticated, currentView]);

  const handleViewChange = useCallback((newView: "home" | "search" | "favorites" | "nasa") => {
    if (newView === currentView) return;

    setIsRouteLoading(true);
    setTargetView(newView);

    // Simulate loading time for smooth transition
    setTimeout(() => {
      setCurrentView(newView);
      setIsRouteLoading(false);
      setTargetView(undefined);
    }, 300); // Reduced from 800ms to 300ms for faster transitions
  }, [currentView]);

  const handleModalNavigation = useCallback((route: "home" | "search" | "favorites" | "nasa") => {
    handleViewChange(route);
  }, [handleViewChange]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentView={currentView}
        setCurrentView={handleViewChange}
        onSignInClick={() => setSignInModal(true)}
      />

      <RouteLoading isLoading={isRouteLoading} targetView={targetView} isUpdatesLoading={isUpdatesLoading} />

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

        {currentView === "nasa" && <NASAExplorer />}
      </main>

      <SignInModal
        isOpen={signInModal}
        onClose={() => setSignInModal(false)}
        title="Sign in to ZyMerge"
        message="Where creators connect and content flows. Sign in to save your favorite images and access them across all your devices."
      />

      <UpdatesModal
        isOpen={showUpdatesModal}
        onClose={() => setShowUpdatesModal(false)}
        onNavigate={handleModalNavigation}
      />
    </div>
  );
}
