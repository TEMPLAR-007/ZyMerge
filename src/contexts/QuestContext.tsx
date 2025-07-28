import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'nasa-explorer' | 'image-hunter' | 'daily-challenge';
  status: 'locked' | 'available' | 'active' | 'completed';
  duration: number; // in days
  activatedAt?: number;
  completedAt?: number;
  progress: number; // 0-100
  rewards?: string[];
}

interface QuestContextType {
  quests: Quest[];
  activeQuest: Quest | null;
  activateQuest: (questId: string) => void;
  updateQuestProgress: (questId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  isQuestExpired: (quest: Quest) => boolean;
}

const QuestContext = createContext<QuestContextType | undefined>(undefined);

export const useQuests = () => {
  const context = useContext(QuestContext);
  if (!context) {
    throw new Error('useQuests must be used within a QuestProvider');
  }
  return context;
};

const initialQuests: Quest[] = [
  {
    id: 'nasa-explorer',
    name: 'NASA Space Explorer',
    description: 'Embark on a cosmic journey through NASA\'s image archives',
    type: 'nasa-explorer',
    status: 'available',
    duration: 7,
    progress: 0,
    rewards: ['Cosmic Badge', 'Space Explorer Title', 'Exclusive NASA Collection']
  }
];

export const QuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('zymrge-quests');
    return saved ? JSON.parse(saved) : initialQuests;
  });

  const activeQuest = quests.find(q => q.status === 'active') || null;

  useEffect(() => {
    localStorage.setItem('zymrge-quests', JSON.stringify(quests));
  }, [quests]);

  const activateQuest = (questId: string) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId 
        ? { ...quest, status: 'active', activatedAt: Date.now() }
        : quest.status === 'active' 
          ? { ...quest, status: 'available' }
          : quest
    ));
  };

  const updateQuestProgress = (questId: string, progress: number) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId 
        ? { ...quest, progress: Math.min(100, Math.max(0, progress)) }
        : quest
    ));
  };

  const completeQuest = (questId: string) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId 
        ? { ...quest, status: 'completed', completedAt: Date.now(), progress: 100 }
        : quest
    ));
  };

  const isQuestExpired = (quest: Quest): boolean => {
    if (!quest.activatedAt) return false;
    const expiryTime = quest.activatedAt + (quest.duration * 24 * 60 * 60 * 1000);
    return Date.now() > expiryTime;
  };

  // Check for expired quests
  useEffect(() => {
    const checkExpiredQuests = () => {
      setQuests(prev => prev.map(quest => {
        if (quest.status === 'active' && isQuestExpired(quest)) {
          return { ...quest, status: 'available', activatedAt: undefined, progress: 0 };
        }
        return quest;
      }));
    };

    const interval = setInterval(checkExpiredQuests, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <QuestContext.Provider value={{
      quests,
      activeQuest,
      activateQuest,
      updateQuestProgress,
      completeQuest,
      isQuestExpired
    }}>
      {children}
    </QuestContext.Provider>
  );
};