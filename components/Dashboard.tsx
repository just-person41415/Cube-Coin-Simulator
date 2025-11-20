import React from 'react';
import { AppMode } from '../types';
import { MessageSquare, Eye, Database, Mic, ArrowRight } from 'lucide-react';

interface DashboardProps {
  setMode: (mode: AppMode) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setMode }) => {
  const features = [
    {
      id: AppMode.Chat,
      title: "Chat & Reasoning",
      desc: "Engage in complex dialogue with streaming responses and deep reasoning capabilities.",
      icon: MessageSquare,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      id: AppMode.Vision,
      title: "Multimodal Vision",
      desc: "Upload images to analyze content, extract text, or generate descriptions.",
      icon: Eye,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    {
      id: AppMode.Json,
      title: "Structured JSON",
      desc: "Generate guaranteed JSON output for integration with apps and databases using Schemas.",
      icon: Database,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20"
    },
    {
      id: AppMode.Speech,
      title: "Natural Speech",
      desc: "Convert text into lifelike audio using the latest TTS models.",
      icon: Mic,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20"
    }
  ];

  return (
    <div className="h-full p-6 md:p-10 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
            What can <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">Gemini</span> do?
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Explore the capabilities of the Gemini 2.5 Flash model through this interactive playground. 
            Select a feature below to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.id}
                onClick={() => setMode(feature.id)}
                className={`group relative p-8 rounded-3xl text-left transition-all duration-300 hover:-translate-y-1 border ${feature.bg} ${feature.border} hover:bg-slate-800`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.bg}`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  {feature.desc}
                </p>
                <div className={`flex items-center text-sm font-semibold ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0`}>
                  Try Demo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
