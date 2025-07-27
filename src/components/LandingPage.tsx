import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo, CustomLogo } from "./Logo";
import { Search, Heart, Zap } from "lucide-react";
import { useConvexAuth } from "convex/react";

interface LandingPageProps {
    onNavigateToSearch?: () => void;
    onNavigateToFavorites?: () => void;
    onSignInRequired?: () => void;
}

export function LandingPage({ onNavigateToSearch, onNavigateToFavorites, onSignInRequired }: LandingPageProps) {
    const { isAuthenticated } = useConvexAuth();

    const handleFavoritesClick = () => {
        if (isAuthenticated) {
            onNavigateToFavorites?.();
        } else {
            onSignInRequired?.();
        }
    };
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl text-center">
                    <div className="mb-8">
                        <div className="flex items-center justify-center mb-6">
                            <Logo size="xl" />
                        </div>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
                            Where creators connect and content flows
                        </p>

                        {/* Image Sources */}
                        <div className="flex flex-col items-center justify-center mb-8">
                            <div className="flex items-center justify-center space-x-4 mb-3">
                                <Badge variant="secondary" className="px-4 py-2 text-sm hover:scale-105 transition-transform duration-200">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Unsplash
                                </Badge>
                                <Badge variant="secondary" className="px-4 py-2 text-sm hover:scale-105 transition-transform duration-200">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                    Pexels
                                </Badge>
                                <Badge variant="secondary" className="px-4 py-2 text-sm hover:scale-105 transition-transform duration-200">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                    Pixabay
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                • More sources coming soon
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="text-lg px-8 py-3 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                                onClick={onNavigateToSearch}
                            >
                                <Search className="mr-2 h-5 w-5" />
                                Start Searching
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="text-lg px-8 py-3 hover:scale-105 transition-all duration-200 hover:shadow-lg"
                                onClick={handleFavoritesClick}
                            >
                                <Heart className="mr-2 h-5 w-5" />
                                {isAuthenticated ? "View Favorites" : "Sign in to View Favorites"}
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-gray-900/50">
                <div className="container mx-auto max-w-6xl">
                    <div>
                        <h2 className="text-3xl font-bold text-center mb-12">Why Choose ZyMrge?</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-200">
                                        <Search className="h-6 w-6 text-blue-400" />
                                    </div>
                                    <CardTitle>Multi-Source Search</CardTitle>
                                    <CardDescription>
                                        Search across multiple premium image platforms simultaneously. Get the best results from Unsplash, Pexels, and Pixabay in one place.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-200">
                                        <Heart className="h-6 w-6 text-green-400" />
                                    </div>
                                    <CardTitle>Smart Favorites</CardTitle>
                                    <CardDescription>
                                        Save your favorite images with one click. Organize and access your collection anytime, anywhere with our secure cloud storage.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                                <CardHeader>
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-200">
                                        <Zap className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <CardTitle>Lightning Fast</CardTitle>
                                    <CardDescription>
                                        Experience blazing-fast search results with our optimized search engine. Find the perfect image in seconds, not minutes.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div>
                        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
                                    <span className="text-2xl font-bold text-blue-400">1</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Search</h3>
                                <p className="text-muted-foreground">
                                    Enter your search terms and browse through thousands of high-quality images from multiple sources.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
                                    <span className="text-2xl font-bold text-green-400">2</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Save</h3>
                                <p className="text-muted-foreground">
                                    Click the heart icon to save your favorite images to your personal collection.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform duration-200">
                                    <span className="text-2xl font-bold text-purple-400">3</span>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Access</h3>
                                <p className="text-muted-foreground">
                                    View and manage your saved images anytime from your favorites section.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900/50 border-t border-gray-700 py-6 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
                            <CustomLogo size="sm" />
                            <span className="text-sm text-muted-foreground max-w-xs sm:max-w-none">
                                Where creators connect and content flows
                            </span>
                        </div>

                        <div className="text-center sm:text-right">
                            <p className="text-xs text-muted-foreground">
                                &copy; {new Date().getFullYear()} ZyMrge. Built with ❤️ by <span className="text-blue-400 font-medium">Arefin Khan</span>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}