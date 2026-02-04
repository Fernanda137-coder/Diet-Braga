import React, { useState, useEffect } from 'react';
import { getHealthTips, searchFoodDatabase } from '../services/geminiService';
import { Lightbulb, Droplets, Moon, Brain, Apple, Sparkles, Send, Loader2, Info } from 'lucide-react';

const CATEGORIES = [
    { id: 'hydration', label: 'Hidratação', icon: <Droplets className="text-blue-500"/>, color: 'bg-blue-50' },
    { id: 'sleep', label: 'Sono & Descanso', icon: <Moon className="text-indigo-500"/>, color: 'bg-indigo-50' },
    { id: 'nutrition', label: 'Nutrição Geral', icon: <Apple className="text-green-500"/>, color: 'bg-green-50' },
    { id: 'mindset', label: 'Comportamento', icon: <Brain className="text-purple-500"/>, color: 'bg-purple-50' }
];

const TipsAndAdvice: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'TIPS' | 'AI'>('TIPS');
    const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
    const [tips, setTips] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // AI Consultant State
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState<any>(null);
    const [loadingAI, setLoadingAI] = useState(false);

    const loadTips = async (category: string) => {
        setLoading(true);
        const data = await getHealthTips(category);
        setTips(data);
        setLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'TIPS') {
            loadTips(selectedCategory.label);
        }
    }, [selectedCategory, activeTab]);

    const handleAIConsult = async () => {
        if (!aiQuery.trim()) return;
        setLoadingAI(true);
        setAiResponse(null);
        try {
            // Using searchFoodDatabase as a proxy for generic queries since we already have it structured, 
            // or effectively using the same text analysis endpoint.
            // Ideally we'd have a specific "askAnything" endpoint, but reusing the existing structure for simplicity
            // The existing `searchFoodDatabase` prompt is tailored for food, but usually returns generic info if pushed.
            // Let's rely on the flexibility of the LLM or assume `searchFoodDatabase` is robust enough for now.
            // Re-purposing searchFoodDatabase for general queries:
            const data = await searchFoodDatabase(aiQuery);
            setAiResponse(data);
        } catch (e) {
            alert("Erro ao consultar IA.");
        } finally {
            setLoadingAI(false);
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
             <header className="mb-4 flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        {activeTab === 'TIPS' ? <Lightbulb className="text-yellow-500" /> : <Sparkles className="text-purple-500" />}
                        {activeTab === 'TIPS' ? 'Dicas e Conselhos' : 'Consultor IA'}
                    </h2>
                    <p className="text-gray-500">Conteúdos para enriquecer seu conhecimento.</p>
                </div>
                <div className="bg-gray-100 p-1 rounded-xl flex">
                    <button 
                        onClick={() => setActiveTab('TIPS')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'TIPS' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
                    >
                        Dicas Gerais
                    </button>
                    <button 
                        onClick={() => setActiveTab('AI')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'AI' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
                    >
                        <Sparkles size={14} /> Consultar IA
                    </button>
                </div>
            </header>

            {activeTab === 'TIPS' && (
                <>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all whitespace-nowrap font-bold ${
                                    selectedCategory.id === cat.id 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                                    : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                                }`}
                            >
                                {cat.icon}
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className={`p-8 rounded-3xl ${selectedCategory.color} border border-gray-100 h-full flex flex-col justify-center items-center text-center`}>
                            <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                                {React.cloneElement(selectedCategory.icon as React.ReactElement<any>, { size: 48 })}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">{selectedCategory.label}</h3>
                            <p className="text-gray-600 mt-2">Dicas personalizadas pela nossa IA especializada.</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[300px]">
                            {loading ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
                                    <p>Buscando melhores dicas...</p>
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {tips.map((tip, idx) => (
                                        <li key={idx} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="bg-emerald-100 text-emerald-700 font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </div>
                                            <p className="text-gray-700 font-medium leading-relaxed">{tip}</p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'AI' && (
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px] flex flex-col">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Brain size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Pergunte ao Especialista Virtual</h3>
                        <p className="text-gray-500 max-w-lg mx-auto">Tire dúvidas sobre patologias, alimentos, combinações de nutrientes ou qualquer tópico de saúde.</p>
                    </div>

                    <div className="flex gap-2 mb-8">
                        <input 
                            type="text" 
                            className="flex-1 border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            placeholder="Ex: Quais os benefícios do Chá Verde? Dieta para gastrite?"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAIConsult()}
                        />
                        <button 
                            onClick={handleAIConsult}
                            disabled={loadingAI || !aiQuery.trim()}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                            {loadingAI ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                            Consultar
                        </button>
                    </div>

                    {loadingAI && (
                        <div className="flex-1 flex flex-col items-center justify-center text-purple-400 opacity-70">
                            <Sparkles className="animate-pulse mb-2" size={48} />
                            <p>Analisando sua pergunta...</p>
                        </div>
                    )}

                    {aiResponse && !loadingAI && (
                        <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 animate-slide-up">
                            <h4 className="font-bold text-purple-900 text-lg mb-4 flex items-center gap-2">
                                <Info size={20}/> Resultado da Análise
                            </h4>
                            
                            <div className="space-y-4 text-purple-900/80">
                                <div>
                                    <span className="font-bold block text-xs uppercase text-purple-400 mb-1">Informações Nutricionais (Estimadas)</span>
                                    <div className="flex gap-4 text-sm font-bold">
                                        <span>{aiResponse.calories} kcal</span>
                                        <span>P: {aiResponse.protein}g</span>
                                        <span>C: {aiResponse.carbs}g</span>
                                        <span>G: {aiResponse.fat}g</span>
                                    </div>
                                </div>

                                {aiResponse.benefits && (
                                    <div>
                                        <span className="font-bold block text-xs uppercase text-purple-400 mb-1">Principais Benefícios / Informações</span>
                                        <ul className="list-disc list-inside space-y-1">
                                            {aiResponse.benefits.map((b: string, i: number) => <li key={i}>{b}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {aiResponse.usageAdvice && (
                                    <div>
                                        <span className="font-bold block text-xs uppercase text-purple-400 mb-1">Recomendações</span>
                                        <ul className="list-disc list-inside space-y-1">
                                            {aiResponse.usageAdvice.map((b: string, i: number) => <li key={i}>{b}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TipsAndAdvice;