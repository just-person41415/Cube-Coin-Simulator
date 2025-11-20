import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, LoadingState } from '../types';
import { geminiService } from '../services/geminiService';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const ChatDemo: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello! I am Gemini 2.5. Ask me anything to see my reasoning and streaming capabilities.', timestamp: Date.now() }
  ]);
  const [status, setStatus] = useState<LoadingState>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status === 'loading' || status === 'streaming') return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStatus('loading');

    // Prepare history for API
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    // Placeholder for model response
    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', timestamp: Date.now() }]);

    try {
      setStatus('streaming');
      const stream = geminiService.streamChat(history, userMsg.text);
      
      let fullText = '';
      for await (const chunk of stream) {
        if (chunk) {
          fullText += chunk;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === modelMsgId ? { ...msg, text: fullText } : msg
            )
          );
        }
      }
      setStatus('idle');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Sorry, I encountered an error processing your request.', timestamp: Date.now(), isError: true }]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-purple-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 rounded-tr-none' 
                  : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{msg.text}</p>
                {msg.isError && <span className="text-red-400 text-xs mt-2 block">Error occurred</span>}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me something complex..."
            className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl py-4 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-lg"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'streaming' || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'streaming' ? <Sparkles className="animate-pulse w-5 h-5" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatDemo;
