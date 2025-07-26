import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ImageGrid } from "./ImageGrid";
import { ImageModal } from "./ImageModal";
import { ConfirmationModal } from "./ConfirmationModal";

export function FavoritesView() {
  const { isAuthenticated } = useConvexAuth();
  const favorites = useQuery(api.myFunctions.listFavorites) || [];
  const removeFavorite = useMutation(api.myFunctions.removeFavorite);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removingImageId, setRemovingImageId] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    image: any;
  }>({ isOpen: false, image: null });

  const handleRemoveFavorite = (img: any) => {
    setConfirmationModal({ isOpen: true, image: img });
  };

  const confirmRemoveFavorite = async () => {
    const img = confirmationModal.image;
    if (!img) return;

    const imageId = String(img.imageId || img.id);

    try {
      setIsRemoving(true);
      setRemovingImageId(imageId);
      console.log('Removing favorite:', { provider: img.provider, imageId });
      await removeFavorite({ provider: img.provider, imageId });
      console.log('Successfully removed favorite');
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite. Please try again.');
    } finally {
      setIsRemoving(false);
      setRemovingImageId(null);
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

  // Convert favorites to image format for ImageGrid
  const favoriteImages = favorites.map(fav => ({
    provider: fav.provider,
    id: fav.imageId,
    imageId: fav.imageId, // Keep both for compatibility
    url: fav.url,
    thumb: fav.thumb,
    alt: fav.alt || "",
    link: fav.link || "",
    credit: fav.credit,
    creditUrl: fav.creditUrl
  }));

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
        <ImageGrid
          images={favoriteImages}
          favorites={favorites}
          onToggleFavorite={handleRemoveFavorite}
          onImageClick={handleImageClick}
          showRemoveButton={true}
          isLoading={isRemoving}
          loadingImageId={removingImageId}
        />
      )}

      <ImageModal
        image={selectedImage}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isFavorited={true}
        onToggleFavorite={() => {
          if (selectedImage && !isRemoving) {
            setConfirmationModal({ isOpen: true, image: selectedImage });
          }
        }}
        isLoading={isRemoving}
        isAuthenticated={isAuthenticated}
        showFavoriteButton={true}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false, image: null })}
        onConfirm={() => {
          void confirmRemoveFavorite().then(() => {
            if (selectedImage && confirmationModal.image === selectedImage) {
              handleCloseModal(); // Close image modal if removing the currently viewed image
            }
          }).catch((error) => {
            console.error('Error removing favorite:', error);
          });
        }}
        title="Remove from Favorites"
        message={`Are you sure you want to remove this image from your favorites? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Keep"
        type="danger"
        imageUrl={confirmationModal.image?.thumb || confirmationModal.image?.url}
        imageAlt={confirmationModal.image?.alt || "Image preview"}
      />
    </div>
  );
}