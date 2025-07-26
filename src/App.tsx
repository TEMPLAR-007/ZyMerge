"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useAction,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";

export default function App() {
  const [currentView, setCurrentView] = useState<"search" | "favorites">("search");

  return (
    <>
      <header className="sticky top-0 z-10 bg-light dark:bg-dark p-4 border-b-2 border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Media Hub</h1>
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
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="p-8">
        <Authenticated>
          {currentView === "search" ? <ImageSearch /> : <FavoritesView />}
        </Authenticated>
        <Unauthenticated>
          <SignInForm />
        </Unauthenticated>
      </main>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-slate-200 dark:bg-slate-800 text-dark dark:text-light rounded-md px-3 py-1"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      )}
    </>
  );
}

function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-8 w-96 mx-auto">
      <h2 className="text-2xl font-bold text-center">Welcome to Media Hub</h2>
      <p className="text-center">Sign in to search for images from multiple sources</p>
      <form
        className="flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            setError(error.message);
          });
        }}
      >
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="email"
          name="email"
          placeholder="Email"
        />
        <input
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-2 border-2 border-slate-200 dark:border-slate-800"
          type="password"
          name="password"
          placeholder="Password"
        />
        <button
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md"
          type="submit"
        >
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        <div className="flex flex-row gap-2">
          <span>
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>
          <span
            className="text-dark dark:text-light underline hover:no-underline cursor-pointer"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </span>
        </div>
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-dark dark:text-light font-mono text-xs">
              Error signing in: {error}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

function ImageSearch() {
  const [query, setQuery] = useState("");
  const [perProvider, setPerProvider] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [images, setImages] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchImages = useAction(api.myFunctions.searchImages);
  const favorites = useQuery(api.myFunctions.listFavorites) || [];
  const addFavorite = useMutation(api.myFunctions.addFavorite);
  const removeFavorite = useMutation(api.myFunctions.removeFavorite);

  const handleSearch = async (e: React.FormEvent, page: number | string = 1) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const results = await searchImages({
        query: query.trim(),
        perProvider: perProvider,
        page: page
      });

      setImages(results.images);
      setPagination(results.pagination);
      setCurrentPage(page as number);
    } catch (err: any) {
      setError(err.message || "Error searching images");
    }
    setLoading(false);
  };

  const handlePageChange = (newPage: number | string) => {
    if (typeof newPage === 'string' && newPage === 'last') {
      handleSearch(new Event('submit') as any, 'last');
    } else if (typeof newPage === 'number' && newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      handleSearch(new Event('submit') as any, newPage);
    }
  };

  const handleNewSearch = (e: React.FormEvent) => {
    setImages([]);
    setPagination(null);
    setCurrentPage(1);
    handleSearch(e, 1);
  };

  // Helper to check if image is favorited
  const isFavorited = (img: any) =>
    favorites.some(
      (fav: any) => fav.provider === img.provider && fav.imageId === String(img.id)
    );

  // Helper to toggle favorite
  const handleToggleFavorite = async (img: any) => {
    if (isFavorited(img)) {
      await removeFavorite({ provider: img.provider, imageId: String(img.id) });
    } else {
      await addFavorite({
        provider: img.provider,
        imageId: String(img.id),
        url: img.url,
        thumb: img.thumb,
        alt: img.alt,
        link: img.link,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">Image Search</h2>
      <p className="text-center mb-8 text-gray-600 dark:text-gray-400">
        Search for images from Unsplash, Pexels, and Pixabay
      </p>

      <form onSubmit={handleNewSearch} className="mb-8 flex gap-2 justify-center items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for images..."
          className="bg-light dark:bg-dark text-dark dark:text-light rounded-md p-3 border-2 border-slate-200 dark:border-slate-800 w-80"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-dark dark:bg-light text-light dark:text-dark rounded-md px-6 py-3 disabled:opacity-50"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-center mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-md">
          {error}
        </div>
      )}

      {pagination && (
        <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Showing {images.length} of {pagination.totalImages} images from Unsplash, Pexels, and Pixabay
          {pagination.totalPages > 1 && (
            <span> • Page {pagination.currentPage} of {pagination.totalPages}</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div key={`${img.provider}-${img.id}-${img.url}`} className="relative group block">
            <a
              href={img.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <img
                  src={img.thumb || img.url}
                  alt={img.alt}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <div className="text-white text-xs font-medium capitalize">
                    {img.provider}
                  </div>
                </div>
              </div>
            </a>
            <button
              onClick={() => handleToggleFavorite(img)}
              className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-black/60 rounded-full p-2 shadow hover:scale-110 transition-transform"
              aria-label={isFavorited(img) ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorited(img) ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="#e11d48" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#e11d48" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 6.584a5.754 5.754 0 00-9.07-2.157l-.682.68-.682-.68A5.754 5.754 0 002.248 6.584a5.753 5.753 0 00.824 7.815l8.116 7.407a.75.75 0 001.024 0l8.116-7.407a5.753 5.753 0 00.824-7.815z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#e11d48" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 6.584a5.754 5.754 0 00-9.07-2.157l-.682.68-.682-.68A5.754 5.754 0 002.248 6.584a5.753 5.753 0 00.824 7.815l8.116 7.407a.75.75 0 001.024 0l8.116-7.407a5.753 5.753 0 00.824-7.815z" />
                </svg>
              )}
            </button>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPrevPage || loading}
            className="bg-dark dark:bg-light text-light dark:text-dark rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex items-center gap-2">
            {(() => {
              const pages = [];

              // Always show first page
              pages.push(1);

              // Calculate range of pages to show
              let startPage = Math.max(2, currentPage - 1);
              let endPage = Math.min(pagination.totalPages - 1, currentPage + 1);

              // Adjust if we're near the beginning
              if (currentPage <= 3) {
                endPage = Math.min(pagination.totalPages - 1, 4);
              }

              // Adjust if we're near the end
              if (currentPage >= pagination.totalPages - 2) {
                startPage = Math.max(2, pagination.totalPages - 3);
              }

              // Add ellipsis and middle pages
              if (startPage > 2) {
                pages.push('...');
              }

              for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
              }

              if (endPage < pagination.totalPages - 1) {
                pages.push('...');
              }

              // Do NOT show last page number

              return pages.map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                  disabled={loading || typeof page !== 'number'}
                  className={`px-3 py-2 rounded-md ${page === currentPage
                    ? "bg-dark dark:bg-light text-light dark:text-dark"
                    : typeof page === 'number'
                      ? "bg-slate-200 dark:bg-slate-800 text-dark dark:text-light hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
                      : "text-gray-500 dark:text-gray-400 cursor-default"
                    }`}
                >
                  {page}
                </button>
              ));
            })()}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage || loading}
            className="bg-dark dark:bg-light text-light dark:text-dark rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>

          {pagination.totalPages > 5 && (
            <button
              onClick={() => handlePageChange('last')}
              disabled={currentPage === pagination.totalPages || loading}
              className="bg-dark dark:bg-light text-light dark:text-dark rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Last
            </button>
          )}
        </div>
      )}

      {images.length === 0 && !loading && query && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No images found for "{query}"
        </div>
      )}
    </div>
  );
}

function FavoritesView() {
  const favorites = useQuery(api.myFunctions.listFavorites) || [];
  const removeFavorite = useMutation(api.myFunctions.removeFavorite);

  const handleRemoveFavorite = async (img: any) => {
    await removeFavorite({ provider: img.provider, imageId: img.imageId });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">My Favorites</h2>
      <p className="text-center mb-8 text-gray-600 dark:text-gray-400">
        Your saved images from Unsplash, Pexels, and Pixabay
      </p>

      {favorites.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          You haven't saved any images yet. Start searching and adding favorites!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((img) => (
            <div key={`${img.provider}-${img.imageId}-${img.url}`} className="relative group block">
              <a
                href={img.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <img
                    src={img.thumb || img.url}
                    alt={img.alt}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                    <div className="text-white text-xs font-medium capitalize">
                      {img.provider}
                    </div>
                  </div>
                </div>
              </a>
              <button
                onClick={() => handleRemoveFavorite(img)}
                className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-black/60 rounded-full p-2 shadow hover:scale-110 transition-transform"
                aria-label="Remove from favorites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#e11d48" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
