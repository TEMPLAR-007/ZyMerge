import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Heart, Zap } from "lucide-react";

interface LandingPageProps {
    onNavigateToSearch?: () => void;
    onNavigateToFavorites?: () => void;
}

export function LandingPage({ onNavigateToSearch, onNavigateToFavorites }: LandingPageProps) {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl text-center">
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-2 mb-6">
                            <svg
                                className="h-12 w-12 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]"
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
                            <h1 className="text-5xl font-bold text-blue-400">Media Hub</h1>
                        </div>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Your ultimate destination for discovering and collecting stunning images from the web's best sources.
                            Search, save, and organize your favorite visuals in one beautiful platform.
                        </p>

                        {/* Image Sources */}
                        <div className="flex items-center justify-center space-x-4 mb-8">
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
                                onClick={onNavigateToFavorites}
                            >
                                <Heart className="mr-2 h-5 w-5" />
                                View Favorites
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 px-4 bg-gray-900/50">
                <div className="container mx-auto max-w-6xl">
                    <div>
                        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Media Hub?</h2>
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
            <footer className="bg-gray-900/50 border-t border-gray-700 py-8 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-8 mb-6">
                        <div>
                            <div className="flex items-center space-x-2 mb-3">
                                <svg
                                    className="h-6 w-6 text-blue-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M3 9C3 7.89543 3.89543 7 5 7H19C20.1046 7 21 7.89543 21 9V15C21 16.1046 20.1046 17 19 17H5C3.89543 17 3 16.1046 3 15V9Z"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    />
                                    <circle cx="8" cy="12" r="2" fill="currentColor" />
                                    <circle cx="16" cy="12" r="2" fill="currentColor" />
                                    <path d="M8 12H16" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                                <span className="text-lg font-bold text-blue-400">Media Hub</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                                Your ultimate destination for discovering and collecting stunning images.
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Developed with ❤️ by <span className="text-blue-400 font-medium">Arefin Khan</span>
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-3 text-sm">Features</h4>
                                <ul className="space-y-1 text-xs text-muted-foreground">
                                    <li>Multi-source search</li>
                                    <li>Smart favorites</li>
                                    <li>High-quality images</li>
                                    <li>Fast performance</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-3 text-sm">Sources</h4>
                                <ul className="space-y-1 text-xs text-muted-foreground">
                                    <li>Unsplash</li>
                                    <li>Pexels</li>
                                    <li>Pixabay</li>
                                    <li>More coming soon</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3 text-sm">Connect</h4>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                                <li>Help Center</li>
                                <li>Contact Us</li>
                                <li>Privacy Policy</li>
                                <li>Terms of Service</li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4 text-center">
                        <p className="text-xs text-muted-foreground">
                            &copy; {new Date().getFullYear()} Media Hub. All rights reserved. | Built with React, Convex & Shadcn UI
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}