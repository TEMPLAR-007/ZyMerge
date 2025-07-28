import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Rocket, Camera, Trophy, Zap, Globe, Sparkles } from 'lucide-react';

interface QuestDiscoveryProps {
  onClose: () => void;
}

const upcomingQuests = [
  {
    id: 'image-hunter',
    name: 'Image Hunter',
    description: 'Master the art of finding the perfect image across all sources',
    icon: Camera,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    status: 'Coming Soon',
    estimatedRelease: 'Next Update'
  },
  {
    id: 'daily-challenge',
    name: 'Daily Challenge',
    description: 'Complete daily image-related tasks and build your streak',
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    status: 'In Development',
    estimatedRelease: 'Coming Soon'
  },
  {
    id: 'speed-searcher',
    name: 'Speed Searcher',
    description: 'Race against time to find specific images as fast as possible',
    icon: Zap,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    status: 'Planned',
    estimatedRelease: 'Future Update'
  },
  {
    id: 'global-explorer',
    name: 'Global Explorer',
    description: 'Discover images from different countries and cultures around the world',
    icon: Globe,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    status: 'Concept',
    estimatedRelease: 'Future Update'
  }
];

export const QuestDiscovery: React.FC<QuestDiscoveryProps> = ({ onClose }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Coming Soon': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'In Development': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Planned': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Concept': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Quest Discovery</h2>
                <p className="text-sm text-muted-foreground">Upcoming adventures and features</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Quest Highlight */}
          <Card className="border-blue-500/30 bg-blue-500/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-400">NASA Space Explorer</CardTitle>
                  <p className="text-sm text-muted-foreground">Currently Available</p>
                </div>
                <Badge className="ml-auto bg-green-500/20 text-green-400 border-green-500/30">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Journey through the cosmos with NASA's incredible image archives. This quest is currently
                available and offers a complete space exploration experience with daily astronomy pictures,
                cosmic quizzes, and random space discoveries.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Daily APOD</Badge>
                <Badge variant="outline">Cosmic Quiz</Badge>
                <Badge variant="outline">Random Explorer</Badge>
                <Badge variant="outline">7-Day Duration</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Quests */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Coming Soon</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingQuests.map((quest) => {
                const IconComponent = quest.icon;
                return (
                  <Card
                    key={quest.id}
                    className={`${quest.borderColor} ${quest.bgColor} hover:scale-105 transition-all duration-300`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${quest.bgColor} rounded-full flex items-center justify-center`}>
                            <IconComponent className={`h-5 w-5 ${quest.color}`} />
                          </div>
                          <div>
                            <CardTitle className={`${quest.color} text-lg`}>{quest.name}</CardTitle>
                            <p className="text-xs text-muted-foreground">{quest.estimatedRelease}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(quest.status)}>
                          {quest.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {quest.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Development Roadmap */}
          <Card className="border-purple-500/30 bg-purple-500/10">
            <CardHeader>
              <CardTitle className="text-purple-400">Development Roadmap</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm">NASA Space Explorer - Live Now!</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm">Image Hunter Quest - Next Update</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-sm">Daily Challenge System - Coming Soon</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm">Additional Quest Types - Future Updates</span>
                </div>
              </div>

              <div className="pt-4 border-t border-purple-500/30">
                <p className="text-sm text-muted-foreground">
                  Have ideas for new quests? We'd love to hear your suggestions!
                  Each quest is designed to make image discovery more engaging and rewarding.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold text-white">Ready to Start Your Adventure?</h3>
            <p className="text-muted-foreground">
              Begin with the NASA Space Explorer quest and unlock the mysteries of the cosmos!
            </p>
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Rocket className="h-4 w-4 mr-2" />
              Start Exploring
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};