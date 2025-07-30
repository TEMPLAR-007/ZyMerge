import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo, CustomLogo } from "./Logo";
import { Search, Heart, Zap, Star, Crown, Mail, CheckCircle } from "lucide-react";
import { useConvexAuth, useQuery } from "convex/react";
import { ContactModal } from "./ContactModal";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { useToast } from "./Toast";

interface LandingPageProps {
    onNavigateToSearch?: () => void;
    onNavigateToFavorites?: () => void;
    onSignInRequired?: () => void;
}

export function LandingPage({ onNavigateToSearch, onNavigateToFavorites, onSignInRequired }: LandingPageProps) {
    const { isAuthenticated } = useConvexAuth();
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'premium' | 'pro'>('premium');
    const { ToastContainer } = useToast();

    // Get user subscription data
    const userSubscription = useQuery(api.myFunctions.getUserSubscription, isAuthenticated ? {} : "skip");
    const userTier = isAuthenticated ? (userSubscription?.tier || "free") : null;

    const handleFavoritesClick = () => {
        if (isAuthenticated) {
            onNavigateToFavorites?.();
        } else {
            onSignInRequired?.();
        }
    };

    const handleUpgradeClick = (plan: 'premium' | 'pro') => {
        if (!isAuthenticated) {
            onSignInRequired?.();
            return;
        }
        setSelectedPlan(plan);
        setContactModalOpen(true);
    };

    // Smart plan logic
    const isCurrentPlan = (planType: string) => {
        if (!isAuthenticated) return false; // Non-authenticated users don't have a current plan
        return userTier === planType;
    };

    const canUpgradeTo = (planType: string) => {
        if (!isAuthenticated) return true; // Show all options for non-authenticated users
        if (planType === "free") return false; // Can't "upgrade" to free
        if (planType === "premium") return userTier === "free";
        if (planType === "pro") return userTier !== "pro";
        return false;
    };

    const getButtonText = (planType: string) => {
        if (!isAuthenticated) {
            if (planType === "free") return "Start Free";
            return "Contact for Upgrade";
        }

        if (isCurrentPlan(planType)) return "Current Plan";
        if (planType === "free") return "Start Free";
        if (planType === "premium" && userTier === "free") return "Contact for Upgrade";
        if (planType === "pro" && userTier === "free") return "Contact for Upgrade";
        if (planType === "pro" && userTier === "premium") return "Upgrade to Pro";
        return "Contact for Upgrade";
    };

    const getButtonVariant = (planType: string) => {
        if (isCurrentPlan(planType)) return "default";
        if (planType === "free") return "outline";
        return "default";
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
                                <Badge variant="secondary" className="px-4 py-2 text-sm hover:scale-105 transition-transform duration-200">
                                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                                    + Explore
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
                        <h2 className="text-3xl font-bold text-center mb-12">Why Choose ZyMerge?</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <Card className="border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#171717' }}>
                                <CardHeader>
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-200">
                                        <Zap className="h-6 w-6 text-purple-400" />
                                    </div>
                                    <CardTitle>Multi-Source Search</CardTitle>
                                    <CardDescription>
                                        Search across multiple high-quality image platforms simultaneously. Get the best results from Unsplash, Pexels, Pixabay, and NASA in one place.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#171717' }}>
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

                            <Card className="border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#171717' }}>
                                <CardHeader>
                                    <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-200">
                                        <Zap className="h-6 w-6 text-orange-400" />
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

            {/* Premium Features Section */}
            <section className="py-16 px-4 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20 border-y border-purple-500/20">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <div className="relative inline-block mb-6">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl"></div>
                            <div className="relative w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                                <Star className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                            Choose Your Plan
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                            Start free and upgrade when you need more power. All plans include our core features with generous search limits.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {/* Free Tier */}
                        <Card className={`border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 ${isCurrentPlan("free") ? "ring-2 ring-green-500/50" : ""}`} style={{ backgroundColor: '#171717' }}>
                            <CardHeader className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                        <Heart className="h-6 w-6 text-green-400" />
                                    </div>
                                    {isCurrentPlan("free") && (
                                        <Badge variant="default" className="bg-green-500 text-white">
                                            Current Plan
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-green-400">Free</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Perfect for getting started
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-3xl font-bold text-white mb-4">$0<span className="text-lg text-muted-foreground">/month</span></div>
                                <ul className="space-y-3 text-sm text-left mb-6">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                        <span>100 searches per hour</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                        <span>Multi-source search</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                        <span>Save favorites</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                        <span>NASA space explorer</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                        <span>Community support</span>
                                    </li>
                                </ul>
                                <Button
                                    variant={getButtonVariant("free")}
                                    className={`w-full ${isCurrentPlan("free") ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                                    onClick={isCurrentPlan("free") ? undefined : onNavigateToSearch}
                                    disabled={isCurrentPlan("free")}
                                >
                                    {getButtonText("free")}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Premium Tier */}
                        <Card className={`border-yellow-500/50 hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden ${isCurrentPlan("premium") ? "ring-2 ring-yellow-500/50" : ""}`} style={{ backgroundColor: '#171717' }}>
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-yellow-500 to-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                                {isCurrentPlan("premium") ? "Your Plan" : "Most Popular"}
                            </div>
                            <CardHeader className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                        <Crown className="h-6 w-6 text-yellow-400" />
                                    </div>
                                    {isCurrentPlan("premium") && (
                                        <Badge variant="default" className="bg-yellow-500 text-white">
                                            Current Plan
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-yellow-400">Premium</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    For creators and professionals
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-3xl font-bold text-white mb-4">$9.99<span className="text-lg text-muted-foreground">/month</span></div>
                                <ul className="space-y-3 text-sm text-left mb-6">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                        <span><strong>500 searches per hour</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                        <span>Everything in Free</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                        <span>Advanced search filters</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                        <span>Priority support</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
                                        <span>Early access to features</span>
                                    </li>
                                </ul>
                                <Button
                                    className={`w-full font-medium ${isCurrentPlan("premium")
                                        ? "bg-yellow-500 hover:bg-yellow-600 text-white cursor-default"
                                        : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
                                        }`}
                                    onClick={canUpgradeTo("premium") ? () => handleUpgradeClick('premium') : undefined}
                                    disabled={!canUpgradeTo("premium")}
                                >
                                    {!isCurrentPlan("premium") && canUpgradeTo("premium") && <Mail className="h-4 w-4 mr-2" />}
                                    {getButtonText("premium")}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Pro Tier */}
                        <Card className={`border-purple-500/50 hover:shadow-lg hover:scale-105 transition-all duration-300 relative overflow-hidden ${isCurrentPlan("pro") ? "ring-2 ring-purple-500/50" : ""}`} style={{ backgroundColor: '#171717' }}>
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                                {isCurrentPlan("pro") ? "Your Plan" : "Power Users"}
                            </div>
                            <CardHeader className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-4">
                                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                        <Zap className="h-6 w-6 text-purple-400" />
                                    </div>
                                    {isCurrentPlan("pro") && (
                                        <Badge variant="default" className="bg-purple-500 text-white">
                                            Current Plan
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-purple-400">Pro</CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    For teams and heavy users
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-3xl font-bold text-white mb-4">$19.99<span className="text-lg text-muted-foreground">/month</span></div>
                                <ul className="space-y-3 text-sm text-left mb-6">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
                                        <span><strong>1000 searches per hour</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
                                        <span>Everything in Premium</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
                                        <span>API access (coming soon)</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
                                        <span>Bulk download tools</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-purple-400 flex-shrink-0" />
                                        <span>Dedicated support</span>
                                    </li>
                                </ul>
                                <Button
                                    className={`w-full font-medium ${isCurrentPlan("pro")
                                        ? "bg-purple-500 hover:bg-purple-600 text-white cursor-default"
                                        : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                                        }`}
                                    onClick={canUpgradeTo("pro") ? () => handleUpgradeClick('pro') : undefined}
                                    disabled={!canUpgradeTo("pro")}
                                >
                                    {!isCurrentPlan("pro") && canUpgradeTo("pro") && <Mail className="h-4 w-4 mr-2" />}
                                    {getButtonText("pro")}
                                </Button>
                                {isCurrentPlan("pro") && (
                                    <p className="text-xs text-purple-300 mt-2">
                                        🎉 Thank you for being a Pro user!
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-center mt-8 space-y-4">
                        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 max-w-2xl mx-auto">
                            <h3 className="text-lg font-semibold text-blue-300 mb-2">🚀 Beta Launch Special</h3>
                            <p className="text-sm text-blue-200/80">
                                During our beta phase, upgrades are handled manually. Contact us and we'll upgrade your account within 24 hours!
                            </p>
                        </div>
                        <p className="text-sm text-purple-300/80">
                            ✨ All plans include rolling window rate limits • 🔄 No long-term contracts • 💬 Personal support
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16 px-4 bg-gray-900/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Get started in seconds with our simple three-step process
                        </p>

                        <div className="grid md:grid-cols-3 gap-8">
                            <Card className="border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center" style={{ backgroundColor: '#171717' }}>
                                <CardHeader>
                                    <div className="relative mx-auto mb-4">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-200">
                                            <Search className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                            1
                                        </div>
                                    </div>
                                    <CardTitle>Search</CardTitle>
                                    <CardDescription>
                                        Browse millions of high-quality images from Unsplash, Pexels, Pixabay, and NASA
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center" style={{ backgroundColor: '#171717' }}>
                                <CardHeader>
                                    <div className="relative mx-auto mb-4">
                                        <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-200">
                                            <Heart className="h-6 w-6 text-green-400" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                            2
                                        </div>
                                    </div>
                                    <CardTitle>Save</CardTitle>
                                    <CardDescription>
                                        Click the heart icon to instantly save your favorite images to your personal collection
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300 text-center" style={{ backgroundColor: '#171717' }}>
                                <CardHeader>
                                    <div className="relative mx-auto mb-4">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto hover:scale-110 transition-transform duration-200">
                                            <Zap className="h-6 w-6 text-purple-400" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                                            3
                                        </div>
                                    </div>
                                    <CardTitle>Access</CardTitle>
                                    <CardDescription>
                                        View, organize, and manage your saved images anytime from any device
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-black/90 border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-4 py-12">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        {/* Brand */}
                        <div className="col-span-2 md:col-span-1">
                            <div className="mb-4">
                                <CustomLogo size="sm" />
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                Multi-source image search platform for creators worldwide
                            </p>
                        </div>

                        {/* Navigation */}
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">Navigation</h4>
                            <div className="space-y-3">
                                <button
                                    onClick={onNavigateToSearch}
                                    className="block text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Search
                                </button>
                                <button
                                    onClick={handleFavoritesClick}
                                    className="block text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Favorites
                                </button>
                                <div className="text-sm text-gray-500">
                                    Pricing
                                </div>
                            </div>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
                            <div className="space-y-3">
                                <a
                                    href="https://github.com/TEMPLAR-007/ZyMerge"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    GitHub
                                </a>
                                <div className="text-sm text-gray-500">
                                    Documentation
                                </div>
                                <div className="text-sm text-gray-500">
                                    API
                                </div>
                            </div>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
                            <div className="space-y-3">
                                <a
                                    href="mailto:arefin.khan8364@gmail.com"
                                    className="block text-sm text-gray-400 hover:text-white transition-colors"
                                >
                                    Contact
                                </a>
                                <div className="text-sm text-gray-500">
                                    Help Center
                                </div>
                                <div className="text-sm text-gray-500">
                                    Status
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-800">
                        <div className="text-sm text-gray-500">
                            © {new Date().getFullYear()} Made by{' '}
                            <a
                                href="https://www.linkedin.com/in/arefin-khan-441259241/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                            >
                                Arefin Khan
                            </a>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Unsplash</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>Pexels</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                <span>Pixabay</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                <span>NASA</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Contact Modal */}
            <ContactModal
                isOpen={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                planType={selectedPlan}
            />

            {/* Toast Notifications */}
            <ToastContainer />
        </div>
    );
}