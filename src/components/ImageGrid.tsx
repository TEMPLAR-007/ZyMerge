interface Image {
  provider: string;
  id: string;
  url: string;
  thumb?: string;
  alt: string;
  link: string;
  credit?: string;
  creditUrl?: string;
}

interface ImageGridProps {
  images: Image[];
  favorites: any[];
  onToggleFavorite: (img: Image) => void;
  onImageClick?: (img: Image) => void;
  showRemoveButton?: boolean;
  isLoading?: boolean;
  loadingImageId?: string | null;
}

export function ImageGrid({ images, favorites, onToggleFavorite, onImageClick, showRemoveButton = false, isLoading = false, loadingImageId = null }: ImageGridProps) {
  const isFavorited = (img: Image) =>
    favorites.some(
      (fav: any) => fav.provider === img.provider && fav.imageId === String(img.id)
    );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {images.map((img) => (
        <div key={`${img.provider}-${img.id}-${img.url}`} className="relative group block">
          <div
            className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onImageClick?.(img)}
          >
            <img
              src={img.thumb || img.url}
              alt={img.alt}
              className="w-full h-32 sm:h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
              <div className="text-white text-xs font-medium capitalize">
                {img.provider}
              </div>
            </div>
            {/* Click overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-black/90 rounded-full p-1.5 sm:p-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(img);
            }}
            disabled={isLoading && loadingImageId === String(img.id)}
            className={`absolute top-1 right-1 sm:top-2 sm:right-2 z-10 bg-white/80 dark:bg-black/60 rounded-full p-2 sm:p-2.5 shadow transition-transform min-w-[32px] min-h-[32px] sm:min-w-[36px] sm:min-h-[36px] flex items-center justify-center ${isLoading && loadingImageId === String(img.id)
              ? 'cursor-not-allowed opacity-50'
              : 'hover:scale-110 active:scale-95'
              }`}
            aria-label={showRemoveButton ? "Remove from favorites" : (isFavorited(img) ? "Remove from favorites" : "Add to favorites")}
          >
            {isLoading && loadingImageId === String(img.id) ? (
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-red-500"></div>
            ) : showRemoveButton ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#e11d48" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : isFavorited(img) ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="#e11d48" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#e11d48" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 6.584a5.754 5.754 0 00-9.07-2.157l-.682.68-.682-.68A5.754 5.754 0 002.248 6.584a5.753 5.753 0 00.824 7.815l8.116 7.407a.75.75 0 001.024 0l8.116-7.407a5.753 5.753 0 00.824-7.815z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#e11d48" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 6.584a5.754 5.754 0 00-9.07-2.157l-.682.68-.682-.68A5.754 5.754 0 002.248 6.584a5.753 5.753 0 00.824 7.815l8.116 7.407a.75.75 0 001.024 0l8.116-7.407a5.753 5.753 0 00.824-7.815z" />
              </svg>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}