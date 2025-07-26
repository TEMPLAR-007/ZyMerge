import { useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ImageGrid } from "./ImageGrid";
import { Pagination } from "./Pagination";
import { ImageModal } from "./ImageModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { SignInModal } from "./SignInModal";

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
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    image: any;
    action: 'add' | 'remove';
  }>({ isOpen: false, image: null, action: 'add' });
  const [signInModal, setSignInModal] = useState(false);

  const { isAuthenticated } = useConvexAuth();

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
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite. Please try again.');
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

      <ImageGrid
        images={images}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onImageClick={handleImageClick}
        isLoading={isTogglingFavorite}
        loadingImageId={togglingImageId}
      />

      {pagination && (
        <Pagination
          pagination={pagination}
          loading={loading}
          onPageChange={handlePageChange}
        />
      )}

      {images.length === 0 && !loading && query && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No images found for "{query}"
        </div>
      )}

      <ImageModal
        image={selectedImage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isFavorited={selectedImage ? isImageFavorited(selectedImage) : false}
        onToggleFavorite={() => selectedImage && handleToggleFavorite(selectedImage)}
        isLoading={isTogglingFavorite && selectedImage && togglingImageId === String(selectedImage.id)}
        showFavoriteButton={isAuthenticated}
        isAuthenticated={isAuthenticated}
        onSignInRequired={() => setSignInModal(true)}
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
        title="Sign in to save favorites"
        message="Create an account or sign in to save your favorite images and access them anytime."
      />
    </div>
  );
}