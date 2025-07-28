import React, { useState } from 'react';
import { useQuests } from '../contexts/QuestContext';
import { NASASpaceExplorer } from './quests/NASASpaceExplorer';
import { QuestDiscovery } from './quests/QuestDiscovery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Rocket, Star, Trophy, Clock } from 'lucide-react';

export const QuestSection: React.FC = () => {
  const { quests, activeQuest, activateQuest } = useQuests();
  const [showDiscovery, setShowDiscovery] = useState(false);

  const formatTimeRemaining = (quest: any) => {
    if (!quest.activatedAt) return null;

    const expiryTime = quest.activatedAt + (quest.duration * 24 * 60 * 60 * 1000);
    const timeLeft = expiryTime - Date.now();

    if (timeLeft <= 0) return 'Expired';

    const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const getQuestStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'available': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (activeQuest?.type === 'nasa-explorer') {
    return <NASASpaceExplorer />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Quest Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Rocket className="h-8 w-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Quest Hub</h1>
          <Star className="h-6 w-6 text-yellow-400" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Embark on exciting adventures and discover new ways to explore images.
          Complete quests to unlock exclusive features and earn cosmic rewards!
        </p>
      </div>

      {/* Active Quest Banner */}
      {activeQuest && (
        <Card className="mb-8 border-blue-500/30 bg-blue-500/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Rocket className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-blue-400">{activeQuest.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{activeQuest.description}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mb-2">
                  Active
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimeRemaining(activeQuest)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-muted-foreground">Progress:</span>
                  <span className="text-sm font-medium text-white">{activeQuest.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${activeQuest.progress}%` }}
                  />
                </div>
              </div>
              <Button
                onClick={() => {/* Continue quest logic */ }}
                className="ml-4 bg-blue-500 hover:bg-blue-600"
              >
                Continue Quest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Quests */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {quests.map((quest) => (
          <Card
            key={quest.id}
            className={`hover:shadow-lg transition-all duration-300 ${quest.status === 'active' ? 'ring-2 ring-blue-500/50' : ''
              }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className={getQuestStatusColor(quest.status)}>
                  {quest.status.charAt(0).toUpperCase() + quest.status.slice(1)}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {quest.duration}d duration
                </div>
              </div>
              <CardTitle className="text-lg">{quest.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{quest.description}</p>
            </CardHeader>
            <CardContent>
              {quest.status === 'completed' && (
                <div className="flex items-center gap-2 mb-4 text-green-400">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-medium">Completed!</span>
                </div>
              )}

              {quest.rewards && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Rewards:</p>
                  <div className="flex flex-wrap gap-1">
                    {quest.rewards.map((reward, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {reward}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {quest.status === 'available' && (
                <Button
                  onClick={() => activateQuest(quest.id)}
                  className="w-full"
                  variant="outline"
                >
                  Start Quest
                </Button>
              )}

              {quest.status === 'active' && quest.id !== activeQuest?.id && (
                <Button
                  onClick={() => activateQuest(quest.id)}
                  className="w-full"
                >
                  Switch to Quest
                </Button>
              )}

              {quest.status === 'locked' && (
                <Button disabled className="w-full">
                  Locked
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quest Discovery */}
      <Card className="border-purple-500/30 bg-purple-500/10">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Discover New Quests
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            New adventures are always being added. Check back regularly for exciting new quests!
          </p>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowDiscovery(true)}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
          >
            Explore Coming Soon
          </Button>
        </CardContent>
      </Card>

      {/* Quest Discovery Modal */}
      {showDiscovery && (
        <QuestDiscovery onClose={() => setShowDiscovery(false)} />
      )}
    </div>
  );
};