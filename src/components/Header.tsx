import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { CustomLogo } from "./Logo";
import { Search, Heart, LogOut, Home, LogIn, Rocket, Bell, User, Crown, Zap, ChevronDown, Star } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { UpdatesModal } from "./UpdatesModal";
import { ContactModal } from "./ContactModal";

interface HeaderProps {
  currentView: "home" | "search" | "favorites" | "nasa";
  setCurrentView: (view: "home" | "search" | "favorites" | "nasa") => void;
  onSignInClick?: () => void;
}

export function Header({ currentView, setCurrentView, onSignInClick }: HeaderProps) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [isUpdatesModalOpen, setIsUpdatesModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'pro'>('premium');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user subscription data
  const userSubscription = useQuery(api.myFunctions.getUserSubscription, isAuthenticated ? {} : "skip");

  // Get current user data
  const currentUser = useQuery(api.myFunctions.getCurrentUser, isAuthenticated ? {} : "skip");

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'premium': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'pro': return <Zap className="h-4 w-4 text-purple-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'premium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'pro': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'premium': return 'Premium';
      case 'pro': return 'Pro';
      default: return 'Free';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setCurrentView("home")}
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <CustomLogo size="sm" className="sm:hidden" showText={false} />
            <CustomLogo size="md" className="hidden sm:flex" />
            <span className="hidden xs:inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/30">
              Beta
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Core Navigation - Main Features */}
          <Button
            variant={currentView === "home" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("home")}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>

          <Button
            variant={currentView === "search" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("search")}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>

          <Button
            variant={currentView === "nasa" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("nasa")}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 relative overflow-hidden group transition-all duration-300 ${currentView === "nasa"
              ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg explore-button-active"
              : "explore-button-inactive hover:text-blue-400"
              }`}
          >
            {/* Animated cosmic background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Floating particles effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-blue-400 rounded-full explore-sparkle" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-2 right-3 w-0.5 h-0.5 bg-purple-400 rounded-full explore-sparkle" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute bottom-1 left-4 w-0.5 h-0.5 bg-blue-300 rounded-full explore-sparkle" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Rocket icon with enhanced animation */}
            <Rocket className={`rocket-icon h-4 w-4 relative z-10 transition-all duration-300 ${currentView === "nasa"
              ? "text-white drop-shadow-sm"
              : "group-hover:text-blue-400 group-hover:drop-shadow-[0_0_4px_rgba(59,130,246,0.5)]"
              }`} />

            {/* Text with enhanced gradient effect */}
            <span className={`hidden sm:inline relative z-10 font-medium transition-all duration-300 ${currentView === "nasa"
              ? "text-white drop-shadow-sm"
              : "group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent group-hover:drop-shadow-none"
              }`}>
              Explore
            </span>

            {/* Enhanced sparkle effects */}
            {currentView !== "nasa" && (
              <>
                <div className="absolute top-0 right-0 w-1 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute bottom-0 left-0 w-0.5 h-0.5 bg-blue-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300" style={{ animationDelay: '0.8s' }}></div>
              </>
            )}

            {/* Subtle border glow when active */}
            {currentView === "nasa" && (
              <div className="absolute inset-0 rounded-md border border-white/20 pointer-events-none"></div>
            )}
          </Button>

          {/* Divider for visual separation */}
          <div className="hidden md:block w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

          {/* Community & Updates */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://github.com/TEMPLAR-007/ZyMerge', '_blank')}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors"
            title="Star us on GitHub"
          >
            <Star className="h-4 w-4" />
            <span className="hidden lg:inline">Star</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsUpdatesModalOpen(true)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 relative group"
            title="View recent updates and improvements"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden lg:inline">Updates</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          </Button>

          {/* User Authentication - Always at the end */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {getTierIcon(userSubscription?.tier || 'free')}
                <span className="hidden md:inline">Profile</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      {getTierIcon(userSubscription?.tier || 'free')}
                      <div>
                        <h3 className="font-semibold text-sm">Your Plan</h3>
                        <p className="text-xs text-muted-foreground">Current subscription</p>
                      </div>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${getTierColor(userSubscription?.tier || 'free')}`}>
                      {getTierIcon(userSubscription?.tier || 'free')}
                      {getTierLabel(userSubscription?.tier || 'free')} Plan
                    </div>

                    {userSubscription?.tier === 'free' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        100 searches per hour
                      </p>
                    )}
                    {userSubscription?.tier === 'premium' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        500 searches per hour
                      </p>
                    )}
                    {userSubscription?.tier === 'pro' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        1000 searches per hour
                      </p>
                    )}

                    {/* User Email */}
                    {currentUser?.email && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
                          {currentUser.email}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="p-2">
                    {/* Favorites - User's personal content */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${currentView === "favorites" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setCurrentView("favorites");
                      }}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      My Favorites
                    </Button>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    {userSubscription?.tier === 'free' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            setSelectedPlan('premium');
                            setContactModalOpen(true);
                          }}
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade to Premium
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                          onClick={() => {
                            setIsProfileDropdownOpen(false);
                            setSelectedPlan('pro');
                            setContactModalOpen(true);
                          }}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade to Pro
                        </Button>
                      </>
                    )}

                    {userSubscription?.tier === 'premium' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setSelectedPlan('pro');
                          setContactModalOpen(true);
                        }}
                      >
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        // TODO: Add account settings
                        alert('Account settings coming soon!');
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Account Settings
                    </Button>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        void signOut();
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={onSignInClick}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Sign in</span>
            </Button>
          )}
        </div>
      </div>

      <UpdatesModal
        isOpen={isUpdatesModalOpen}
        onClose={() => setIsUpdatesModalOpen(false)}
        onNavigate={setCurrentView}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        planType={selectedPlan}
      />
    </header>
  );
}