import { useState, useEffect } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ImageGrid } from "./ImageGrid";
import { Pagination } from "./Pagination";
import { ImageModal } from "./ImageModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { SignInModal } from "./SignInModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";

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

  const { isAuthenticated } = useConvexAuth();

  const searchImages = useAction(api.myFunctions.searchImages);
  const favorites = useQuery(api.myFunctions.listFavorites) || [];
  const addFavorite = useMutation(api.myFunctions.addFavorite);
  const removeFavorite = useMutation(api.myFunctions.removeFavorite);

  // Listen for authentication changes and resume pending actions
  useEffect(() => {
    if (isAuthenticated && pendingAction) {
      // User just signed in, resume the pending action
      void confirmToggleFavorite(pendingAction.image, pendingAction.action).then(() => {
        // Show success message
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000); // Hide after 3 seconds
      });
      setPendingAction(null);
      setSignInModal(false);
    }
  }, [isAuthenticated, pendingAction]);

  const handleSearch = async (e: React.FormEvent, page: number | string = 1) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const results = await searchImages({
        query: query.trim(),
        perProvider: perProvider,
        page: page
      });

      setImages(results.images);
      setPagination(results.pagination);
    } catch (err: any) {
      setError(err.message || "Error searching images");
    }
    setLoading(false);
  };

  const handlePageChange = (newPage: number | string) => {
    if (typeof newPage === 'string' && newPage === 'last') {
      void handleSearch(new Event('submit') as any, 'last');
    } else if (typeof newPage === 'number' && newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      void handleSearch(new Event('submit') as any, newPage);
    }
  };

  const handleNewSearch = (e: React.FormEvent) => {
    setImages([]);
    setPagination(null);
    void handleSearch(e, 1);
  };

  const handleToggleFavorite = (img: any) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store the pending action and show sign in modal
      setPendingAction({ image: img, action: 'add' });
      setSignInModal(true);
      return;
    }

    const imageId = String(img.id);
    const isFavorited = favorites.some(
      (fav: any) => fav.provider === img.provider && fav.imageId === imageId
    );

    if (isFavorited) {
      // Show confirmation for removing favorites
      setConfirmationModal({ isOpen: true, image: img, action: 'remove' });
    } else {
      // Add to favorites directly (no confirmation needed)
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
    } catch (err: any) {
      console.error('Error toggling favorite:', err);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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

      <Card className="mb-8 animate-fade-in-up">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <svg
              className="h-8 w-8 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
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
            <CardTitle className="text-3xl text-blue-400">Discover Images</CardTitle>
          </div>
          <CardDescription className="text-lg">
            Find the perfect image from multiple sources
          </CardDescription>

          {/* Dynamic Image Sources Section */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="px-3 py-1 hover:scale-105 transition-transform duration-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Unsplash
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 hover:scale-105 transition-transform duration-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Pexels
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 hover:scale-105 transition-transform duration-200">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  Pixabay
                </Badge>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="mr-1">•</span>
                <span>More sources coming soon</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNewSearch} className="flex gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="pl-10 hover:shadow-md transition-shadow duration-200"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !query.trim()}
              className="hover:scale-105 transition-transform duration-200 hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive animate-fade-in-up">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {pagination && (
        <div className="mb-6 text-center animate-fade-in-up">
          <p className="text-sm text-muted-foreground">
            Found {pagination.totalImages.toLocaleString()} images
            {pagination.totalPages > 1 && (
              <span> • Page {pagination.currentPage} of {pagination.totalPages}</span>
            )}
          </p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="aspect-square bg-gray-800 rounded-lg loading-skeleton"></div>
              <div className="mt-2 h-4 bg-gray-800 rounded loading-skeleton"></div>
              <div className="mt-1 h-3 bg-gray-800 rounded w-2/3 loading-skeleton"></div>
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

      {pagination && !loading && (
        <div className="animate-fade-in-up">
          <Pagination
            pagination={pagination}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {images.length === 0 && !loading && query && hasSearched && (
        <Card className="mt-8 animate-fade-in-up">
          <CardContent className="pt-6 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No images found for "{query}"
            </p>
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
    </div>
  );
}