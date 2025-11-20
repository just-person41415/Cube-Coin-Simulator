import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { decodeBase64, decodeAudioData } from '../utils';
import { Mic, Play, Loader2, Volume2, AudioWaveform } from 'lucide-react';

const SpeechDemo: React.FC = () => {
  const [text, setText] = useState("The quick brown fox jumps over the lazy dog. Gemini's speech synthesis is incredibly fast and natural.");
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerateAndPlay = async () => {
    if (!text.trim()) return;
    
    setLoading(true);
    try {
      // 1. Get Base64 audio from Gemini
      const base64Audio = await geminiService.generateSpeech(text);
      
      if (!base64Audio) throw new Error("No audio data returned");

      // 2. Setup Audio Context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContext({ sampleRate: 24000 }); // Gemini TTS default is 24kHz
      
      // 3. Decode
      const audioBytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);

      // 4. Play
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        setIsPlaying(false);
        audioCtx.close();
      };

      setIsPlaying(true);
      source.start(0);
      setLoading(false);

    } catch (error) {
      console.error("TTS Error:", error);
      setLoading(false);
      setIsPlaying(false);
      alert("Failed to generate or play speech.");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 max-w-4xl mx-auto">
      <div className="w-full bg-slate-800/50 backdrop-blur border border-slate-700 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 mb-4 shadow-lg shadow-orange-500/20">
            <Mic className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Text-to-Speech</h2>
          <p className="text-slate-400">Experience the natural voice capabilities of Gemini 2.5.</p>
        </div>

        <div className="space-y-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-4 text-lg text-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none transition-shadow"
            placeholder="Enter text to speak..."
          />

          <div className="flex justify-center">
            <button
              onClick={handleGenerateAndPlay}
              disabled={loading || isPlaying || !text.trim()}
              className={`
                relative overflow-hidden group
                flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all
                ${loading || isPlaying 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:scale-105 shadow-lg shadow-orange-500/25'}
              `}
            >
              {loading ? (
                <Loader2 className="animate-spin w-6 h-6" />
              ) : isPlaying ? (
                <AudioWaveform className="animate-pulse w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 fill-current" />
              )}
              <span>
                {loading ? 'Generating Audio...' : isPlaying ? 'Playing...' : 'Generate & Speak'}
              </span>
            </button>
          </div>
        </div>

        {isPlaying && (
          <div className="mt-8 flex justify-center items-center gap-2 text-orange-400 animate-pulse">
            <Volume2 className="w-5 h-5" />
            <span className="text-sm font-medium">Audio is playing</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeechDemo;
