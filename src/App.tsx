import { useState } from "react";
import { Authenticated, Unauthenticated } from "convex/react";
import { Header } from "./components/Header";
import { SignInForm } from "./components/SignInForm";
import { ImageSearch } from "./components/ImageSearch";
import { FavoritesView } from "./components/FavoritesView";

export default function App() {
  const [currentView, setCurrentView] = useState<"search" | "favorites">("search");

  return (
    <>
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="p-8">
        {currentView === "search" ? (
          <ImageSearch />
        ) : (
          <Authenticated>
            <FavoritesView />
          </Authenticated>
        )}
        
        {currentView === "favorites" && (
          <Unauthenticated>
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Sign in to view favorites</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  You need to sign in to save and view your favorite images.
                </p>
              </div>
              <SignInForm />
            </div>
          </Unauthenticated>
        )}
      </main>
    </>
  );
}
