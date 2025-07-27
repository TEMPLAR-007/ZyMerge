import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ImageGrid } from "./ImageGrid";
import { ImageModal } from "./ImageModal";
import { ConfirmationModal } from "./ConfirmationModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";

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
      await removeFavorite({ provider: img.provider, imageId });
    } catch {
      // Silent error handling - could be enhanced with user notifications
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

  if (favorites === undefined) {
    return (
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
        <Card className="mb-4 sm:mb-8">
          <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">My Favorites</CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base md:text-lg">
              Your saved images from Unsplash, Pexels, and Pixabay
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="aspect-square bg-gray-800 rounded-lg loading-skeleton"></div>
              <div className="mt-2 h-4 bg-gray-800 rounded loading-skeleton"></div>
              <div className="mt-1 h-3 bg-gray-800 rounded w-2/3 loading-skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-6xl">
      <Card className="mb-4 sm:mb-8 animate-fade-in-up">
        <CardHeader className="text-center px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <CardTitle className="text-xl sm:text-2xl md:text-3xl">My Favorites</CardTitle>
          </div>
          <CardDescription className="text-sm sm:text-base md:text-lg">
            Your saved images from Unsplash, Pexels, and Pixabay
          </CardDescription>
          <div className="flex items-center justify-center space-x-2 mt-4">
            <Badge variant="secondary" className="hover:scale-105 transition-transform duration-200 text-xs sm:text-sm">
              {favorites.length} images saved
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {favorites.length === 0 ? (
        <Card className="mt-4 sm:mt-8 animate-fade-in-up">
          <CardContent className="pt-4 sm:pt-6 text-center px-4 sm:px-6">
            <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm sm:text-base text-muted-foreground mb-2">
              You haven't saved any images yet.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Start searching and adding favorites to see them here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="animate-fade-in-up">
          <ImageGrid
            images={favoriteImages}
            favorites={favorites}
            onToggleFavorite={handleRemoveFavorite}
            onImageClick={handleImageClick}
            showRemoveButton={true}
            isLoading={isRemoving}
            loadingImageId={removingImageId}
          />
        </div>
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
          }).catch(() => {
            // Error handling - could be enhanced with user notifications
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