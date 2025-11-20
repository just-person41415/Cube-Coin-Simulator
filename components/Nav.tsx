import React from 'react';
import { AppMode } from '../types';
import { LayoutDashboard, MessageSquare, Eye, Database, Mic } from 'lucide-react';

interface NavProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Nav: React.FC<NavProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { id: AppMode.Dashboard, label: 'Overview', icon: LayoutDashboard },
    { id: AppMode.Chat, label: 'Chat Stream', icon: MessageSquare },
    { id: AppMode.Vision, label: 'Vision', icon: Eye },
    { id: AppMode.Json, label: 'JSON Mode', icon: Database },
    { id: AppMode.Speech, label: 'Speech (TTS)', icon: Mic },
  ];

  return (
    <nav className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 flex flex-col h-full">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Gemini
          <span className="block text-xs font-normal text-slate-400 mt-1">Interactive Showcase</span>
        </h1>
      </div>
      <div className="flex-1 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMode(item.id)}
              className={`w-full flex items-center px-6 py-3 transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400 border-r-2 border-blue-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="p-6 border-t border-slate-800 text-xs text-slate-500">
        Powered by Gemini 2.5 Flash
      </div>
    </nav>
  );
};

export default Nav;
