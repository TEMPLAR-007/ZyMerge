import { Heart, Search, Home, Rocket } from "lucide-react";

interface RouteLoadingProps {
    isLoading: boolean;
    targetView?: "home" | "search" | "favorites" | "nasa";
    isUpdatesLoading?: boolean;
}

export function RouteLoading({ isLoading, targetView, isUpdatesLoading }: RouteLoadingProps) {
    if (!isLoading && !isUpdatesLoading) return null;

    const getIcon = () => {
        if (isUpdatesLoading) {
            return <Rocket className="h-6 w-6" />;
        }

        switch (targetView) {
            case "home":
                return <Home className="h-6 w-6" />;
            case "search":
                return <Search className="h-6 w-6" />;
            case "favorites":
                return <Heart className="h-6 w-6" />;
            case "nasa":
                return <Rocket className="h-6 w-6" />;
            default:
                return <Search className="h-6 w-6" />;
        }
    };

    const getMessage = () => {
        if (isUpdatesLoading) {
            return "Preparing Updates...";
        }

        switch (targetView) {
            case "home":
                return "Loading Home...";
            case "search":
                return "Loading Search...";
            case "favorites":
                return "Loading Favorites...";
            case "nasa":
                return "Loading Explore...";
            default:
                return "Loading...";
        }
    };

    const getDescription = () => {
        if (isUpdatesLoading) {
            return "Loading the latest features and improvements for you";
        }
        return "Please wait while we prepare your content";
    };

    return (
        <div className="route-loading">
            <div className="route-loading-content">
                <div className="route-loading-spinner"></div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                    {getIcon()}
                    <h3 className="text-lg font-semibold">{getMessage()}</h3>
                </div>
                <p className="text-sm text-gray-300">{getDescription()}</p>
            </div>
        </div>
    );
}