import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Search, Zap, Star, X, Rocket, CheckCircle } from "lucide-react";

interface UpdatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate?: (route: "home" | "search" | "favorites" | "nasa") => void;
}

export function UpdatesModal({ isOpen, onClose, onNavigate }: UpdatesModalProps) {
    if (!isOpen) return null;

    // Default navigation function if none provided
    const handleNavigation = onNavigate || (() => {
        // Silent fallback for missing navigation
    });

    const textUpdates = [
        {
            icon: CheckCircle,
            title: "Consistent Dark Theme",
            description: "Fixed all light theme issues across components. Website now stays dark regardless of browser theme settings with improved image editing interface."
        },
        {
            icon: Clock,
            title: "Enhanced Rate Limiting",
            description: "Improved search limits with rolling windows. Free users get 100 searches/hour, Premium users get 500/hour."
        },
        {
            icon: Search,
            title: "Route Persistence",
            description: "Your current page is now saved in the URL. Reload the page and stay exactly where you were!"
        },
        {
            icon: Zap,
            title: "Compact Search Bar",
            description: "A floating search bar appears when you scroll down, making it easy to search from anywhere on the page."
        },
        {
            icon: Star,
            title: "Premium Plans",
            description: "New tiered pricing with Free (100 searches/hour) and Premium (500 searches/hour) plans."
        },
        {
            icon: CheckCircle,
            title: "Professional Image Editor",
            description: "Advanced cropping tool with presets (1:1, 3:4, 16:9), custom sizing, and precise image downloads."
        },
        {
            icon: CheckCircle,
            title: "Multi-Source Search",
            description: "Search across Unsplash, Pexels, and Pixabay simultaneously with smart result caching."
        },
        {
            icon: CheckCircle,
            title: "Contact & Upgrade System",
            description: "Easy upgrade requests with email notifications and admin management tools."
        },
        {
            icon: CheckCircle,
            title: "Enhanced UI/UX",
            description: "Custom scrollbars, smooth animations, and improved responsive design throughout."
        }
    ];

    return (
        <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center p-4 bg-black/80">
            <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-3xl w-full max-h-[70vh] overflow-y-auto border border-gray-700/50 custom-scrollbar">
                <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm flex items-center justify-between p-6 border-b border-gray-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">What's New</h2>
                            <p className="text-sm text-gray-400">Latest updates and improvements</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Text-based updates list */}
                    <div className="space-y-4">
                        {textUpdates.map((update, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                                <div className="w-6 h-6 bg-gray-700/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle className="h-3 w-3 text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-white mb-1">{update.title}</h3>
                                    <p className="text-xs text-gray-400 leading-relaxed">{update.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Graphical card for Explore the Universe */}
                    <div
                        className="relative overflow-hidden cursor-pointer"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleNavigation("nasa");
                            onClose();
                        }}
                    >
                        <Card
                            className="relative border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 transition-all duration-500 bg-gray-800/30 border-gray-700/50 group"
                        >
                            {/* Animated background gradient */}
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Floating particles effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                <div className="absolute top-2 left-4 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
                                <div className="absolute top-4 right-6 w-0.5 h-0.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                <div className="absolute bottom-3 left-8 w-0.5 h-0.5 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                                <div className="absolute top-8 right-2 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
                                <div className="absolute bottom-6 right-4 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
                            </div>

                            {/* Cosmic background pattern */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-1000">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.3),transparent_50%)]"></div>
                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)]"></div>
                            </div>

                            <CardHeader className="pb-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-cyan-500/25 transition-all duration-300 group-hover:rotate-12">
                                            <Rocket className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        {/* Glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                                        {/* Orbital rings */}
                                        <div className="absolute inset-0 rounded-xl border border-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-150 group-hover:rotate-180"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CardTitle className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-purple-300 transition-all duration-300">
                                                Explore the Universe
                                            </CardTitle>
                                            <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-cyan-500/25">
                                                NEW
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-sm text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                                            Discover NASA's incredible image archives with daily astronomy pictures, space missions, and cosmic quizzes.
                                        </CardDescription>
                                    </div>
                                </div>

                                {/* Feature highlights with enhanced styling */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="inline-flex items-center gap-1 text-xs text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
                                        Daily Astronomy Pictures
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
                                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                                        Space Missions
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-full border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
                                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></span>
                                        Cosmic Quizzes
                                    </span>
                                </div>

                                {/* Interactive call-to-action */}
                                <div className="mt-4 pt-3 border-t border-cyan-500/20">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-cyan-400 font-medium">Ready to explore?</span>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                            Available now
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>

                    <div className="pt-4 border-t border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                    ✨ All updates are live
                                </Badge>
                                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                    🚀 More coming soon
                                </Badge>
                            </div>
                            <Button onClick={onClose} className="px-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                                Got it!
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}