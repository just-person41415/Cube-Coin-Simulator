import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { Recipe } from '../types';
import { Database, ChefHat, Clock, BarChart, Loader2, Code } from 'lucide-react';

const JsonDemo: React.FC = () => {
  const [cuisine, setCuisine] = useState('Italian');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [rawJson, setRawJson] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setRecipes([]);
    setRawJson('');
    try {
      const jsonStr = await geminiService.generateRecipes(cuisine);
      if (jsonStr) {
        setRawJson(jsonStr);
        const parsed = JSON.parse(jsonStr) as Recipe[];
        setRecipes(parsed);
      }
    } catch (error) {
      console.error("Failed to parse JSON", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2 flex items-center gap-3">
          <Database className="text-green-500" /> Structured Data (JSON)
        </h2>
        <p className="text-slate-400">Force Gemini to output strictly formatted JSON using <code>responseSchema</code>.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-end bg-slate-800/50 p-6 rounded-xl border border-slate-700">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-300 mb-2">Cuisine Type</label>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="e.g. Japanese, Mexican, Vegan"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
          Generate Recipes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visual Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <ChefHat className="text-green-400" /> Rendered UI
          </h3>
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recipes.length > 0 ? (
            <div className="grid gap-4">
              {recipes.map((recipe, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 p-5 rounded-xl hover:border-green-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-xl font-bold text-white">{recipe.name}</h4>
                    <span className="bg-green-900/50 text-green-300 text-xs px-2 py-1 rounded-full border border-green-800">
                      {recipe.cuisine}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><BarChart className="w-4 h-4" /> {recipe.difficulty}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {recipe.prepTime}</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-2">Ingredients</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ing, i) => (
                        <span key={i} className="bg-slate-900 text-slate-300 text-xs px-2 py-1 rounded">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl text-slate-500">
              No recipes generated yet.
            </div>
          )}
        </div>

        {/* Raw JSON */}
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2 mb-4">
            <Code className="text-blue-400" /> Raw JSON Output
          </h3>
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 p-4 overflow-auto max-h-[600px] font-mono text-xs md:text-sm">
            {rawJson ? (
              <pre className="text-green-400">{JSON.stringify(JSON.parse(rawJson), null, 2)}</pre>
            ) : (
              <span className="text-slate-600">// JSON response will appear here...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonDemo;
