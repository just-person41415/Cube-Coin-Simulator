import React, { useState } from 'react';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
import ChatDemo from './components/ChatDemo';
import VisionDemo from './components/VisionDemo';
import JsonDemo from './components/JsonDemo';
import SpeechDemo from './components/SpeechDemo';
import { AppMode } from './types';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Dashboard);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const renderContent = () => {
    switch (mode) {
      case AppMode.Dashboard: return <Dashboard setMode={setMode} />;
      case AppMode.Chat: return <ChatDemo />;
      case AppMode.Vision: return <VisionDemo />;
      case AppMode.Json: return <JsonDemo />;
      case AppMode.Speech: return <SpeechDemo />;
      default: return <Dashboard setMode={setMode} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Nav currentMode={mode} setMode={setMode} />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
        <span className="font-bold text-white">Gemini Showcase</span>
        <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="text-white">
          {mobileNavOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900 pt-16 md:hidden">
          <Nav 
            currentMode={mode} 
            setMode={(m) => {
              setMode(m);
              setMobileNavOpen(false);
            }} 
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 h-full relative pt-16 md:pt-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
