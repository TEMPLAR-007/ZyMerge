import React, { useState, useEffect } from 'react';
import { useQuests } from '../../contexts/QuestContext';
import { NASAApiService, APODData, NASAImageItem } from '../../services/nasaApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Rocket,
  Star,
  ArrowLeft,
  Calendar,
  Shuffle,
  Brain,
  Loader2,
  ExternalLink,
  Clock,
  Award,
  X
} from 'lucide-react';

interface CosmicQuizData {
  question: string;
  options: string[];
  correct: number;
  image: NASAImageItem;
}

export const NASASpaceExplorer: React.FC = () => {
  const { activeQuest, updateQuestProgress, completeQuest } = useQuests();
  const [currentView, setCurrentView] = useState<'main' | 'apod' | 'quiz' | 'random' | 'gallery' | 'missions' | 'categories'>('main');
  const [apodData, setApodData] = useState<APODData | null>(null);
  const [quizData, setQuizData] = useState<CosmicQuizData | null>(null);
  const [randomImage, setRandomImage] = useState<NASAImageItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [questActivities, setQuestActivities] = useState({
    apodViewed: false,
    quizCompleted: false,
    randomExplored: false,
    galleryExplored: false,
    missionsExplored: false,
    categoriesExplored: false
  });

  // Additional state for new features
  const [galleryImages, setGalleryImages] = useState<NASAImageItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [missionData, setMissionData] = useState<NASAImageItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<NASAImageItem | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!activeQuest?.activatedAt) return '';
    const expiryTime = activeQuest.activatedAt + (activeQuest.duration * 24 * 60 * 60 * 1000);
    const timeLeft = expiryTime - Date.now();

    if (timeLeft <= 0) return 'Expired';

    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    return `${days}d ${hours}h remaining`;
  };

  // Update quest progress based on activities
  useEffect(() => {
    const activities = Object.values(questActivities);
    const completedCount = activities.filter(Boolean).length;
    const progress = (completedCount / activities.length) * 100;

    if (activeQuest) {
      updateQuestProgress(activeQuest.id, progress);

      if (progress === 100) {
        completeQuest(activeQuest.id);
      }
    }
  }, [questActivities, activeQuest, updateQuestProgress, completeQuest]);

  const loadAPOD = async () => {
    setLoading(true);
    try {
      const data = await NASAApiService.getAPOD();
      setApodData(data);
      setQuestActivities(prev => ({ ...prev, apodViewed: true }));
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

  const loadRandomImage = async () => {
    setLoading(true);
    try {
      const cosmicTerms = ['nebula', 'galaxy', 'supernova', 'mars', 'jupiter', 'saturn'];
      const randomTerm = cosmicTerms[Math.floor(Math.random() * cosmicTerms.length)];
      const images = await NASAApiService.searchImages(randomTerm, 1);

      if (images.length > 0) {
        setRandomImage(images[0]);
        setQuestActivities(prev => ({ ...prev, randomExplored: true }));
      }
    } catch (error) {
      console.error('Failed to load random image:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGallery = async (category: string = 'space') => {
    setLoading(true);
    try {
      const images = await NASAApiService.searchImages(category, 20);
      setGalleryImages(images);
      setQuestActivities(prev => ({ ...prev, galleryExplored: true }));
    } catch (error) {
      console.error('Failed to load gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMissions = async () => {
    setLoading(true);
    try {
      const missions = ['apollo', 'mars rover', 'hubble', 'voyager', 'cassini', 'juno'];
      const allMissionImages: NASAImageItem[] = [];

      for (const mission of missions.slice(0, 3)) { // Load 3 missions to avoid too many API calls
        const images = await NASAApiService.searchImages(mission, 5);
        allMissionImages.push(...images);
      }

      setMissionData(allMissionImages);
      setQuestActivities(prev => ({ ...prev, missionsExplored: true }));
    } catch (error) {
      console.error('Failed to load missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategory = async (category: string) => {
    setLoading(true);
    setSelectedCategory(category);
    try {
      const images = await NASAApiService.searchImages(category, 15);
      setGalleryImages(images);
      setQuestActivities(prev => ({ ...prev, categoriesExplored: true }));
    } catch (error) {
      console.error('Failed to load category:', error);
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

    setQuestActivities(prev => ({ ...prev, quizCompleted: true }));
  };

  const renderMainView = () => (
    <div className="space-y-6">
      {/* Quest Header */}
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Rocket className="h-10 w-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          NASA Space Explorer
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Journey through the cosmos with NASA's incredible image archives.
          Discover daily astronomy pictures, test your cosmic knowledge, and explore the universe!
        </p>

        {/* Quest Progress */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Quest Progress</span>
            <span className="text-sm font-medium text-white">{activeQuest?.progress || 0}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${activeQuest?.progress || 0}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {getTimeRemaining()}
          </div>
        </div>
      </div>

      {/* Quest Activities */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily APOD */}
        <Card className="border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                <CardTitle className="text-blue-400">Daily Cosmos</CardTitle>
              </div>
              {questActivities.apodViewed && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ✓ Completed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Discover today's Astronomy Picture of the Day from NASA
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setCurrentView('apod');
                loadAPOD();
              }}
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Star className="h-4 w-4 mr-2" />}
              Explore Today's Universe
            </Button>
          </CardContent>
        </Card>

        {/* Cosmic Quiz */}
        <Card className="border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                <CardTitle className="text-purple-400">Cosmic Quiz</CardTitle>
              </div>
              {questActivities.quizCompleted && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ✓ Completed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Test your knowledge of space objects and phenomena
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setCurrentView('quiz');
                loadCosmicQuiz();
              }}
              className="w-full bg-purple-500 hover:bg-purple-600"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
              Challenge Your Mind
            </Button>
          </CardContent>
        </Card>

        {/* Random Explorer */}
        <Card className="border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="h-5 w-5 text-orange-400" />
                <CardTitle className="text-orange-400">Cosmic Surprise</CardTitle>
              </div>
              {questActivities.randomExplored && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ✓ Completed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              I'm feeling cosmic! Discover a random space image
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setCurrentView('random');
                loadRandomImage();
              }}
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shuffle className="h-4 w-4 mr-2" />}
              Surprise Me!
            </Button>
          </CardContent>
        </Card>

        {/* NASA Gallery Explorer */}
        <Card className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <CardTitle className="text-green-400">Space Gallery</CardTitle>
              </div>
              {questActivities.galleryExplored && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ✓ Completed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Browse curated collections of NASA's best space imagery
            </p>
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
              Explore Gallery
            </Button>
          </CardContent>
        </Card>

        {/* NASA Missions */}
        <Card className="border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-cyan-400" />
                <CardTitle className="text-cyan-400">Space Missions</CardTitle>
              </div>
              {questActivities.missionsExplored && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ✓ Completed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Explore historic NASA missions and their incredible discoveries
            </p>
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
              Explore Missions
            </Button>
          </CardContent>
        </Card>

        {/* Space Categories */}
        <Card className="border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <CardTitle className="text-pink-400">Space Categories</CardTitle>
              </div>
              {questActivities.categoriesExplored && (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ✓ Completed
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Discover space content by planets, phenomena, and objects
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setCurrentView('categories')}
              className="w-full bg-pink-500 hover:bg-pink-600"
              disabled={loading}
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Browse Categories
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quest Rewards Preview */}
      {activeQuest?.rewards && (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardHeader>
            <CardTitle className="text-yellow-400 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Quest Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {activeQuest.rewards.map((reward, index) => (
                <Badge key={index} className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {reward}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderAPODView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => setCurrentView('main')}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quest
        </Button>
        <h2 className="text-2xl font-bold text-blue-400">Astronomy Picture of the Day</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      ) : apodData ? (
        <Card className="border-blue-500/30 bg-blue-500/10">
          <CardHeader>
            <CardTitle className="text-blue-400">{apodData.title}</CardTitle>
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
      ) : null}
    </div>
  );

  const renderQuizView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => setCurrentView('main')}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quest
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
        <Card className="border-purple-500/30 bg-purple-500/10">
          <CardHeader>
            <CardTitle className="text-purple-400">{quizData.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={quizData.image.url}
                alt={quizData.image.title}
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quizData.options.map((option, index) => (
                <Button
                  key={index}
                  onClick={() => handleQuizAnswer(index)}
                  disabled={showQuizResult}
                  variant={
                    showQuizResult
                      ? index === quizData.correct
                        ? "default"
                        : selectedAnswer === index
                          ? "destructive"
                          : "outline"
                      : "outline"
                  }
                  className={`h-auto p-4 text-left justify-start ${showQuizResult && index === quizData.correct
                      ? 'bg-green-500 hover:bg-green-600'
                      : ''
                    }`}
                >
                  {option}
                  {showQuizResult && index === quizData.correct && (
                    <span className="ml-auto">✓</span>
                  )}
                </Button>
              ))}
            </div>

            {showQuizResult && (
              <div className="text-center space-y-4">
                <p className={`font-medium ${selectedAnswer === quizData.correct ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {selectedAnswer === quizData.correct ? 'Correct! 🎉' : 'Not quite right, but great try! 🚀'}
                </p>
                <Button
                  onClick={loadCosmicQuiz}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Next Question
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );

  const renderRandomView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => setCurrentView('main')}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quest
        </Button>
        <h2 className="text-2xl font-bold text-orange-400">Cosmic Surprise</h2>
        <Button
          onClick={loadRandomImage}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Another Surprise
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
      ) : randomImage ? (
        <Card className="border-orange-500/30 bg-orange-500/10">
          <CardHeader>
            <CardTitle className="text-orange-400">{randomImage.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {randomImage.center} • {new Date(randomImage.date).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={randomImage.url}
                alt={randomImage.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>

            {randomImage.description && (
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {randomImage.description}
                </p>
              </div>
            )}

            {randomImage.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {randomImage.keywords.slice(0, 6).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );

  const renderGalleryView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => setCurrentView('main')}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quest
        </Button>
        <h2 className="text-2xl font-bold text-green-400">NASA Space Gallery</h2>
        <Button
          onClick={() => loadGallery('space')}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Refresh Gallery
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-green-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <Card key={index} className="border-green-500/30 bg-green-500/10 hover:bg-green-500/20 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedImage(image);
                setShowImageModal(true);
              }}>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-sm line-clamp-2">{image.title}</h3>
                    <p className="text-gray-300 text-xs mt-1">{image.center}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderMissionsView = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          onClick={() => setCurrentView('main')}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quest
        </Button>
        <h2 className="text-2xl font-bold text-cyan-400">NASA Space Missions</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missionData.map((image, index) => (
            <Card key={index} className="border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedImage(image);
                setShowImageModal(true);
              }}>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-semibold text-sm line-clamp-2">{image.title}</h3>
                    <p className="text-gray-300 text-xs mt-1">{image.center}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCategoriesView = () => {
    const categories = [
      { name: 'Planets', query: 'planets', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
      { name: 'Galaxies', query: 'galaxy', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
      { name: 'Nebulae', query: 'nebula', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
      { name: 'Stars', query: 'stars', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
      { name: 'Black Holes', query: 'black hole', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30' },
      { name: 'Astronauts', query: 'astronaut', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
      { name: 'Earth', query: 'earth', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
      { name: 'Mars', query: 'mars', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
      { name: 'Moon', query: 'moon', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => setCurrentView('main')}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quest
          </Button>
          <h2 className="text-2xl font-bold text-pink-400">Space Categories</h2>
        </div>

        {!selectedCategory ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card
                key={category.name}
                className={`${category.border} ${category.bg} hover:scale-105 transition-all duration-300 cursor-pointer`}
                onClick={() => loadCategory(category.query)}
              >
                <CardHeader className="text-center">
                  <CardTitle className={`${category.color} text-lg`}>{category.name}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => {
                  setSelectedCategory('');
                  setGalleryImages([]);
                }}
                variant="outline"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Categories
              </Button>
              <h3 className="text-xl font-bold text-white capitalize">{selectedCategory}</h3>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImages.map((image, index) => (
                  <Card key={index} className="border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 transition-all duration-300 cursor-pointer"
                    onClick={() => {
                      setSelectedImage(image);
                      setShowImageModal(true);
                    }}>
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-lg" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-semibold text-sm line-clamp-2">{image.title}</h3>
                          <p className="text-gray-300 text-xs mt-1">{image.center}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {currentView === 'main' && renderMainView()}
        {currentView === 'apod' && renderAPODView()}
        {currentView === 'quiz' && renderQuizView()}
        {currentView === 'random' && renderRandomView()}
        {currentView === 'gallery' && renderGalleryView()}
        {currentView === 'missions' && renderMissionsView()}
        {currentView === 'categories' && renderCategoriesView()}

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{selectedImage.title}</h3>
                  <Button
                    onClick={() => setShowImageModal(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="h-5 w-5" />
                  </Button>
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