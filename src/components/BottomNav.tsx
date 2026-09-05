import React from 'react';
import { BookOpen, Timer, Utensils, Scale, Sparkles } from 'lucide-react';

export type NavTab = 'diary' | 'fasting' | 'recipes' | 'weight' | 'coach';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'diary', label: 'Günlük', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'fasting', label: 'Oruç', icon: <Timer className="w-5 h-5" /> },
    { id: 'recipes', label: 'Tarifler', icon: <Utensils className="w-5 h-5" /> },
    { id: 'weight', label: 'Kilo', icon: <Scale className="w-5 h-5" /> },
    { id: 'coach', label: 'Willy Koç', icon: <Sparkles className="w-5 h-5" />, badge: 'AI PRO' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-2 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              id={`nav-tab-${tab.id}`}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-emerald-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.badge && (
                <span className="absolute -top-1.5 right-1 px-1.5 py-0.2 rounded-full text-[8px] font-extrabold bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-sm animate-pulse">
                  {tab.badge}
                </span>
              )}
              <div
                className={`p-1.5 rounded-xl transition ${
                  isActive ? 'bg-emerald-500/15 text-emerald-400' : ''
                }`}
              >
                {tab.icon}
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
