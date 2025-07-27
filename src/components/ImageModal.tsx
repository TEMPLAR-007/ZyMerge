import { useState, useEffect } from "react";

// Add custom slider styles
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  .slider::-webkit-slider-track {
    height: 8px;
    border-radius: 4px;
    background: #e5e7eb;
  }

  .dark .slider::-webkit-slider-track {
    background: #374151;
  }
`;

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

interface ImageModalProps {
    image: Image | null;
    isOpen: boolean;
    onClose: () => void;
    isFavorited: boolean;
    onToggleFavorite: () => void;
    isLoading?: boolean;
    isAuthenticated?: boolean;
    onSignInRequired?: () => void;
    showFavoriteButton?: boolean;
}

export function ImageModal({ image, isOpen, onClose, isFavorited, onToggleFavorite, isLoading = false, isAuthenticated = false, onSignInRequired, showFavoriteButton = true }: ImageModalProps) {
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [sizeMode, setSizeMode] = useState<'small' | 'medium' | 'large' | 'original' | 'custom'>('medium');
    const [customWidth, setCustomWidth] = useState(600);
    const [customHeight, setCustomHeight] = useState(400);
    const [scalePercent, setScalePercent] = useState(100);
    const [cropSettings, setCropSettings] = useState({
        x: 0,
        y: 0,
        width: 100,
        height: 100
    });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [showCropOverlay, setShowCropOverlay] = useState(false);
    const [dragMode, setDragMode] = useState<'move' | 'resize' | 'create'>('create');
    const [activeHandle, setActiveHandle] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || !image) return;

        const img = new Image();
        img.onload = () => {
            setImageSize({ width: img.naturalWidth, height: img.naturalHeight });

            // Initialize custom dimensions based on medium size
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const mediumWidth = 600;
            const mediumHeight = Math.round(mediumWidth / aspectRatio);
            setCustomWidth(mediumWidth);
            setCustomHeight(mediumHeight);

            setLoading(false);
        };
        img.src = image.url;
        setLoading(true);
    }, [image, isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Get base dimensions without scaling
    const getBaseDimensions = () => {
        if (!imageSize.width || !imageSize.height) return { width: 600, height: 400 };

        const aspectRatio = imageSize.width / imageSize.height;

        switch (sizeMode) {
            case 'small':
                return { width: 400, height: Math.round(400 / aspectRatio) };
            case 'medium':
                return { width: 600, height: Math.round(600 / aspectRatio) };
            case 'large':
                return { width: 800, height: Math.round(800 / aspectRatio) };
            case 'original':
                return { width: imageSize.width, height: imageSize.height };
            case 'custom':
                return { width: customWidth, height: customHeight };
            default:
                return { width: 600, height: Math.round(600 / aspectRatio) };
        }
    };

    // Get display dimensions with scaling applied (for image element size)
    const getDisplayDimensions = () => {
        const base = getBaseDimensions();
        const scaleFactor = scalePercent / 100;
        return {
            width: Math.round(base.width * scaleFactor),
            height: Math.round(base.height * scaleFactor)
        };
    };

    // Get final output dimensions with scaling and cropping applied (for download/display info)
    const getFinalDimensions = () => {
        const base = getBaseDimensions();
        const scaleFactor = scalePercent / 100;

        // Apply cropping to the base dimensions
        const croppedWidth = (base.width * cropSettings.width) / 100;
        const croppedHeight = (base.height * cropSettings.height) / 100;

        // Then apply scaling
        return {
            width: Math.round(croppedWidth * scaleFactor),
            height: Math.round(croppedHeight * scaleFactor)
        };
    };

    const getImageStyle = () => {
        const displayDimensions = getDisplayDimensions();

        const style: React.CSSProperties = {
            width: displayDimensions.width,
            height: displayDimensions.height,
            objectFit: sizeMode === 'custom' ? 'fill' : 'contain' as const,
            display: 'block'
        };

        // Only apply crop if it's actually cropped
        const isCropped = cropSettings.x > 0 || cropSettings.y > 0 ||
            cropSettings.width < 100 || cropSettings.height < 100;

        if (isCropped) {
            style.clipPath = `inset(${cropSettings.y}% ${100 - cropSettings.x - cropSettings.width}% ${100 - cropSettings.y - cropSettings.height}% ${cropSettings.x}%)`;
        }

        return style;
    };

    const handleDownload = async () => {
        if (!image || !imageSize.width || !imageSize.height || isDownloading) return;

        // Check if user is authenticated for download
        if (!isAuthenticated && onSignInRequired) {
            onSignInRequired();
            return;
        }

        setIsDownloading(true);
        try {
            // Create a canvas to render the resized/cropped image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const finalDimensions = getFinalDimensions();

            // Set canvas size to final dimensions
            canvas.width = finalDimensions.width;
            canvas.height = finalDimensions.height;

            // Load the original image
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Handle CORS

            img.onload = () => {
                // Calculate crop dimensions in pixels from the original image
                const cropX = (cropSettings.x / 100) * img.naturalWidth;
                const cropY = (cropSettings.y / 100) * img.naturalHeight;
                const cropWidth = (cropSettings.width / 100) * img.naturalWidth;
                const cropHeight = (cropSettings.height / 100) * img.naturalHeight;

                // Calculate the proper output dimensions
                // First get the base dimensions for the selected size mode
                const baseDimensions = getBaseDimensions();

                // Then calculate what the cropped base dimensions would be
                const croppedBaseWidth = (baseDimensions.width * cropSettings.width) / 100;
                const croppedBaseHeight = (baseDimensions.height * cropSettings.height) / 100;

                // Apply the scale factor to get final output dimensions
                const scaleFactor = scalePercent / 100;
                const outputWidth = Math.round(croppedBaseWidth * scaleFactor);
                const outputHeight = Math.round(croppedBaseHeight * scaleFactor);

                // Set canvas to the correct output dimensions
                canvas.width = outputWidth;
                canvas.height = outputHeight;

                // Draw the cropped portion of the original image, scaled to output size
                ctx.drawImage(
                    img,
                    cropX, cropY, cropWidth, cropHeight, // Source: crop area from original image
                    0, 0, outputWidth, outputHeight // Destination: final output size
                );

                // Convert canvas to blob and download
                canvas.toBlob((blob) => {
                    if (!blob) return;

                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${image.provider}-${image.id}-${outputWidth}x${outputHeight}.jpg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 'image/jpeg', 0.9);
            };

            img.onerror = () => {
                console.error('Failed to load image for download');
                // Fallback to original download
                void fallbackDownload();
            };

            img.src = image.url;
        } catch (error) {
            console.error('Download failed:', error);
            void fallbackDownload();
        } finally {
            setIsDownloading(false);
        }
    };

    const fallbackDownload = async () => {
        if (!image) return;

        try {
            const response = await fetch(image.url);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${image.provider}-${image.id}-original.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Fallback download failed:', error);
        }
    };

    const updateCustomFromCurrent = () => {
        const current = getFinalDimensions();
        // Set custom dimensions to the final size and reset scale to 100%
        // This prevents the feedback loop where scaled dimensions get scaled again
        setCustomWidth(current.width);
        setCustomHeight(current.height);
        setScalePercent(100); // Reset scale since we're capturing the final scaled size
        setSizeMode('custom');
    };

    const maintainAspectRatio = () => {
        if (!imageSize.width || !imageSize.height) return;
        const aspectRatio = imageSize.width / imageSize.height;
        setCustomHeight(Math.round(customWidth / aspectRatio));
    };

    const resetAll = () => {
        setSizeMode('medium');
        setScalePercent(100);
        setCropSettings({ x: 0, y: 0, width: 100, height: 100 });
        setShowCropOverlay(false);
    };

    const applyCropPreset = (preset: string) => {
        switch (preset) {
            case 'square':
                setCropSettings({ x: 12.5, y: 0, width: 75, height: 75 });
                break;
            case 'portrait':
                setCropSettings({ x: 20, y: 0, width: 60, height: 100 });
                break;
            case 'landscape':
                setCropSettings({ x: 0, y: 20, width: 100, height: 60 });
                break;
            case 'center':
                setCropSettings({ x: 10, y: 10, width: 80, height: 80 });
                break;
            default:
                setCropSettings({ x: 0, y: 0, width: 100, height: 100 });
        }
        setShowCropOverlay(true);
    };

    const handleImageMouseDown = (e: React.MouseEvent) => {
        if (!showCropOverlay) return;

        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        // Check if clicking inside existing crop area
        const insideCrop = x >= cropSettings.x && x <= cropSettings.x + cropSettings.width &&
            y >= cropSettings.y && y <= cropSettings.y + cropSettings.height;

        if (insideCrop && cropSettings.width > 0 && cropSettings.height > 0) {
            setDragMode('move');
            setDragStart({
                x: x - cropSettings.x,
                y: y - cropSettings.y
            });
        } else {
            setDragMode('create');
            setDragStart({ x, y });
            setCropSettings({ x, y, width: 1, height: 1 });
        }

        setIsDragging(true);
    };

    const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();

        setDragMode('resize');
        setActiveHandle(handle);
        setIsDragging(true);

        // Store initial mouse position and crop settings
        const rect = e.currentTarget.closest('[data-crop-image]')?.getBoundingClientRect();
        if (rect) {
            const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
            const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
            setDragStart({ x: mouseX, y: mouseY });
        }
    };

    const handleImageMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !showCropOverlay) return;

        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        if (dragMode === 'create') {
            const width = Math.abs(currentX - dragStart.x);
            const height = Math.abs(currentY - dragStart.y);
            const x = Math.min(dragStart.x, currentX);
            const y = Math.min(dragStart.y, currentY);

            const minSize = 3;
            const finalWidth = Math.max(minSize, Math.min(100 - x, width));
            const finalHeight = Math.max(minSize, Math.min(100 - y, height));

            setCropSettings({
                x: Math.max(0, Math.min(100 - finalWidth, x)),
                y: Math.max(0, Math.min(100 - finalHeight, y)),
                width: finalWidth,
                height: finalHeight
            });
        } else if (dragMode === 'move') {
            const newX = Math.max(0, Math.min(100 - cropSettings.width, currentX - dragStart.x));
            const newY = Math.max(0, Math.min(100 - cropSettings.height, currentY - dragStart.y));

            setCropSettings(prev => ({
                ...prev,
                x: newX,
                y: newY
            }));
        } else if (dragMode === 'resize' && activeHandle) {
            handleResize(currentX, currentY);
        }
    };

    const handleResize = (currentX: number, currentY: number) => {
        if (!activeHandle) return;

        const { x, y, width, height } = cropSettings;
        const minSize = 10;

        // Calculate the opposite corner/edge coordinates
        const right = x + width;
        const bottom = y + height;

        let newX = x;
        let newY = y;
        let newWidth = width;
        let newHeight = height;

        switch (activeHandle) {
            case 'nw': // Top-left corner - resize from top-left, bottom-right stays fixed
                newX = Math.max(0, Math.min(right - minSize, currentX));
                newY = Math.max(0, Math.min(bottom - minSize, currentY));
                newWidth = right - newX;
                newHeight = bottom - newY;
                break;

            case 'ne': // Top-right corner - resize from top-right, bottom-left stays fixed
                newY = Math.max(0, Math.min(bottom - minSize, currentY));
                newWidth = Math.max(minSize, Math.min(100 - x, currentX - x));
                newHeight = bottom - newY;
                break;

            case 'sw': // Bottom-left corner - resize from bottom-left, top-right stays fixed
                newX = Math.max(0, Math.min(right - minSize, currentX));
                newWidth = right - newX;
                newHeight = Math.max(minSize, Math.min(100 - y, currentY - y));
                break;

            case 'se': // Bottom-right corner - resize from bottom-right, top-left stays fixed
                newWidth = Math.max(minSize, Math.min(100 - x, currentX - x));
                newHeight = Math.max(minSize, Math.min(100 - y, currentY - y));
                break;

            case 'n': // Top edge - resize from top, bottom stays fixed
                newY = Math.max(0, Math.min(bottom - minSize, currentY));
                newHeight = bottom - newY;
                break;

            case 's': // Bottom edge - resize from bottom, top stays fixed
                newHeight = Math.max(minSize, Math.min(100 - y, currentY - y));
                break;

            case 'w': // Left edge - resize from left, right stays fixed
                newX = Math.max(0, Math.min(right - minSize, currentX));
                newWidth = right - newX;
                break;

            case 'e': // Right edge - resize from right, left stays fixed
                newWidth = Math.max(minSize, Math.min(100 - x, currentX - x));
                break;
        }

        // Apply the new settings
        setCropSettings({
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
        });
    };

    const handleImageMouseUp = () => {
        if (isDragging) {
            setCropSettings(prev => ({
                ...prev,
                width: Math.max(10, prev.width),
                height: Math.max(10, prev.height)
            }));
        }
        setIsDragging(false);
        setDragMode('create');
        setActiveHandle(null);
    };

    // Add global mouse events for better drag experience
    useEffect(() => {
        if (!isDragging) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!showCropOverlay) return;

            const imageElement = document.querySelector('[data-crop-image]') as HTMLElement;
            if (!imageElement) return;

            const rect = imageElement.getBoundingClientRect();
            const currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
            const currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

            if (dragMode === 'create') {
                const width = Math.abs(currentX - dragStart.x);
                const height = Math.abs(currentY - dragStart.y);
                const x = Math.min(dragStart.x, currentX);
                const y = Math.min(dragStart.y, currentY);

                const minSize = 3;
                const finalWidth = Math.max(minSize, Math.min(100 - x, width));
                const finalHeight = Math.max(minSize, Math.min(100 - y, height));

                setCropSettings({
                    x: Math.max(0, Math.min(100 - finalWidth, x)),
                    y: Math.max(0, Math.min(100 - finalHeight, y)),
                    width: finalWidth,
                    height: finalHeight
                });
            } else if (dragMode === 'move') {
                const newX = Math.max(0, Math.min(100 - cropSettings.width, currentX - dragStart.x));
                const newY = Math.max(0, Math.min(100 - cropSettings.height, currentY - dragStart.y));

                setCropSettings(prev => ({
                    ...prev,
                    x: newX,
                    y: newY
                }));
            } else if (dragMode === 'resize' && activeHandle) {
                handleResize(currentX, currentY);
            }
        };

        const handleGlobalMouseUp = () => {
            if (isDragging) {
                setCropSettings(prev => ({
                    ...prev,
                    width: Math.max(10, prev.width),
                    height: Math.max(10, prev.height)
                }));
            }
            setIsDragging(false);
            setDragMode('create');
            setActiveHandle(null);
        };

        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, dragStart, showCropOverlay, dragMode, activeHandle, cropSettings]);

    if (!isOpen || !image) return null;

    const baseDimensions = getBaseDimensions();
    const finalDimensions = getFinalDimensions();

    return (
        <>
            <style>{sliderStyles}</style>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
                <div
                    className="relative w-[95vw] h-[95vh] max-w-7xl bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded capitalize">
                                {image.provider}
                            </span>
                            {!loading && (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Original: {imageSize.width} × {imageSize.height}
                                </span>
                            )}
                            {!loading && (
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                    Base: {baseDimensions.width} × {baseDimensions.height}
                                </span>
                            )}
                            {!loading && (
                                <span className="text-sm text-green-600 dark:text-green-400">
                                    Final: {finalDimensions.width} × {finalDimensions.height}
                                    {(cropSettings.x > 0 || cropSettings.y > 0 || cropSettings.width < 100 || cropSettings.height < 100) && (
                                        <span className="ml-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1 rounded">
                                            cropped
                                        </span>
                                    )}
                                </span>
                            )}
                            {!loading && scalePercent !== 100 && (
                                <span className="text-sm text-purple-600 dark:text-purple-400">
                                    Scale: {scalePercent}%
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Size Controls */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto max-h-[35vh]">
                        {/* Compact Controls Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 mb-3">
                            {/* Size Controls */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-12">Size:</span>
                                    <div className="flex gap-1">
                                        {(['small', 'medium', 'large', 'original'] as const).map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => {
                                                    if (!isAuthenticated && onSignInRequired && size !== 'medium') {
                                                        onSignInRequired();
                                                        return;
                                                    }
                                                    setSizeMode(size);
                                                }}
                                                className={`px-2 py-1 text-xs rounded transition-colors capitalize ${sizeMode === size
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                    }`}
                                            >
                                                {size === 'original' ? 'orig' : size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Custom Size Inputs */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-600 dark:text-gray-400 w-12">Custom:</span>
                                    <input
                                        type="number"
                                        value={customWidth}
                                        onChange={(e) => {
                                            const newWidth = Number(e.target.value);
                                            setCustomWidth(newWidth);
                                            setSizeMode('custom');
                                        }}
                                        className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        min="100"
                                        max="2000"
                                    />
                                    <span className="text-xs text-gray-500">×</span>
                                    <input
                                        type="number"
                                        value={customHeight}
                                        onChange={(e) => {
                                            const newHeight = Number(e.target.value);
                                            setCustomHeight(newHeight);
                                            setSizeMode('custom');
                                        }}
                                        className="w-16 px-1 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        min="100"
                                        max="2000"
                                    />
                                    <button
                                        onClick={maintainAspectRatio}
                                        className="px-1 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                                        title="Maintain aspect ratio"
                                    >
                                        📐
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 justify-end">
                                <button
                                    onClick={updateCustomFromCurrent}
                                    className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                >
                                    Use Current
                                </button>
                                <button
                                    onClick={resetAll}
                                    className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                                >
                                    Reset All
                                </button>
                            </div>
                        </div>

                        {/* Scale Slider */}
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 w-12">Scale:</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">25%</span>
                            <input
                                type="range"
                                min="25"
                                max="200"
                                value={scalePercent}
                                onChange={(e) => {
                                    if (!isAuthenticated && onSignInRequired && Number(e.target.value) !== 100) {
                                        onSignInRequired();
                                        return;
                                    }
                                    setScalePercent(Number(e.target.value));
                                }}
                                className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">200%</span>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 w-10">
                                {scalePercent}%
                            </span>
                            <button
                                onClick={() => {
                                    if (!isAuthenticated && onSignInRequired && scalePercent !== 100) {
                                        onSignInRequired();
                                        return;
                                    }
                                    setScalePercent(100);
                                }}
                                className="px-1 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                                title="Reset to 100%"
                            >
                                100%
                            </button>
                        </div>

                        {/* Crop Controls */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Crop:</span>
                                <button
                                    onClick={() => {
                                        if (!isAuthenticated && onSignInRequired) {
                                            onSignInRequired();
                                            return;
                                        }
                                        setShowCropOverlay(!showCropOverlay);
                                    }}
                                    className={`px-3 py-1 text-xs rounded-md transition-colors ${showCropOverlay
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {showCropOverlay ? 'Hide Crop Tool' : 'Show Crop Tool'}
                                </button>
                            </div>

                            {/* Crop Presets */}
                            <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-xs text-gray-600 dark:text-gray-400 mr-1">Quick:</span>
                                {[
                                    { key: 'none', label: 'None' },
                                    { key: 'square', label: '1:1' },
                                    { key: 'portrait', label: '3:4' },
                                    { key: 'landscape', label: '16:9' },
                                    { key: 'center', label: '80%' }
                                ].map((preset) => (
                                    <button
                                        key={preset.key}
                                        onClick={() => applyCropPreset(preset.key)}
                                        className="px-1 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            {/* Manual Crop Sliders - Only show when crop overlay is active */}
                            {showCropOverlay && (
                                <div className="space-y-1 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                    <div className="text-xs text-green-700 dark:text-green-300 mb-1">
                                        💡 Drag on image or use sliders for precision
                                    </div>

                                    {/* Compact 4-column grid for all crop controls */}
                                    <div className="grid grid-cols-4 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400">X: {Math.round(cropSettings.x)}%</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max={100 - cropSettings.width}
                                                value={cropSettings.x}
                                                onChange={(e) => setCropSettings(prev => ({ ...prev, x: Number(e.target.value) }))}
                                                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400">Y: {Math.round(cropSettings.y)}%</label>
                                            <input
                                                type="range"
                                                min="0"
                                                max={100 - cropSettings.height}
                                                value={cropSettings.y}
                                                onChange={(e) => setCropSettings(prev => ({ ...prev, y: Number(e.target.value) }))}
                                                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400">W: {Math.round(cropSettings.width)}%</label>
                                            <input
                                                type="range"
                                                min="10"
                                                max={100 - cropSettings.x}
                                                value={cropSettings.width}
                                                onChange={(e) => setCropSettings(prev => ({ ...prev, width: Number(e.target.value) }))}
                                                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 dark:text-gray-400">H: {Math.round(cropSettings.height)}%</label>
                                            <input
                                                type="range"
                                                min="10"
                                                max={100 - cropSettings.y}
                                                value={cropSettings.height}
                                                onChange={(e) => setCropSettings(prev => ({ ...prev, height: Number(e.target.value) }))}
                                                className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative flex-1 bg-gray-100 dark:bg-gray-800 overflow-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800">
                        {loading && (
                            <div className="flex items-center justify-center h-64 w-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                            </div>
                        )}
                        {!loading && (
                            <>
                                <div className="flex items-center justify-center min-h-full min-w-full">
                                    <div
                                        className="relative inline-block"
                                        onMouseDown={handleImageMouseDown}
                                        onMouseMove={handleImageMouseMove}
                                        onMouseUp={handleImageMouseUp}
                                        onMouseLeave={handleImageMouseUp}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.alt}
                                            data-crop-image
                                            style={getImageStyle()}
                                            className={`border border-gray-300 dark:border-gray-600 shadow-lg transition-all duration-200 ease-in-out ${showCropOverlay ? 'cursor-crosshair' : ''
                                                }`}
                                            onLoad={() => setLoading(false)}
                                            onError={() => {
                                                console.error('Image failed to load:', image.url);
                                                setLoading(false);
                                            }}
                                            draggable={false}
                                        />

                                        {/* Visual Crop Overlay */}
                                        {showCropOverlay && (
                                            <div
                                                className="absolute inset-0 pointer-events-none"
                                                style={{
                                                    background: `
                                                    linear-gradient(to right,
                                                        rgba(0,0,0,0.6) ${cropSettings.x}%,
                                                        transparent ${cropSettings.x}%,
                                                        transparent ${cropSettings.x + cropSettings.width}%,
                                                        rgba(0,0,0,0.6) ${cropSettings.x + cropSettings.width}%
                                                    ),
                                                    linear-gradient(to bottom,
                                                        rgba(0,0,0,0.6) ${cropSettings.y}%,
                                                        transparent ${cropSettings.y}%,
                                                        transparent ${cropSettings.y + cropSettings.height}%,
                                                        rgba(0,0,0,0.6) ${cropSettings.y + cropSettings.height}%
                                                    )
                                                `
                                                }}
                                            >
                                                {/* Crop area border */}
                                                <div
                                                    className={`absolute border-2 transition-all duration-100 ${isDragging
                                                        ? 'border-green-500 border-solid shadow-lg'
                                                        : 'border-green-400 border-dashed'
                                                        } ${dragMode === 'move' ? 'cursor-move' : 'cursor-default'}`}
                                                    style={{
                                                        left: `${cropSettings.x}%`,
                                                        top: `${cropSettings.y}%`,
                                                        width: `${cropSettings.width}%`,
                                                        height: `${cropSettings.height}%`
                                                    }}
                                                >
                                                    {/* Corner resize handles */}
                                                    <div
                                                        className="absolute -top-2 -left-2 w-4 h-4 bg-green-400 border-2 border-white rounded-sm cursor-nw-resize hover:bg-green-500 transition-colors z-20 shadow-md"
                                                        onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                                                        style={{ pointerEvents: 'auto' }}
                                                    ></div>
                                                    <div
                                                        className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 border-2 border-white rounded-sm cursor-ne-resize hover:bg-green-500 transition-colors z-20 shadow-md"
                                                        onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                                                        style={{ pointerEvents: 'auto' }}
                                                    ></div>
                                                    <div
                                                        className="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400 border-2 border-white rounded-sm cursor-sw-resize hover:bg-green-500 transition-colors z-20 shadow-md"
                                                        onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                                                        style={{ pointerEvents: 'auto' }}
                                                    ></div>
                                                    <div
                                                        className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-400 border-2 border-white rounded-sm cursor-se-resize hover:bg-green-500 transition-colors z-20 shadow-md"
                                                        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                                                        style={{ pointerEvents: 'auto' }}
                                                    ></div>

                                                    {/* Edge resize handles */}
                                                    <div
                                                        className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-green-400 border-2 border-white rounded-sm cursor-n-resize hover:bg-green-500 transition-colors z-20 shadow-md"
                                                        onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                                                        style={{ pointerEvents: 'auto' }}
                                                    ></div>
                                                    <div
                                                        className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-green-400 border-2 border-white rounded-sm cursor-s-resize hover:bg-green-500 transition-colors z-20 shadow-md"
                                                        onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                                                        style={{ pointerEvents: 'auto' }}
                                                    ></div>
                                                    <div
                                                        className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-3 h-4 bg-green-400 border-2 border-white rounded-sm cursor-w-resize hover:bg-green-500 transition-colors z-20 shadow-md"
                                                        onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                                                        style={{ pointerEvents: 'auto' }}
                                                    ></div>
                                                    <div
                                                        className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-4 bg-green-400 border-2 border-white rounded-sm cursor-e-resize hover:bg-green-500 transition-colors z-20 shadow-md"
                                                        onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                                                        style={{ pointerEvents: 'auto' }}
                                                    ></div>

                                                    {/* Grid lines for better visual guidance */}
                                                    <div className="absolute inset-0 pointer-events-none">
                                                        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-green-400/50"></div>
                                                        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-green-400/50"></div>
                                                        <div className="absolute top-1/3 left-0 right-0 h-px bg-green-400/50"></div>
                                                        <div className="absolute top-2/3 left-0 right-0 h-px bg-green-400/50"></div>
                                                    </div>

                                                    {/* Move cursor hint */}
                                                    {dragMode === 'move' && isDragging && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="bg-green-500/80 text-white text-xs px-2 py-1 rounded">
                                                                Move
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Crop dimensions display during drag */}
                                                {isDragging && (
                                                    <div
                                                        className="absolute bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
                                                        style={{
                                                            left: `${Math.min(95, cropSettings.x + cropSettings.width)}%`,
                                                            top: `${Math.max(5, cropSettings.y - 5)}%`,
                                                            transform: 'translateX(-100%)'
                                                        }}
                                                    >
                                                        {Math.round(cropSettings.width)}% × {Math.round(cropSettings.height)}%
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Crop status indicator */}
                                    {(cropSettings.x > 0 || cropSettings.y > 0 || cropSettings.width < 100 || cropSettings.height < 100) && (
                                        <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded z-10">
                                            Cropped {Math.round(cropSettings.width)}×{Math.round(cropSettings.height)}%
                                        </div>
                                    )}
                                </div>

                                {/* Scroll hint - show when image is larger than container */}
                                {(() => {
                                    const displayDims = getDisplayDimensions();
                                    const containerMaxWidth = 800; // Approximate container width
                                    const containerMaxHeight = 400; // Approximate container height
                                    const needsScrollX = displayDims.width > containerMaxWidth;
                                    const needsScrollY = displayDims.height > containerMaxHeight;
                                    const needsScroll = needsScrollX || needsScrollY;

                                    return needsScroll && (
                                        <div className="absolute top-2 right-2 bg-blue-500/90 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-20">
                                            <div className="flex items-center gap-1">
                                                <span>Scroll to view</span>
                                                <div className="flex gap-1">
                                                    {needsScrollX && <span>↔</span>}
                                                    {needsScrollY && <span>↕</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex-1">
                            {image.alt && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                                    {image.alt}
                                </p>
                            )}
                            {image.credit && (
                                <p className="text-xs text-white dark:text-white">
                                    Photo by{' '}
                                    {image.creditUrl ? (
                                        <a
                                            href={image.creditUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-300 dark:text-blue-300 hover:underline font-medium"
                                        >
                                            {image.credit}
                                        </a>
                                    ) : (
                                        <span className="font-medium">{image.credit}</span>
                                    )}
                                    {' '}on {image.provider.charAt(0).toUpperCase() + image.provider.slice(1)}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                            {/* Favorite Button */}
                            {showFavoriteButton && (
                                <button
                                    onClick={() => {
                                        if (!isAuthenticated && onSignInRequired) {
                                            onSignInRequired();
                                        } else {
                                            onToggleFavorite();
                                        }
                                    }}
                                    disabled={isLoading}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isLoading
                                        ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                    title={isFavorited ? "Remove from favorites" : "Add to favorites"}
                                >
                                    {isLoading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                                    ) : isFavorited ? (
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21.752 6.584a5.754 5.754 0 00-9.07-2.157l-.682.68-.682-.68A5.754 5.754 0 002.248 6.584a5.753 5.753 0 00.824 7.815l8.116 7.407a.75.75 0 001.024 0l8.116-7.407a5.753 5.753 0 00.824-7.815z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.752 6.584a5.754 5.754 0 00-9.07-2.157l-.682.68-.682-.68A5.754 5.754 0 002.248 6.584a5.753 5.753 0 00.824 7.815l8.116 7.407a.75.75 0 001.024 0l8.116-7.407a5.753 5.753 0 00.824-7.815z" />
                                        </svg>
                                    )}
                                    <span className="text-sm">
                                        {isLoading ? "Removing..." : isFavorited ? "Remove" : "Favorite"}
                                    </span>
                                </button>
                            )}

                            {/* Download Button */}
                            <button
                                onClick={() => void handleDownload()}
                                disabled={isDownloading}
                                className={`flex items-center gap-2 px-3 py-2 text-white rounded-md transition-colors ${isDownloading
                                    ? 'bg-blue-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {isDownloading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                )}
                                <span className="text-sm">{isDownloading ? "Downloading..." : "Download"}</span>
                            </button>

                            {/* View Original Button */}
                            <a
                                href={image.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span className="text-sm">View Original</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

