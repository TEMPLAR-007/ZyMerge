import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export function ImageModal({
    image,
    isOpen,
    onClose,
    isFavorited,
    onToggleFavorite,
    isLoading = false,
    isAuthenticated = false,
    onSignInRequired,
    showFavoriteButton = true
}: ImageModalProps) {
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [sizeMode, setSizeMode] = useState<'small' | 'medium' | 'large' | 'original' | 'custom'>('original');
    const [customWidth, setCustomWidth] = useState(600);
    const [customHeight, setCustomHeight] = useState(400);
    const [scalePercent, setScalePercent] = useState(100);
    const [cropSettings, setCropSettings] = useState({
        x: 0,
        y: 0,
        width: 100,
        height: 100
    });
    const [showCropOverlay, setShowCropOverlay] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragMode, setDragMode] = useState<'move' | 'resize' | 'create'>('create');
    const [activeHandle, setActiveHandle] = useState<string | null>(null);

    // Initialize image dimensions
    useEffect(() => {
        if (!isOpen || !image) return;

        const img = new Image();
        img.onload = () => {
            setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
            // Set custom dimensions to original size for fallback
            setCustomWidth(img.naturalWidth);
            setCustomHeight(img.naturalHeight);
            setLoading(false);
        };
        img.src = image.url;
        setLoading(true);
    }, [image, isOpen]);

    // Handle escape key
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

    const getDisplayDimensions = () => {
        const base = getBaseDimensions();
        const scaleFactor = scalePercent / 100;
        return {
            width: Math.round(base.width * scaleFactor),
            height: Math.round(base.height * scaleFactor)
        };
    };

    const getCurrentDisplayDimensions = () => {
        const displayDimensions = getDisplayDimensions();

        // Calculate max dimensions that fit in the container
        const containerMaxWidth = Math.min(window.innerWidth * 0.6, 800);
        const containerMaxHeight = Math.min(window.innerHeight * 0.7, 600);

        let finalWidth = displayDimensions.width;
        let finalHeight = displayDimensions.height;

        // Scale down if image is too large for container
        if (finalWidth > containerMaxWidth || finalHeight > containerMaxHeight) {
            const scaleX = containerMaxWidth / finalWidth;
            const scaleY = containerMaxHeight / finalHeight;
            const scale = Math.min(scaleX, scaleY);

            finalWidth = finalWidth * scale;
            finalHeight = finalHeight * scale;
        }

        return {
            width: Math.round(finalWidth),
            height: Math.round(finalHeight)
        };
    };

    const getFinalDimensions = () => {
        const base = getBaseDimensions();
        // Final dimensions are NOT affected by scale - scale is just for viewing
        const croppedWidth = (base.width * cropSettings.width) / 100;
        const croppedHeight = (base.height * cropSettings.height) / 100;
        return {
            width: Math.round(croppedWidth),
            height: Math.round(croppedHeight)
        };
    };

    const getImageStyle = () => {
        const displayDimensions = getDisplayDimensions();

        // Calculate max dimensions that fit in the container
        // Use more conservative sizing to ensure images fit well
        const containerMaxWidth = Math.min(window.innerWidth * 0.5, 1000);
        const containerMaxHeight = Math.min(window.innerHeight * 0.6, 800);

        let finalWidth = displayDimensions.width;
        let finalHeight = displayDimensions.height;

        // Scale down if image is too large for container
        if (finalWidth > containerMaxWidth || finalHeight > containerMaxHeight) {
            const scaleX = containerMaxWidth / finalWidth;
            const scaleY = containerMaxHeight / finalHeight;
            const scale = Math.min(scaleX, scaleY);

            finalWidth = finalWidth * scale;
            finalHeight = finalHeight * scale;
        }

        const style: React.CSSProperties = {
            width: finalWidth,
            height: finalHeight,
            objectFit: sizeMode === 'custom' ? 'fill' : 'contain' as const,
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
            // Ensure the image doesn't overflow its container
            overflow: 'hidden'
        };

        const isCropped = cropSettings.x > 0 || cropSettings.y > 0 ||
            cropSettings.width < 100 || cropSettings.height < 100;

        if (isCropped) {
            style.clipPath = `inset(${cropSettings.y}% ${100 - cropSettings.x - cropSettings.width}% ${100 - cropSettings.y - cropSettings.height}% ${cropSettings.x}%)`;
        }

        return style;
    };

    const maintainAspectRatio = () => {
        if (!imageSize.width || !imageSize.height) return;
        const aspectRatio = imageSize.width / imageSize.height;
        setCustomHeight(Math.round(customWidth / aspectRatio));
    };

    const resetAll = () => {
        setCropSettings({ x: 0, y: 0, width: 100, height: 100 });
        setScalePercent(100);
        setSizeMode('original');
        setCustomWidth(600);
        setCustomHeight(400);
        setShowCropOverlay(false);
        setIsDragging(false);
        setDragMode('create');
        setActiveHandle(null);
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

        const insideCrop = x >= cropSettings.x && x <= cropSettings.x + cropSettings.width &&
            y >= cropSettings.y && y <= cropSettings.y + cropSettings.height;

        if (insideCrop && cropSettings.width > 0 && cropSettings.height > 0) {
            setDragMode('move');
            setDragStart({ x: x - cropSettings.x, y: y - cropSettings.y });
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
        const rect = e.currentTarget.closest('[data-crop-image]')?.getBoundingClientRect();
        if (rect) {
            const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
            const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
            setDragStart({ x: mouseX, y: mouseY });
        }
    };

    const handleResize = (currentX: number, currentY: number) => {
        if (!activeHandle) return;
        const { x, y, width, height } = cropSettings;
        const minSize = 10;
        const right = x + width;
        const bottom = y + height;
        let newX = x;
        let newY = y;
        let newWidth = width;
        let newHeight = height;

        switch (activeHandle) {
            case 'nw':
                newX = Math.max(0, Math.min(right - minSize, currentX));
                newY = Math.max(0, Math.min(bottom - minSize, currentY));
                newWidth = right - newX;
                newHeight = bottom - newY;
                break;
            case 'ne':
                newY = Math.max(0, Math.min(bottom - minSize, currentY));
                newWidth = Math.max(minSize, Math.min(100 - x, currentX - x));
                newHeight = bottom - newY;
                break;
            case 'sw':
                newX = Math.max(0, Math.min(right - minSize, currentX));
                newWidth = right - newX;
                newHeight = Math.max(minSize, Math.min(100 - y, currentY - y));
                break;
            case 'se':
                newWidth = Math.max(minSize, Math.min(100 - x, currentX - x));
                newHeight = Math.max(minSize, Math.min(100 - y, currentY - y));
                break;
            case 'n':
                newY = Math.max(0, Math.min(bottom - minSize, currentY));
                newHeight = bottom - newY;
                break;
            case 's':
                newHeight = Math.max(minSize, Math.min(100 - y, currentY - y));
                break;
            case 'w':
                newX = Math.max(0, Math.min(right - minSize, currentX));
                newWidth = right - newX;
                break;
            case 'e':
                newWidth = Math.max(minSize, Math.min(100 - x, currentX - x));
                break;
        }

        setCropSettings({
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight
        });
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
            const minSize = 5;
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
            setCropSettings(prev => ({ ...prev, x: newX, y: newY }));
        } else if (dragMode === 'resize' && activeHandle) {
            handleResize(currentX, currentY);
        }
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

    // Global mouse event handlers for better crop interaction
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
                setCropSettings(prev => ({ ...prev, x: newX, y: newY }));
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

    const handleDownload = async () => {
        if (!image || !imageSize.width || !imageSize.height || isDownloading) return;

        if (!isAuthenticated && onSignInRequired) {
            onSignInRequired();
            return;
        }

        setIsDownloading(true);
        try {
            const finalDimensions = getFinalDimensions();
            const baseDimensions = getBaseDimensions();

            // Special handling for NASA images
            if (image.provider === 'nasa') {
                // For NASA images, try multiple download methods
                const downloadMethods = [
                    // Method 1: Direct fetch with CORS
                    async () => {
                        const response = await fetch(image.url, {
                            method: 'GET',
                            mode: 'cors',
                            headers: {
                                'Accept': 'image/*',
                            }
                        });

                        if (response.ok) {
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `nasa-${image.id}-${finalDimensions.width}x${finalDimensions.height}.jpg`;
                            a.style.display = 'none';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            return true;
                        }
                        return false;
                    },
                    // Method 2: Direct fetch without CORS
                    async () => {
                        try {
                            const response = await fetch(image.url, {
                                method: 'GET',
                                mode: 'no-cors'
                            });

                            if (response.type === 'opaque') {
                                // For no-cors responses, we can't access the blob directly
                                // So we'll open the image in a new tab for manual download
                                window.open(image.url, '_blank');
                                return true;
                            }
                            return false;
                        } catch {
                            return false;
                        }
                    },
                    // Method 3: Canvas method with CORS
                    async () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return false;

                        canvas.width = finalDimensions.width;
                        canvas.height = finalDimensions.height;

                        const img = new Image();
                        img.crossOrigin = 'anonymous';

                        return new Promise<boolean>((resolve) => {
                            img.onload = () => {
                                try {
                                    // Calculate crop parameters
                                    const cropX = (baseDimensions.width * cropSettings.x) / 100;
                                    const cropY = (baseDimensions.height * cropSettings.y) / 100;
                                    const cropWidth = (baseDimensions.width * cropSettings.width) / 100;
                                    const cropHeight = (baseDimensions.height * cropSettings.height) / 100;

                                    let sourceWidth = imageSize.width;
                                    let sourceHeight = imageSize.height;
                                    let sourceX = 0;
                                    let sourceY = 0;

                                    if (sizeMode !== 'original') {
                                        const scaleX = imageSize.width / baseDimensions.width;
                                        const scaleY = imageSize.height / baseDimensions.height;
                                        sourceX = cropX * scaleX;
                                        sourceY = cropY * scaleY;
                                        sourceWidth = cropWidth * scaleX;
                                        sourceHeight = cropHeight * scaleY;
                                    } else {
                                        sourceX = (imageSize.width * cropSettings.x) / 100;
                                        sourceY = (imageSize.height * cropSettings.y) / 100;
                                        sourceWidth = (imageSize.width * cropSettings.width) / 100;
                                        sourceHeight = (imageSize.height * cropSettings.height) / 100;
                                    }

                                    ctx.drawImage(
                                        img,
                                        sourceX, sourceY, sourceWidth, sourceHeight,
                                        0, 0, finalDimensions.width, finalDimensions.height
                                    );

                                    canvas.toBlob((blob) => {
                                        if (blob) {
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `nasa-${image.id}-${finalDimensions.width}x${finalDimensions.height}.jpg`;
                                            a.style.display = 'none';
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                            resolve(true);
                                        } else {
                                            resolve(false);
                                        }
                                    }, 'image/jpeg', 0.95);
                                } catch {
                                    resolve(false);
                                }
                            };
                            img.onerror = () => resolve(false);
                            img.src = image.url;
                        });
                    },
                    // Method 4: Canvas method without CORS
                    async () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return false;

                        canvas.width = finalDimensions.width;
                        canvas.height = finalDimensions.height;

                        const img = new Image();
                        // Don't set crossOrigin for this attempt

                        return new Promise<boolean>((resolve) => {
                            img.onload = () => {
                                try {
                                    // Calculate crop parameters
                                    const cropX = (baseDimensions.width * cropSettings.x) / 100;
                                    const cropY = (baseDimensions.height * cropSettings.y) / 100;
                                    const cropWidth = (baseDimensions.width * cropSettings.width) / 100;
                                    const cropHeight = (baseDimensions.height * cropSettings.height) / 100;

                                    let sourceWidth = imageSize.width;
                                    let sourceHeight = imageSize.height;
                                    let sourceX = 0;
                                    let sourceY = 0;

                                    if (sizeMode !== 'original') {
                                        const scaleX = imageSize.width / baseDimensions.width;
                                        const scaleY = imageSize.height / baseDimensions.height;
                                        sourceX = cropX * scaleX;
                                        sourceY = cropY * scaleY;
                                        sourceWidth = cropWidth * scaleX;
                                        sourceHeight = cropHeight * scaleY;
                                    } else {
                                        sourceX = (imageSize.width * cropSettings.x) / 100;
                                        sourceY = (imageSize.height * cropSettings.y) / 100;
                                        sourceWidth = (imageSize.width * cropSettings.width) / 100;
                                        sourceHeight = (imageSize.height * cropSettings.height) / 100;
                                    }

                                    ctx.drawImage(
                                        img,
                                        sourceX, sourceY, sourceWidth, sourceHeight,
                                        0, 0, finalDimensions.width, finalDimensions.height
                                    );

                                    canvas.toBlob((blob) => {
                                        if (blob) {
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `nasa-${image.id}-${finalDimensions.width}x${finalDimensions.height}.jpg`;
                                            a.style.display = 'none';
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                            resolve(true);
                                        } else {
                                            resolve(false);
                                        }
                                    }, 'image/jpeg', 0.95);
                                } catch {
                                    resolve(false);
                                }
                            };
                            img.onerror = () => resolve(false);
                            img.src = image.url;
                        });
                    }
                ];

                // Try each download method in sequence
                for (const method of downloadMethods) {
                    try {
                        const success = await method();
                        if (success) {
                            return; // Successfully downloaded
                        }
                    } catch (error) {
                        console.log('Download method failed:', error);
                        continue; // Try next method
                    }
                }

                // If all methods fail, open in new tab as final fallback
                window.open(image.url, '_blank');
                return;
            }

            // For non-NASA images, use the original canvas method
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Could not get canvas context');

            canvas.width = finalDimensions.width;
            canvas.height = finalDimensions.height;

            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = image.url;
            });

            // Calculate crop parameters in actual pixels
            const cropX = (baseDimensions.width * cropSettings.x) / 100;
            const cropY = (baseDimensions.height * cropSettings.y) / 100;
            const cropWidth = (baseDimensions.width * cropSettings.width) / 100;
            const cropHeight = (baseDimensions.height * cropSettings.height) / 100;

            // Calculate source dimensions based on resize mode
            let sourceWidth = imageSize.width;
            let sourceHeight = imageSize.height;
            let sourceX = 0;
            let sourceY = 0;

            if (sizeMode !== 'original') {
                const scaleX = imageSize.width / baseDimensions.width;
                const scaleY = imageSize.height / baseDimensions.height;
                sourceX = cropX * scaleX;
                sourceY = cropY * scaleY;
                sourceWidth = cropWidth * scaleX;
                sourceHeight = cropHeight * scaleY;
            } else {
                sourceX = (imageSize.width * cropSettings.x) / 100;
                sourceY = (imageSize.height * cropSettings.y) / 100;
                sourceWidth = (imageSize.width * cropSettings.width) / 100;
                sourceHeight = (imageSize.height * cropSettings.height) / 100;
            }

            ctx.drawImage(
                img,
                sourceX, sourceY, sourceWidth, sourceHeight,
                0, 0, finalDimensions.width, finalDimensions.height
            );

            canvas.toBlob((blob) => {
                if (!blob) throw new Error('Could not create image blob');

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${image.provider}-${image.id}-${finalDimensions.width}x${finalDimensions.height}.jpg`;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);

        } catch (error) {
            console.error('Download failed:', error);
            // Final fallback: open in new tab for manual download
            window.open(image.url, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    if (!isOpen || !image) return null;

    const baseDimensions = getBaseDimensions();
    const finalDimensions = getFinalDimensions();

    return (
        <>
            <style>{sliderStyles}</style>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={onClose}>
                <div
                    className="relative w-full h-full max-w-[1400px] max-h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden flex flex-col modal-content"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <div className="flex items-center gap-3 flex-wrap text-sm">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded capitalize">
                                {image.provider}
                            </span>
                            {!loading && (
                                <>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Original: {imageSize.width} × {imageSize.height}
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400">
                                        Base: {baseDimensions.width} × {baseDimensions.height}
                                    </span>
                                    <span className="text-green-600 dark:text-green-400">
                                        Final: {finalDimensions.width} × {finalDimensions.height}
                                    </span>
                                </>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Main Content - Canva-like Layout */}
                    <div className="flex flex-1 overflow-hidden min-h-0">
                        {/* Left Panel - Tools */}
                        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex-shrink-0">
                            <div className="p-4 space-y-6">


                                {/* Resize Control */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                        </svg>
                                        Output Size
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Width</span>
                                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {Math.round(getBaseDimensions().width)}px
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min="200"
                                            max={imageSize.width || 2000}
                                            step="50"
                                            value={Math.min(customWidth, imageSize.width || 2000)}
                                            onChange={(e) => {
                                                const newWidth = Number(e.target.value);
                                                setCustomWidth(newWidth);
                                                setSizeMode('custom');
                                            }}
                                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>200px</span>
                                            <span>{imageSize.width || 2000}px</span>
                                        </div>

                                        {/* Number inputs for precise control */}
                                        <div className="flex items-end gap-2 mt-3">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Width</label>
                                                <input
                                                    type="number"
                                                    value={customWidth}
                                                    onChange={(e) => {
                                                        const newWidth = Number(e.target.value);
                                                        setCustomWidth(Math.min(newWidth, imageSize.width || 2000));
                                                        setSizeMode('custom');
                                                    }}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    min="100"
                                                    max={imageSize.width || 2000}
                                                />
                                            </div>
                                            <span className="text-gray-400 pb-1">×</span>
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-600 dark:text-gray-400 block mb-1">Height</label>
                                                <input
                                                    type="number"
                                                    value={customHeight}
                                                    onChange={(e) => {
                                                        const newHeight = Number(e.target.value);
                                                        setCustomHeight(Math.min(newHeight, imageSize.height || 2000));
                                                        setSizeMode('custom');
                                                    }}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    min="100"
                                                    max={imageSize.height || 2000}
                                                />
                                            </div>
                                            <Button
                                                onClick={maintainAspectRatio}
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-2"
                                                title="Lock aspect ratio"
                                            >
                                                🔒
                                            </Button>
                                        </div>

                                        {/* Tip */}
                                        <div className="text-xs text-gray-400 text-center mt-2">
                                            💡 Use crop tool to adjust image dimensions
                                        </div>
                                    </div>
                                </div>

                                {/* Crop Controls */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v2m0 0v14a1 1 0 01-1 1H8a1 1 0 01-1-1V6m0 0H5a1 1 0 01-1 1v2a1 1 0 001 1h2" />
                                        </svg>
                                        Crop
                                    </h3>

                                    <button
                                        onClick={() => {
                                            if (!isAuthenticated && onSignInRequired) {
                                                onSignInRequired();
                                                return;
                                            }

                                            if (showCropOverlay) {
                                                // When hiding crop tool, reset to no crop
                                                setCropSettings({ x: 0, y: 0, width: 100, height: 100 });
                                            }

                                            setShowCropOverlay(!showCropOverlay);
                                        }}
                                        className={`w-full px-4 py-2 text-sm rounded-lg transition-colors ${showCropOverlay
                                            ? 'bg-green-600 text-white shadow-sm'
                                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                            }`}
                                    >
                                        {showCropOverlay ? 'Hide Crop Tool' : 'Enable Crop Tool'}
                                    </button>

                                    {/* Crop Presets */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quick Presets</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { key: 'none', label: 'None' },
                                                { key: 'square', label: '1:1' },
                                                { key: 'portrait', label: '3:4' },
                                                { key: 'landscape', label: '16:9' },
                                                { key: 'center', label: 'Center' }
                                            ].map((preset) => (
                                                <button
                                                    key={preset.key}
                                                    onClick={() => {
                                                        if (!isAuthenticated && onSignInRequired) {
                                                            onSignInRequired();
                                                            return;
                                                        }
                                                        applyCropPreset(preset.key);
                                                    }}
                                                    className="px-3 py-2 text-xs bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={resetAll}
                                        className="w-full px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                    >
                                        Reset All
                                    </button>
                                </div>

                                {/* Image Info */}
                                <div className="space-y-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Image Info</h3>
                                    <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex justify-between">
                                            <span>Provider:</span>
                                            <span className="capitalize font-medium">{image.provider}</span>
                                        </div>
                                        {!loading && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span>Original:</span>
                                                    <span className="font-medium">{imageSize.width} × {imageSize.height}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Output:</span>
                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                        {finalDimensions.width} × {finalDimensions.height}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Display:</span>
                                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                                        {getCurrentDisplayDimensions().width} × {getCurrentDisplayDimensions().height}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Image Preview */}
                        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800 min-h-0">
                            {/* Image Container */}
                            <div className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-0">
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : (
                                    <div className="relative inline-block max-w-full max-h-full">
                                        {showCropOverlay ? (
                                            // Crop mode - show original image with overlay
                                            <div className="relative">
                                                {/* Original image (background) */}
                                                <img
                                                    src={image.url}
                                                    alt={image.alt}
                                                    style={{
                                                        ...getImageStyle(),
                                                    }}
                                                    className="rounded-lg shadow-lg select-none transition-transform duration-100 max-w-full max-h-full object-contain"
                                                    draggable={false}
                                                />

                                                {/* Crop overlay container */}
                                                <div
                                                    className="absolute inset-0 cursor-crosshair"
                                                    data-crop-image
                                                    onMouseDown={handleImageMouseDown}
                                                    onMouseMove={handleImageMouseMove}
                                                    onMouseUp={handleImageMouseUp}
                                                >
                                                    {/* Dark overlay with crop area cut out */}
                                                    <div
                                                        className="absolute inset-0 bg-black/40 pointer-events-none"
                                                        style={{
                                                            clipPath: `polygon(
                                                                0% 0%,
                                                                0% 100%,
                                                                ${cropSettings.x}% 100%,
                                                                ${cropSettings.x}% ${cropSettings.y}%,
                                                                ${cropSettings.x + cropSettings.width}% ${cropSettings.y}%,
                                                                ${cropSettings.x + cropSettings.width}% ${cropSettings.y + cropSettings.height}%,
                                                                ${cropSettings.x}% ${cropSettings.y + cropSettings.height}%,
                                                                ${cropSettings.x}% 100%,
                                                                100% 100%,
                                                                100% 0%
                                                            )`
                                                        }}
                                                    />

                                                    {/* Crop selection area */}
                                                    <div
                                                        className="absolute border-2 border-white shadow-lg pointer-events-auto cursor-move"
                                                        style={{
                                                            left: `${cropSettings.x}%`,
                                                            top: `${cropSettings.y}%`,
                                                            width: `${cropSettings.width}%`,
                                                            height: `${cropSettings.height}%`,
                                                            boxShadow: '0 0 0 1px rgba(0,0,0,0.3), 0 2px 10px rgba(0,0,0,0.3)'
                                                        }}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setDragMode('move');
                                                            const rect = e.currentTarget.closest('[data-crop-image]')?.getBoundingClientRect();
                                                            if (rect) {
                                                                const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
                                                                const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
                                                                setDragStart({ x: mouseX - cropSettings.x, y: mouseY - cropSettings.y });
                                                            }
                                                            setIsDragging(true);
                                                        }}
                                                    >
                                                        {/* Corner resize handles */}
                                                        <div
                                                            className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-nw-resize hover:bg-blue-600 transition-colors shadow-md"
                                                            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
                                                            style={{ pointerEvents: 'auto' }}
                                                        />
                                                        <div
                                                            className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-ne-resize hover:bg-blue-600 transition-colors shadow-md"
                                                            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
                                                            style={{ pointerEvents: 'auto' }}
                                                        />
                                                        <div
                                                            className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-sw-resize hover:bg-blue-600 transition-colors shadow-md"
                                                            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
                                                            style={{ pointerEvents: 'auto' }}
                                                        />
                                                        <div
                                                            className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-se-resize hover:bg-blue-600 transition-colors shadow-md"
                                                            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
                                                            style={{ pointerEvents: 'auto' }}
                                                        />

                                                        {/* Edge resize handles */}
                                                        <div
                                                            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-blue-500 border-2 border-white rounded-sm cursor-n-resize hover:bg-blue-600 transition-colors shadow-md"
                                                            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
                                                            style={{ pointerEvents: 'auto' }}
                                                        />
                                                        <div
                                                            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-3 bg-blue-500 border-2 border-white rounded-sm cursor-s-resize hover:bg-blue-600 transition-colors shadow-md"
                                                            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
                                                            style={{ pointerEvents: 'auto' }}
                                                        />
                                                        <div
                                                            className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-3 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-w-resize hover:bg-blue-600 transition-colors shadow-md"
                                                            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
                                                            style={{ pointerEvents: 'auto' }}
                                                        />
                                                        <div
                                                            className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-4 bg-blue-500 border-2 border-white rounded-sm cursor-e-resize hover:bg-blue-600 transition-colors shadow-md"
                                                            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
                                                            style={{ pointerEvents: 'auto' }}
                                                        />

                                                        {/* Crop dimensions display */}
                                                        {isDragging && (
                                                            <div
                                                                className="absolute bg-white text-gray-900 text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-20"
                                                                style={{
                                                                    top: '-30px',
                                                                    left: '50%',
                                                                    transform: 'translateX(-50%)'
                                                                }}
                                                            >
                                                                {Math.round(cropSettings.width)}% × {Math.round(cropSettings.height)}%
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Normal mode - show image with crop effect applied
                                            <div
                                                className="relative overflow-hidden rounded-lg max-w-full max-h-full"
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={image.alt}
                                                    style={{
                                                        ...getImageStyle(),
                                                    }}
                                                    className="rounded-lg shadow-lg select-none transition-transform duration-100 max-w-full max-h-full object-contain"
                                                    draggable={false}
                                                />
                                            </div>
                                        )}

                                        {/* Crop status indicator */}
                                        {(cropSettings.x > 0 || cropSettings.y > 0 || cropSettings.width < 100 || cropSettings.height < 100) && (
                                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                                                Cropped {Math.round(cropSettings.width)}×{Math.round(cropSettings.height)}%
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
                        <div className="flex-1 min-w-0">
                            {image.alt && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                                    {image.alt}
                                </p>
                            )}
                            {image.credit && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Photo by{' '}
                                    {image.creditUrl ? (
                                        <a
                                            href={image.creditUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
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

                        <div className="flex items-center gap-3">
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
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isLoading
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
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isDownloading) {
                                        void handleDownload();
                                    }
                                }}
                                disabled={isDownloading}
                                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all duration-200 ${isDownloading
                                    ? 'bg-blue-400 cursor-not-allowed opacity-75'
                                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transform active:scale-95'
                                    }`}
                                title={isDownloading ? "Downloading..." : "Download image"}
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
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
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