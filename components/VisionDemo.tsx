import React, { useState, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { Upload, Image as ImageIcon, Loader2, AlertCircle, Search, Sparkles } from 'lucide-react';

const VisionDemo: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Describe this image in detail and tell me something interesting about it.');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setResult('');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setResult('');
    try {
      const text = await geminiService.analyzeImage(selectedFile, prompt);
      setResult(text || "No response text generated.");
    } catch (error) {
      console.error(error);
      setResult("Error analyzing image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <ImageIcon className="text-purple-500" /> Vision Analysis
        </h2>
        <p className="text-slate-400">Upload an image to test Gemini's multimodal capabilities.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            className={`border-2 border-dashed rounded-2xl transition-all h-80 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group ${
              preview ? 'border-purple-500/50 bg-slate-900' : 'border-slate-700 hover:border-purple-400 hover:bg-slate-800/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="h-full w-full object-contain z-10" />
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-purple-400" />
                </div>
                <p className="text-slate-300 font-medium">Click to upload image</p>
                <p className="text-slate-500 text-sm mt-1">JPG, PNG, WEBP supported</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
            {preview && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                <p className="text-white font-medium">Change Image</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300">Prompt</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none h-24 resize-none"
            />
            <button 
              onClick={handleAnalyze}
              disabled={!selectedFile || loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="animate-spin w-5 h-5" /> Analyzing...</>
              ) : (
                <><Search className="w-5 h-5" /> Analyze Image</>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 min-h-[320px]">
          <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" /> Analysis Result
          </h3>
          
          {result ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-slate-300 leading-relaxed">{result}</p>
            </div>
          ) : loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="animate-pulse">Gemini is looking at your image...</p>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-3">
              <AlertCircle className="w-8 h-8" />
              <p>Upload an image and click Analyze to see the magic.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisionDemo;