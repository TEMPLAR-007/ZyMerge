import React, { useState } from 'react';
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { NASAApiService, APODData, NASAImageItem } from '../services/nasaApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Rocket,
  Star,
  ArrowLeft,
  Calendar,
  Shuffle,
  Brain,
  Loader2,
  ExternalLink,
  Search,
  X,
  Globe,
  Telescope,
  Heart
} from 'lucide-react';

interface CosmicQuizData {
  question: string;
  options: string[];
  correct: number;
  image: NASAImageItem;
}

export const NASAExplorer: React.FC = () => {
  const { isAuthenticated } = useConvexAuth();
  const favorites = useQuery(api.myFunctions.listFavorites) || [];
  const addFavorite = useMutation(api.myFunctions.addFavorite);
  const removeFavorite = useMutation(api.myFunctions.removeFavorite);

  const [currentView, setCurrentView] = useState<'main' | 'apod' | 'quiz' | 'search' | 'gallery' | 'missions' | 'categories'>('main');
  const [apodData, setApodData] = useState<APODData | null>(null);
  const [quizData, setQuizData] = useState<CosmicQuizData | null>(null);
  const [searchResults, setSearchResults] = useState<NASAImageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [galleryImages, setGalleryImages] = useState<NASAImageItem[]>([]);
  const [missionData, setMissionData] = useState<NASAImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<NASAImageItem | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [favoritingImages, setFavoritingImages] = useState<Set<string>>(new Set());
  const [quizScore, setQuizScore] = useState(0);

  // Helper function to check if an image is favorited
  const isImageFavorited = (image: NASAImageItem) => {
    return favorites.some(fav => fav.provider === 'nasa' && fav.imageId === image.id);
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (image: NASAImageItem) => {
    if (!isAuthenticated) return;

    const imageId = image.id;
    setFavoritingImages(prev => new Set(prev).add(imageId));

    try {
      if (isImageFavorited(image)) {
        await removeFavorite({ provider: 'nasa', imageId });
      } else {
        await addFavorite({
          provider: 'nasa',
          imageId,
          url: image.url,
          thumb: image.thumb,
          alt: image.title,
          link: `https://images.nasa.gov/details-${imageId}`,
          credit: image.center,
          creditUrl: 'https://www.nasa.gov/'
        });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setFavoritingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  };

  const loadAPOD = async () => {
    setLoading(true);
    try {
      const data = await NASAApiService.getAPOD();
      setApodData(data);
    } catch (error) {
      console.error('Failed to load APOD:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCosmicQuiz = async () => {
    setLoading(true);
    try {
      const data = await NASAApiService.getCosmicQuizData();
      setQuizData(data);
      setSelectedAnswer(null);
      setShowQuizResult(false);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const results = await NASAApiService.searchImages(query, 24);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search NASA images:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGallery = async () => {
    setLoading(true);
    try {
      const images = await NASAApiService.getRandomSpaceImages(24);
      setGalleryImages(images);
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMissions = async () => {
    setLoading(true);
    try {
      const images = await NASAApiService.getMissionImages();
      setMissionData(images);
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowQuizResult(true);

    if (quizData && answerIndex === quizData.correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const renderMainView = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Rocket className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          NASA Explorer
        </h1>
        <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
          Explore the universe through NASA's incredible image archives. Discover daily astronomy pictures,
          search through thousands of space images, learn about missions, and test your cosmic knowledge.
        </p>
      </div>

      {/* Quick Search */}
      <Card className="border-blue-500/30 bg-blue-500/10">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <Search className="h-5 w-5" />
            Quick NASA Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Search NASA images... (e.g., mars, galaxy, astronaut)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCurrentView('search');
                  handleSearch(searchQuery);
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={() => {
                setCurrentView('search');
                handleSearch(searchQuery);
              }}
              disabled={!searchQuery.trim() || loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exploration Options */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily APOD */}
        <Card className="border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-all duration-300 group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="h-6 w-6 text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-orange-400">Daily Cosmos</CardTitle>
                <p className="text-sm text-muted-foreground">Today's featured cosmic image</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setCurrentView('apod');
                loadAPOD();
              }}
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              <Star className="h-4 w-4 mr-2" />
              View Today's Universe
            </Button>
          </CardContent>
        </Card>

        {/* Space Gallery */}
        <Card className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-all duration-300 group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <CardTitle className="text-green-400">Space Gallery</CardTitle>
                <p className="text-sm text-muted-foreground">Curated space imagery</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setCurrentView('gallery');
                loadGallery();
              }}
              className="w-full bg-green-500 hover:bg-green-600"
              disabled={loading}
            >
              <Globe className="h-4 w-4 mr-2" />
              Explore Gallery
            </Button>
          </CardContent>
        </Card>

        {/* Space Missions */}
        <Card className="border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all duration-300 group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Rocket className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-cyan-400">Historic Missions</CardTitle>
                <p className="text-sm text-muted-foreground">NASA's greatest achievements</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setCurrentView('missions');
                loadMissions();
              }}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
              disabled={loading}
            >
              <Rocket className="h-4 w-4 mr-2" />
              Explore Missions
            </Button>
          </CardContent>
        </Card>

        {/* Space Categories */}
        <Card className="border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 transition-all duration-300 group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Telescope className="h-6 w-6 text-pink-400" />
              </div>
              <div>
                <CardTitle className="text-pink-400">Space Categories</CardTitle>
                <p className="text-sm text-muted-foreground">Browse by cosmic phenomena</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setCurrentView('categories')}
              className="w-full bg-pink-500 hover:bg-pink-600"
            >
              <Telescope className="h-4 w-4 mr-2" />
              Browse Categories
            </Button>
          </CardContent>
        </Card>

        {/* Cosmic Quiz */}
        <Card className="border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300 group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-purple-400">Cosmic Quiz</CardTitle>
                <p className="text-sm text-muted-foreground">Test your space knowledge</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Score:</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {quizScore} correct
              </Badge>
            </div>
            <Button
              onClick={() => {
                setCurrentView('quiz');
                loadCosmicQuiz();
              }}
              className="w-full bg-purple-500 hover:bg-purple-600"
              disabled={loading}
            >
              <Brain className="h-4 w-4 mr-2" />
              Start Quiz
            </Button>
          </CardContent>
        </Card>

        {/* Random Discovery */}
        <Card className="border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20 transition-all duration-300 group">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shuffle className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-yellow-400">Cosmic Surprise</CardTitle>
                <p className="text-sm text-muted-foreground">Random space discoveries</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                const cosmicTerms = ['nebula', 'galaxy', 'supernova', 'mars', 'jupiter', 'saturn', 'astronaut', 'earth'];
                const randomTerm = cosmicTerms[Math.floor(Math.random() * cosmicTerms.length)];
                setSearchQuery(randomTerm);
                setCurrentView('search');
                handleSearch(randomTerm);
              }}
              className="w-full bg-yellow-500 hover:bg-yellow-600"
              disabled={loading}
            >
              <Shuffle className="h-4 w-4 mr-2" />
              Surprise Me!
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {currentView === 'main' && renderMainView()}

        {/* APOD View */}
        {currentView === 'apod' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setCurrentView('main')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explorer
              </Button>
              <h2 className="text-2xl font-bold text-orange-400">Astronomy Picture of the Day</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
              </div>
            ) : apodData ? (
              <Card className="border-orange-500/30 bg-orange-500/10">
                <CardHeader>
                  <CardTitle className="text-orange-400">{apodData.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(apodData.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apodData.media_type === 'image' && (
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={apodData.url}
                        alt={apodData.title}
                        className="w-full h-auto max-h-96 object-cover"
                      />
                      {apodData.hdurl && (
                        <Button
                          onClick={() => window.open(apodData.hdurl, '_blank')}
                          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70"
                          size="sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          HD Version
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {apodData.explanation}
                    </p>
                  </div>

                  {apodData.copyright && (
                    <p className="text-xs text-muted-foreground">
                      © {apodData.copyright}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No APOD data available</p>
              </div>
            )}
          </div>
        )}

        {/* Search View */}
        {currentView === 'search' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setCurrentView('main')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explorer
              </Button>
              <div className="flex-1">
                <div className="flex gap-3">
                  <Input
                    placeholder="Search NASA images..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(searchQuery);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSearch(searchQuery)}
                    disabled={!searchQuery.trim() || loading}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {searchQuery && (
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-muted-foreground">
                  {searchResults.length} images found
                </p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((image, index) => (
                  <Card key={index} className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-300 group">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => {
                            setSelectedImage(image);
                            setShowImageModal(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                        {/* Favorite Button */}
                        {isAuthenticated && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(image);
                            }}
                            disabled={favoritingImages.has(image.id)}
                            size="sm"
                            className={`absolute top-3 right-3 w-8 h-8 p-0 rounded-full ${isImageFavorited(image)
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-black/50 hover:bg-black/70 text-white'
                              }`}
                          >
                            {favoritingImages.has(image.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Heart className={`h-4 w-4 ${isImageFavorited(image) ? 'fill-current' : ''}`} />
                            )}
                          </Button>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{image.title}</h3>
                          <p className="text-gray-300 text-xs">{image.center}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {searchResults.length === 0 && !loading && searchQuery && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  Try searching for terms like "mars", "galaxy", "astronaut", or "nebula"
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['mars', 'galaxy', 'astronaut', 'nebula', 'earth', 'moon'].map((term) => (
                    <Button
                      key={term}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery(term);
                        handleSearch(term);
                      }}
                    >
                      {term}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gallery View */}
        {currentView === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setCurrentView('main')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explorer
              </Button>
              <h2 className="text-2xl font-bold text-green-400">Space Gallery</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-green-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {galleryImages.map((image, index) => (
                  <Card key={index} className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-all duration-300 group">
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={() => {
                            setSelectedImage(image);
                            setShowImageModal(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                        {/* Favorite Button */}
                        {isAuthenticated && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(image);
                            }}
                            disabled={favoritingImages.has(image.id)}
                            size="sm"
                            className={`absolute top-3 right-3 w-8 h-8 p-0 rounded-full ${isImageFavorited(image)
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-black/50 hover:bg-black/70 text-white'
                              }`}
                          >
                            {favoritingImages.has(image.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Heart className={`h-4 w-4 ${isImageFavorited(image) ? 'fill-current' : ''}`} />
                            )}
                          </Button>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                          <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{image.title}</h3>
                          <p className="text-gray-300 text-xs">{image.center}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Missions View */}
        {currentView === 'missions' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setCurrentView('main')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explorer
              </Button>
              <h2 className="text-2xl font-bold text-cyan-400">Historic Space Missions</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Mission Categories */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['apollo', 'mars rover', 'hubble', 'voyager'].map((mission) => (
                    <Button
                      key={mission}
                      onClick={() => {
                        setSearchQuery(mission);
                        setCurrentView('search');
                        handleSearch(mission);
                      }}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 border-cyan-500/30 hover:bg-cyan-500/20"
                    >
                      <Rocket className="h-6 w-6 text-cyan-400" />
                      <span className="text-sm font-medium capitalize">{mission}</span>
                    </Button>
                  ))}
                </div>

                {/* Mission Images Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {missionData.map((image, index) => (
                    <Card key={index} className="border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all duration-300 group">
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                            onClick={() => {
                              setSelectedImage(image);
                              setShowImageModal(true);
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                          {/* Favorite Button */}
                          {isAuthenticated && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(image);
                              }}
                              disabled={favoritingImages.has(image.id)}
                              size="sm"
                              className={`absolute top-3 right-3 w-8 h-8 p-0 rounded-full ${isImageFavorited(image)
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-black/50 hover:bg-black/70 text-white'
                                }`}
                            >
                              {favoritingImages.has(image.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Heart className={`h-4 w-4 ${isImageFavorited(image) ? 'fill-current' : ''}`} />
                              )}
                            </Button>
                          )}

                          <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                            <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1">{image.title}</h3>
                            <p className="text-gray-300 text-xs">{image.center}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Categories View */}
        {currentView === 'categories' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setCurrentView('main')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explorer
              </Button>
              <h2 className="text-2xl font-bold text-pink-400">Space Categories</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { name: 'Galaxies', icon: '🌌', query: 'galaxy' },
                { name: 'Nebulae', icon: '☁️', query: 'nebula' },
                { name: 'Planets', icon: '🪐', query: 'planet' },
                { name: 'Stars', icon: '⭐', query: 'star' },
                { name: 'Black Holes', icon: '🕳️', query: 'black hole' },
                { name: 'Astronauts', icon: '👨‍🚀', query: 'astronaut' },
                { name: 'Spacecraft', icon: '🚀', query: 'spacecraft' },
                { name: 'Earth', icon: '🌍', query: 'earth' },
                { name: 'Moon', icon: '🌙', query: 'moon' },
                { name: 'Mars', icon: '🔴', query: 'mars' },
                { name: 'Jupiter', icon: '🟠', query: 'jupiter' },
                { name: 'Saturn', icon: '🪐', query: 'saturn' }
              ].map((category) => (
                <Card key={category.name}
                  className="border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    setSearchQuery(category.query);
                    setCurrentView('search');
                    handleSearch(category.query);
                  }}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </div>
                    <h3 className="text-pink-400 font-semibold">{category.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quiz View */}
        {currentView === 'quiz' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setCurrentView('main')}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Explorer
              </Button>
              <h2 className="text-2xl font-bold text-purple-400">Cosmic Quiz</h2>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                Score: {quizScore}
              </Badge>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
              </div>
            ) : quizData ? (
              <Card className="border-purple-500/30 bg-purple-500/10 max-w-4xl mx-auto">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {/* Quiz Image */}
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={quizData.image.url}
                        alt="Quiz Image"
                        className="w-full h-64 object-cover"
                      />
                    </div>

                    {/* Question */}
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-4">
                        {quizData.question}
                      </h3>
                    </div>

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {quizData.options.map((option, index) => (
                        <Button
                          key={index}
                          onClick={() => handleQuizAnswer(index)}
                          disabled={showQuizResult}
                          variant="outline"
                          className={`h-auto p-4 text-left justify-start ${showQuizResult
                            ? index === quizData.correct
                              ? 'border-green-500 bg-green-500/20 text-green-400'
                              : selectedAnswer === index
                                ? 'border-red-500 bg-red-500/20 text-red-400'
                                : 'opacity-50'
                            : 'border-purple-500/30 hover:bg-purple-500/20'
                            }`}
                        >
                          <span className="font-medium mr-3">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {option}
                        </Button>
                      ))}
                    </div>

                    {/* Quiz Result */}
                    {showQuizResult && (
                      <div className="text-center space-y-4">
                        <div className={`text-lg font-semibold ${selectedAnswer === quizData.correct ? 'text-green-400' : 'text-red-400'
                          }`}>
                          {selectedAnswer === quizData.correct ? '🎉 Correct!' : '❌ Incorrect'}
                        </div>
                        <p className="text-muted-foreground">
                          The correct answer is: <span className="text-green-400 font-semibold">
                            {quizData.options[quizData.correct]}
                          </span>
                        </p>
                        <Button
                          onClick={() => {
                            setCurrentView('quiz');
                            loadCosmicQuiz();
                          }}
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          <Shuffle className="h-4 w-4 mr-2" />
                          Next Question
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground mb-4">No quiz data available</p>
                <Button
                  onClick={() => loadCosmicQuiz()}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{selectedImage.title}</h3>
                  <div className="flex items-center gap-2">
                    {/* Favorite Button in Modal */}
                    {isAuthenticated && (
                      <Button
                        onClick={() => handleToggleFavorite(selectedImage)}
                        disabled={favoritingImages.has(selectedImage.id)}
                        size="sm"
                        className={`${isImageFavorited(selectedImage)
                          ? 'bg-red-500 hover:bg-red-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                      >
                        {favoritingImages.has(selectedImage.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Heart className={`h-4 w-4 mr-2 ${isImageFavorited(selectedImage) ? 'fill-current' : ''}`} />
                        )}
                        {isImageFavorited(selectedImage) ? 'Favorited' : 'Add to Favorites'}
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowImageModal(false)}
                      variant="ghost"
                      size="sm"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-96 object-contain rounded-lg"
                />
                {selectedImage.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedImage.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{selectedImage.center}</span>
                  {selectedImage.date && (
                    <span>{new Date(selectedImage.date).toLocaleDateString()}</span>
                  )}
                </div>
                {selectedImage.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedImage.keywords.slice(0, 8).map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};