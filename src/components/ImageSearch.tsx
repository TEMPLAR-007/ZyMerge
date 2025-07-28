import { useState, useEffect } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ImageGrid } from "./ImageGrid";
import { ImageModal } from "./ImageModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { SignInModal } from "./SignInModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Image as ImageIcon, AlertCircle, Loader2, Filter, X, Clock } from "lucide-react";

export function ImageSearch() {
  const [query, setQuery] = useState("");
  const [perProvider] = useState(20);
  const [images, setImages] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [togglingImageId, setTogglingImageId] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    image: any;
    action: 'add' | 'remove';
  }>({ isOpen: false, image: null, action: 'add' });
  const [signInModal, setSignInModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    image: any;
    action: 'add' | 'remove';
  } | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    "unsplash", "pexels", "pixabay"
  ]);
  const [contentType, setContentType] = useState<string>("all");

  // Add state for current page and hasMore
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Add scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  // Add rate limit state
  const [rateLimitInfo, setRateLimitInfo] = useState<{
    used: number;
    limit: number;
    resetTime: number;
  } | null>(null);

  // Simple animated placeholder
  const [placeholderText, setPlaceholderText] = useState("What are you looking for?");

  // Countdown timer state
  const [timeUntilReset, setTimeUntilReset] = useState<string>("");

  const { isAuthenticated } = useConvexAuth();

  const searchImages = useAction(api.myFunctions.searchImages);
  const favorites = useQuery(api.myFunctions.listFavorites) || [];
  const addFavorite = useMutation(api.myFunctions.addFavorite);
  const removeFavorite = useMutation(api.myFunctions.removeFavorite);

  // Get user's search count from Convex (persists across reloads)
  const userSearchData = useQuery(
    api.myFunctions.getUserSearchCount,
    isAuthenticated ? {} : "skip"
  );

  const searchCount = userSearchData?.count || 0;
  const searchLimit = userSearchData?.limit || 100;
  const userTier = userSearchData?.tier || "free";
  const backendTimeUntilReset = userSearchData?.timeUntilReset;

  // Periodic refresh of search count to show rolling window
  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh search count every 30 seconds to show rolling window
    const refreshInterval = setInterval(() => {
      // Force a re-render by updating a state that triggers the useQuery to refetch
      // This is a simple way to refresh the data
    }, 30000); // 30 seconds

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  // Provider options with colors
  const providerOptions = [
    { id: "unsplash", name: "Unsplash", color: "bg-green-500" },
    { id: "pexels", name: "Pexels", color: "bg-blue-500" },
    { id: "pixabay", name: "Pixabay", color: "bg-purple-500" },
  ];

  useEffect(() => {
    if (isAuthenticated && pendingAction) {
      void confirmToggleFavorite(pendingAction.image, pendingAction.action).then(() => {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      });
      setPendingAction(null);
      setSignInModal(false);
    }
  }, [isAuthenticated, pendingAction]);

  // Meaningful random placeholder suggestions
  useEffect(() => {
    if (query || hasSearched) {
      setPlaceholderText("What are you looking for?");
      return;
    }

    const suggestions = [
      // Unsplash - High quality photography
      "mountain landscape", "city skyline", "coffee shop", "minimalist design", "street photography",
      // Pexels - Professional stock photos
      "business meeting", "technology workspace", "food photography", "lifestyle portrait", "travel destination",
      // Pixabay - Diverse content including illustrations
      "abstract background", "cute animals", "flower garden", "vector illustration", "vintage texture",
      // General popular searches
      "sunset beach", "forest path", "urban architecture", "creative workspace", "ocean waves",
      "nature photography", "modern interior", "healthy food", "team collaboration", "artistic portrait"
    ];

    // Start with a random suggestion
    const getRandomSuggestion = () => suggestions[Math.floor(Math.random() * suggestions.length)];
    setPlaceholderText(`Try "${getRandomSuggestion()}"...`);

    const interval = setInterval(() => {
      setPlaceholderText(`Try "${getRandomSuggestion()}"...`);
    }, 3000);

    return () => clearInterval(interval);
  }, [query, hasSearched]);

  // Live countdown timer using backend data - only when limit is reached
  useEffect(() => {
    if (!isAuthenticated || !backendTimeUntilReset || searchCount < 30) {
      setTimeUntilReset("");
      return;
    }

    // Start with backend time and count down locally for smooth updates
    let remainingSeconds = backendTimeUntilReset.totalSeconds;

    const updateCountdown = () => {
      if (remainingSeconds <= 0) {
        setTimeUntilReset("Resetting...");
        return;
      }

      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;

      if (minutes > 0) {
        setTimeUntilReset(`${minutes}m ${seconds}s`);
      } else {
        setTimeUntilReset(`${seconds}s`);
      }

      remainingSeconds--;
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, backendTimeUntilReset, searchCount]);

  const handleSearch = async (e: React.FormEvent, page: number | string = 1, append = false) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Don't search if no providers are selected
    if (selectedProviders.length === 0) {
      setImages([]);
      setPagination({
        currentPage: 1,
        totalImages: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
      setCurrentPage(1);
      setHasMore(false);
      setHasSearched(true);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchImages({
        query: query.trim(),
        perProvider: perProvider,
        page: page
      });

      // Update rate limit info if available in results
      if (results.rateLimit) {
        setRateLimitInfo({
          used: results.rateLimit.used || 0,
          limit: results.rateLimit.limit || 30,
          resetTime: results.rateLimit.resetTime || (Date.now() + 60 * 60 * 1000)
        });
      }

      // Apply filters to results
      let filteredImages = results.images;

      // Filter by selected providers
      if (selectedProviders.length > 0 && selectedProviders.length < providerOptions.length) {
        filteredImages = filteredImages.filter((img: any) => selectedProviders.includes(img.provider));
      }

      // Filter by content type
      if (contentType === "photo") {
        filteredImages = filteredImages.filter((img: any) => img.provider !== "giphy");
      }

      if (append) {
        setImages(prev => [...prev, ...filteredImages]);
      } else {
        setImages(filteredImages);
      }

      // Calculate if filters are active at the time of search
      const currentHasActiveFilters = selectedProviders.length < providerOptions.length || contentType !== "all";

      // Handle pagination based on whether filters are active
      const originalPagination = results.pagination;
      setCurrentPage(originalPagination.currentPage);
      setHasMore(originalPagination.hasNextPage && filteredImages.length > 0);

      if (currentHasActiveFilters) {
        setPagination({
          currentPage: originalPagination.currentPage,
          totalImages: originalPagination.totalImages,
          totalPages: originalPagination.totalPages,
          hasNextPage: originalPagination.hasNextPage,
          hasPrevPage: originalPagination.hasPrevPage,
          filteredCount: filteredImages.length,
          isFiltered: true
        });
      } else {
        setPagination({
          currentPage: originalPagination.currentPage,
          totalImages: originalPagination.totalImages,
          totalPages: originalPagination.totalPages,
          hasNextPage: originalPagination.hasNextPage,
          hasPrevPage: originalPagination.hasPrevPage
        });
      }
    } catch (error: any) {
      if (error?.message?.includes("Rate limit exceeded")) {
        const resetInfo = timeUntilReset ? ` Try again in ${timeUntilReset}.` : " Try again in 1 hour.";
        setError(`Search limit reached (${searchLimit}/hour).${resetInfo} ${userTier === "free" ? "Upgrade to Premium for 500 searches/hour!" : ""}`);
      } else if (error?.message?.includes("API")) {
        setError("API error: Some image sources are temporarily unavailable. Please try again.");
      } else {
        setError("Search failed. Please check your connection and try again.");
      }
      setImages([]);
      setPagination(null);
      setHasMore(false);
    }
    setLoading(false);
  };

  const handleNewSearch = (e: React.FormEvent) => {
    setImages([]);
    setPagination(null);
    setCurrentPage(1);
    setHasMore(false);
    void handleSearch(e, 1, false);
  };

  const handleLoadMore = () => {
    void handleSearch(new Event('submit') as any, currentPage + 1, true);
  };

  const handleToggleFavorite = (img: any) => {
    if (!isAuthenticated) {
      setPendingAction({ image: img, action: 'add' });
      setSignInModal(true);
      return;
    }

    const imageId = String(img.id);
    const isFavorited = favorites.some(
      (fav: any) => fav.provider === img.provider && fav.imageId === imageId
    );

    if (isFavorited) {
      setConfirmationModal({ isOpen: true, image: img, action: 'remove' });
    } else {
      void confirmToggleFavorite(img, 'add');
    }
  };

  const confirmToggleFavorite = async (img: any, action: 'add' | 'remove') => {
    const imageId = String(img.id);

    try {
      setIsTogglingFavorite(true);
      setTogglingImageId(imageId);

      if (action === 'remove') {
        await removeFavorite({ provider: img.provider, imageId });
      } else {
        await addFavorite({
          provider: img.provider,
          imageId,
          url: img.url,
          thumb: img.thumb,
          alt: img.alt,
          link: img.link,
          credit: img.credit,
          creditUrl: img.creditUrl,
        });
      }
    } catch {
      // Error handling - could be enhanced with user notifications
    } finally {
      setIsTogglingFavorite(false);
      setTogglingImageId(null);
    }
  };

  const handleImageClick = (img: any) => {
    setSelectedImage(img);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  const isImageFavorited = (img: any) => {
    if (!isAuthenticated) return false;
    return favorites.some(
      (fav: any) => fav.provider === img.provider && fav.imageId === String(img.id)
    );
  };

  // Scroll detection and scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Update rate limit info periodically
  useEffect(() => {
    if (!rateLimitInfo) return;

    const interval = setInterval(() => {
      setRateLimitInfo(prev => {
        if (!prev) return null;
        return {
          ...prev,
          resetTime: prev.resetTime
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo]);

  const toggleProvider = (providerId: string) => {
    setSelectedProviders(prev => {
      if (prev.includes(providerId)) {
        // Don't allow deselecting if it's the last selected provider
        if (prev.length <= 1) {
          return prev;
        }
        return prev.filter(p => p !== providerId);
      } else {
        return [...prev, providerId];
      }
    });
  };

  const clearFilters = () => {
    setSelectedProviders(providerOptions.map(p => p.id));
    setContentType("all");
  };

  const hasActiveFilters = selectedProviders.length < providerOptions.length || contentType !== "all";

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      {/* Compact Search Bar (appears when scrolled) */}
      {isScrolled && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in-down">
          <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-full shadow-xl px-4 py-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading && query.trim() && !(isAuthenticated && searchCount >= searchLimit)) {
                      e.preventDefault();
                      handleNewSearch(e as any);
                    }
                  }}
                  placeholder={isAuthenticated && searchCount >= searchLimit ? "Rate limited..." : "Search..."}
                  className="pl-7 pr-3 h-7 w-48 text-xs bg-transparent border-none focus:ring-0 focus:outline-none placeholder-gray-400"
                  disabled={loading || (isAuthenticated && searchCount >= searchLimit)}
                />
              </div>
              <Button
                onClick={(e) => handleNewSearch(e as any)}
                disabled={loading || !query.trim() || (isAuthenticated && searchCount >= searchLimit)}
                size="sm"
                className="h-7 w-7 p-0 bg-blue-500/80 hover:bg-blue-500 text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed"
                title={isAuthenticated && searchCount >= searchLimit ? `Rate limited. Try again in ${timeUntilReset || 'a few minutes'}` : undefined}
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isAuthenticated && searchCount >= searchLimit ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <Search className="h-3 w-3" />
                )}
              </Button>
              <Button
                onClick={scrollToTop}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in-up">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Image added to favorites!</span>
          </div>
        </div>
      )}

      <Card className="mb-4 sm:mb-8 animate-fade-in-up">
        <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-center space-x-2 mb-2 relative">
            <svg
              className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V15C21 16.1046 20.1046 17 19 17H5C3.89543 17 3 16.1046 3 15V9Z"
                stroke="currentColor"
                strokeWidth="2"
                className="animate-pulse"
              />
              <circle
                cx="8"
                cy="12"
                r="2"
                fill="currentColor"
                className="animate-bounce"
                style={{ animationDelay: '0.1s' }}
              />
              <circle
                cx="16"
                cy="12"
                r="2"
                fill="currentColor"
                className="animate-bounce"
                style={{ animationDelay: '0.3s' }}
              />
              <path
                d="M8 12H16"
                stroke="currentColor"
                strokeWidth="1.5"
                className="animate-pulse"
                style={{ animationDelay: '0.2s' }}
              />
            </svg>
            <CardTitle className="text-xl sm:text-2xl md:text-3xl text-blue-400">Discover Images</CardTitle>

            {/* Search Count Badge - Only show when authenticated */}
            {isAuthenticated && (
              <div className="absolute -top-2 -right-2 sm:relative sm:top-0 sm:right-0 sm:ml-4">
                <Badge
                  variant="secondary"
                  className={`text-xs px-2 py-1 ${searchCount >= searchLimit ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                    searchCount >= searchLimit * 0.8 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-green-500/20 text-green-400 border-green-500/30'
                    }`}
                >
                  {searchCount}/{searchLimit} searches
                  {userTier !== "free" && (
                    <span className="ml-1 text-xs">({userTier})</span>
                  )}
                </Badge>
              </div>
            )}
          </div>
          <CardDescription className="text-sm sm:text-base md:text-lg">
            Find the perfect image from multiple sources
          </CardDescription>

          {/* Dynamic Image Sources Section */}
          <div className="mt-4 sm:mt-6">
            <div className="flex flex-col items-center space-y-3">
              {/* Provider Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {providerOptions.map(provider => (
                  <Button
                    key={provider.id}
                    variant={selectedProviders.includes(provider.id) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => toggleProvider(provider.id)}
                    disabled={selectedProviders.length === 1 && selectedProviders.includes(provider.id)}
                    className={`px-3 py-1 hover:scale-105 transition-all duration-200 text-xs ${selectedProviders.includes(provider.id)
                      ? selectedProviders.length === 1
                        ? 'opacity-100 shadow-md cursor-not-allowed'
                        : 'opacity-100 shadow-md'
                      : 'opacity-50 hover:opacity-75'
                      }`}
                    title={selectedProviders.length === 1 && selectedProviders.includes(provider.id)
                      ? "At least one source must be selected"
                      : selectedProviders.includes(provider.id)
                        ? `Deselect ${provider.name}`
                        : `Select ${provider.name}`
                    }
                  >
                    <div className={`w-2 h-2 ${provider.color} rounded-full mr-2 flex-shrink-0`}></div>
                    {provider.name}
                    {selectedProviders.includes(provider.id) && (
                      <span className="ml-1 text-xs">
                        {selectedProviders.length === 1 ? "🔒" : "✓"}
                      </span>
                    )}
                  </Button>
                ))}
              </div>

              {/* Status Info */}
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>
                  {selectedProviders.length} of {providerOptions.length} sources active
                </span>
                <span>•</span>
                <span>
                  {contentType === "photo" ? "Photos only" : "All content"}
                </span>
                {hasActiveFilters && (
                  <>
                    <span>•</span>
                    <span className="text-blue-400 font-medium">Filters applied</span>
                  </>
                )}
                {selectedProviders.length === 1 && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-400 font-medium">At least 1 source required</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleNewSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholderText}
                className="pl-10 hover:shadow-md transition-shadow duration-200 h-10 sm:h-auto"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim() || (isAuthenticated && searchCount >= searchLimit)}
              className="hover:scale-105 transition-transform duration-200 hover:shadow-lg h-10 sm:h-auto px-4 sm:px-6"
              title={isAuthenticated && searchCount >= searchLimit ? `Rate limited. Try again in ${timeUntilReset || 'a few minutes'}` : undefined}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="hidden sm:inline">Searching...</span>
                  <span className="sm:hidden">Search</span>
                </>
              ) : isAuthenticated && searchCount >= searchLimit ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Rate Limited</span>
                  <span className="sm:hidden">Limited</span>
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>

          {/* Rate Limit Info */}
          <div className="mt-2 text-center">
            {isAuthenticated ? (
              <div className="flex flex-col items-center justify-center gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Searches used:</span>
                  <span className={`font-semibold ${searchCount >= searchLimit ? 'text-red-500' : searchCount >= searchLimit * 0.8 ? 'text-yellow-400' : 'text-green-400'}`}>{searchCount}/{searchLimit}</span>
                  {userTier === "free" && (
                    <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                      Free
                    </Badge>
                  )}
                </div>
                <div className="w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${searchCount >= searchLimit
                      ? 'bg-red-500'
                      : searchCount >= searchLimit * 0.8
                        ? 'bg-yellow-400'
                        : 'bg-green-500'
                      }`}
                    style={{ width: `${Math.min((searchCount / searchLimit) * 100, 100)}%` }}
                  />
                </div>
                {searchCount >= searchLimit && timeUntilReset && (
                  <span className="text-red-400 font-medium mt-1">Next search in {timeUntilReset}</span>
                )}
                <span className="text-muted-foreground mt-1">
                  {userTier === "free" ? (
                    <>
                      Free: {searchLimit} searches per hour •
                      <span className="text-blue-400 font-medium ml-1">Upgrade to Premium for 500/hour</span>
                    </>
                  ) : (
                    `${userTier.charAt(0).toUpperCase() + userTier.slice(1)}: ${searchLimit} searches per hour (rolling window)`
                  )}
                </span>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                🔍 Unlimited searches •
                <span className="text-blue-400 font-medium"> Sign in to save favorites</span>
              </p>
            )}
          </div>

          {/* Quick Filters Bar */}
          <div className="mt-4 sm:mt-6">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">

              {/* Source Summary & Custom Filters */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground font-medium">Sources:</span>
                <span className="text-xs font-semibold text-white px-2 py-1 rounded bg-gray-800/80 border border-gray-700">
                  {selectedProviders.length === providerOptions.length
                    ? 'All sources'
                    : `${selectedProviders.length} selected`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-xs h-7 px-3 hover:scale-105 transition-transform duration-200"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Custom
                </Button>
              </div>

              {/* Active Filters Indicator */}
              {hasActiveFilters && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {selectedProviders.length} source{selectedProviders.length !== 1 ? 's' : ''} selected
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs h-7 px-2 text-muted-foreground hover:text-white"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700 animate-fade-in-up">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Custom Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-xs h-6 px-2 text-muted-foreground hover:text-white"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Provider Selection Section */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Image Sources</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                  {providerOptions.map(provider => (
                    <Button
                      key={provider.id}
                      variant={selectedProviders.includes(provider.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleProvider(provider.id)}
                      className={`text-xs h-7 px-2 justify-start hover:scale-105 transition-transform duration-200 ${selectedProviders.includes(provider.id) ? 'opacity-100' : 'opacity-60'
                        }`}
                    >
                      <div className={`w-2 h-2 ${provider.color} rounded-full mr-1 flex-shrink-0`}></div>
                      {provider.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
                <p className="text-xs text-muted-foreground">
                  {selectedProviders.length} source{selectedProviders.length !== 1 ? 's' : ''} selected
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProviders(providerOptions.map(p => p.id))}
                    className="text-xs h-6 px-2"
                  >
                    All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedProviders.length > 1) {
                        setSelectedProviders([selectedProviders[0]]);
                      }
                    }}
                    disabled={selectedProviders.length <= 1}
                    className="text-xs h-6 px-2"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-4 sm:mb-6 border-destructive animate-fade-in-up">
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm sm:text-base text-destructive font-medium break-words mb-2">
                  {error}
                </p>
                {error.includes("Search limit reached") && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Limit uses rolling 1-hour windows (resets 1 hour after you hit the limit)</p>
                    <p>• Browse your saved favorites while waiting</p>
                    {userTier === "free" && (
                      <p className="text-blue-400 font-medium">• Upgrade to Premium for 500 searches/hour!</p>
                    )}
                    {timeUntilReset && (
                      <p className="text-yellow-400 font-medium">• Next search available in {timeUntilReset}</p>
                    )}
                  </div>
                )}
                {error.includes("API error") && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Some image sources may be temporarily down</p>
                    <p>• Check back in a few minutes</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {pagination && (
        <div className="mb-4 sm:mb-6 text-center animate-fade-in-up">
          <div className="flex flex-col items-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? (
                <>
                  Showing <span className="font-semibold text-white">{images.length}</span> filtered results
                  {selectedProviders.length < providerOptions.length && (
                    <> from <span className="font-semibold text-white">{selectedProviders.length}</span> selected source{selectedProviders.length !== 1 ? 's' : ''}</>
                  )}
                </>
              ) : (
                <>
                  Showing <span className="font-semibold text-white">{images.length}</span> results from{' '}
                  <span className="font-semibold text-white">{selectedProviders.length}</span> source{selectedProviders.length !== 1 ? 's' : ''}
                </>
              )}
            </p>

            {/* Provider Breakdown */}
            {pagination.providerStats && hasActiveFilters && (
              <div className="mt-2 p-2 bg-gray-900/30 rounded-lg border border-gray-700">
                <p className="text-xs font-medium text-muted-foreground mb-1">Results by source:</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(pagination.providerStats).map(([provider, stats]: [string, any]) => (
                    <span key={provider} className="flex items-center space-x-1">
                      <span className="capitalize text-muted-foreground">{provider}:</span>
                      <span className="font-medium text-white">{stats.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-8">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="aspect-square bg-gray-800 rounded-lg loading-skeleton"></div>
              <div className="mt-1 sm:mt-2 h-3 sm:h-4 bg-gray-800 rounded loading-skeleton"></div>
              <div className="mt-1 h-2 sm:h-3 bg-gray-800 rounded w-2/3 loading-skeleton"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="animate-fade-in-up">
          <ImageGrid
            images={images}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onImageClick={handleImageClick}
            isLoading={isTogglingFavorite}
            loadingImageId={togglingImageId}
          />
        </div>
      )}

      {hasMore && !loading && images.length > 0 && (
        <>
          <div className="text-center text-xs text-muted-foreground my-4">
            Showing {images.length} photo{images.length !== 1 ? 's' : ''}
          </div>
          <div className="flex justify-center my-1 animate-fade-in-up">
            <Button onClick={handleLoadMore} className="px-6 py-2 text-base font-medium">
              Load More
            </Button>
          </div>
        </>
      )}

      {images.length === 0 && !loading && query && hasSearched && (
        <Card className="mt-4 sm:mt-8 animate-fade-in-up">
          <CardContent className="pt-4 sm:pt-6 text-center px-4 sm:px-6">
            <ImageIcon className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />

            {selectedProviders.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm sm:text-base text-muted-foreground break-words">
                  No image sources selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Please select at least one image source to search
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedProviders(providerOptions.map(p => p.id))}
                  className="text-xs h-7 px-3"
                >
                  Select All Sources
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm sm:text-base text-muted-foreground break-words mb-3">
                  No images found for "{query}"
                </p>

                {hasActiveFilters && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Your current filters might be too restrictive:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {contentType === "photo" ? "Photos only" : "All content"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedProviders.length} sources selected
                      </Badge>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs h-7 px-3"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear Filters
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setContentType("all")}
                        className="text-xs h-7 px-3"
                      >
                        Show All Content
                      </Button>
                    </div>
                  </div>
                )}

                {!hasActiveFilters && (
                  <p className="text-xs text-muted-foreground">
                    Try different search terms or check your spelling
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      <ImageModal
        image={selectedImage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isFavorited={selectedImage ? isImageFavorited(selectedImage) : false}
        onToggleFavorite={() => selectedImage && handleToggleFavorite(selectedImage)}
        isLoading={isTogglingFavorite && selectedImage && togglingImageId === String(selectedImage.id)}
        showFavoriteButton={true}
        isAuthenticated={isAuthenticated}
        onSignInRequired={() => {
          if (selectedImage) {
            setPendingAction({ image: selectedImage, action: 'add' });
          }
          setSignInModal(true);
        }}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, image: null, action: 'add' })}
        onConfirm={() => {
          void confirmToggleFavorite(confirmationModal.image, confirmationModal.action);
        }}
        title="Remove from Favorites"
        message="Are you sure you want to remove this image from your favorites? This action cannot be undone."
        confirmText="Remove"
        cancelText="Keep"
        type="danger"
        imageUrl={confirmationModal.image?.thumb || confirmationModal.image?.url}
        imageAlt={confirmationModal.image?.alt || "Image preview"}
      />

      <SignInModal
        isOpen={signInModal}
        onClose={() => setSignInModal(false)}
        pendingAction={pendingAction}
      />

      {/* Floating Go to Top Button */}
      {isScrolled && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 animate-fade-in-up"
          aria-label="Go to top"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </div>
  );
}