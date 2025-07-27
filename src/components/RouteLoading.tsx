import { Heart, Search, Home } from "lucide-react";

interface RouteLoadingProps {
    isLoading: boolean;
    targetView?: "home" | "search" | "favorites";
}

export function RouteLoading({ isLoading, targetView }: RouteLoadingProps) {
    if (!isLoading) return null;

    const getIcon = () => {
        switch (targetView) {
            case "home":
                return <Home className="h-6 w-6" />;
            case "search":
                return <Search className="h-6 w-6" />;
            case "favorites":
                return <Heart className="h-6 w-6" />;
            default:
                return <Search className="h-6 w-6" />;
        }
    };

    const getMessage = () => {
        switch (targetView) {
            case "home":
                return "Loading Home...";
            case "search":
                return "Loading Search...";
            case "favorites":
                return "Loading Favorites...";
            default:
                return "Loading...";
        }
    };

    return (
        <div className="route-loading">
            <div className="route-loading-content">
                <div className="route-loading-spinner"></div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                    {getIcon()}
                    <h3 className="text-lg font-semibold">{getMessage()}</h3>
                </div>
                <p className="text-sm text-gray-300">Please wait while we prepare your content</p>
            </div>
        </div>
    );
}