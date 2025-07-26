import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

interface HeaderProps {
  currentView: "search" | "favorites";
  setCurrentView: (view: "search" | "favorites") => void;
}

export function Header({ currentView, setCurrentView }: HeaderProps) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Media Hub Beta</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentView("search")}
            className={`px-3 py-1 rounded-md transition-colors ${currentView === "search"
              ? "bg-dark dark:bg-light text-light dark:text-dark"
              : "bg-slate-200 dark:bg-slate-800 text-dark dark:text-light hover:bg-slate-300 dark:hover:bg-slate-700"
              }`}
          >
            Search
          </button>
          <button
            onClick={() => setCurrentView("favorites")}
            className={`px-3 py-1 rounded-md transition-colors ${currentView === "favorites"
              ? "bg-dark dark:bg-light text-light dark:text-dark"
              : "bg-slate-200 dark:bg-slate-800 text-dark dark:text-light hover:bg-slate-300 dark:hover:bg-slate-700"
              }`}
          >
            My Favorites
          </button>
          {isAuthenticated && (
            <button
              className="bg-slate-200 dark:bg-slate-800 text-dark dark:text-light rounded-md px-3 py-1"
              onClick={() => void signOut()}
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}