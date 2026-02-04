import React, { useState } from 'react';
import { Recipe } from '../types';
import { analyzeRecipe } from '../services/geminiService';
import { ChefHat, Plus, Save, Trash2, Loader2, Info, Flame, Droplets, Wheat, Sparkles, Dumbbell, Lock } from 'lucide-react';

interface RecipeBookProps {
    recipes: Recipe[];
    onSaveRecipe: (recipe: Recipe) => void;
    onDeleteRecipe: (id: string) => void;
    isPremium?: boolean; // New prop
}

// Helper for pollintaions image
const getImage = (keyword: string) => `https://image.pollinations.ai/prompt/delicious%20food%20recipe%20${encodeURIComponent(keyword)}%20professional%20photo?width=300&height=200&nologo=true`;

const RecipeBook: React.FC<RecipeBookProps> = ({ recipes, onSaveRecipe, onDeleteRecipe, isPremium = false }) => {
    const [showForm, setShowForm] = useState(false);
    const [ingredients, setIngredients] = useState('');
    const [portions, setPortions] = useState(1);
    const [loading, setLoading] = useState(false);
    const [analyzedData, setAnalyzedData] = useState<Omit<Recipe, 'id'> | null>(null);

    const handleAnalyze = async () => {
        if (!ingredients.trim()) return;
        setLoading(true);
        try {
            const result = await analyzeRecipe(ingredients, portions);
            setAnalyzedData(result);
        } catch (error) {
            alert("Erro ao analisar receita. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = () => {
        if (analyzedData) {
            onSaveRecipe({
                ...analyzedData,
                id: Date.now().toString()
            });
            setShowForm(false);
            setIngredients('');
            setPortions(1);
            setAnalyzedData(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <ChefHat className="text-orange-600" /> Livro de Receitas
                    </h2>
                    <p className="text-gray-500 text-sm">Suas receitas analisadas nutricionalmente.</p>
                </div>
                {!showForm && (
                    <button 
                        onClick={() => setShowForm(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-orange-200 transition-all"
                    >
                        <Plus size={20} /> Nova Receita
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-slide-up">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-4">Adicionar Ingredientes</h3>
                            <textarea 
                                className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none mb-4"
                                placeholder="Ex: 2 ovos, 1 banana, 2 colheres de aveia, 1 colher de mel..."
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                            ></textarea>
                            <div className="flex items-center gap-4 mb-4">
                                <label className="text-sm font-bold text-gray-600">Rendimento (porções):</label>
                                <input 
                                    type="number" min="1" 
                                    className="w-20 p-2 border border-gray-200 rounded-lg text-center font-bold outline-none focus:border-orange-500"
                                    value={portions}
                                    onChange={(e) => setPortions(Math.max(1, parseInt(e.target.value)))}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleAnalyze}
                                    disabled={loading || !ingredients}
                                    className="flex-1 bg-orange-600 text-white font-bold py-2 rounded-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2 shadow-md"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                                    Analisar Nutrição
                                </button>
                            </div>
                        </div>

                        {analyzedData && (
                            <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden shadow-sm shrink-0">
                                        <img src={getImage(analyzedData.imageKeyword || 'food')} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-800">{analyzedData.name}</h4>
                                        <p className="text-sm text-gray-500">Porção individual calculada</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                                    <div className="bg-white p-2 rounded-lg shadow-sm">
                                        <div className="text-[10px] uppercase font-bold text-gray-400">Kcal</div>
                                        <div className="text-lg font-black text-gray-800">{analyzedData.caloriesPerPortion}</div>
                                    </div>
                                    <div className={`bg-white p-2 rounded-lg shadow-sm ${!isPremium ? 'opacity-50 blur-[2px]' : ''}`}>
                                        <div className="text-[10px] uppercase font-bold text-blue-500">Prot</div>
                                        <div className="text-lg font-bold text-blue-700">{analyzedData.macrosPerPortion.p}g</div>
                                    </div>
                                    <div className={`bg-white p-2 rounded-lg shadow-sm ${!isPremium ? 'opacity-50 blur-[2px]' : ''}`}>
                                        <div className="text-[10px] uppercase font-bold text-yellow-500">Carb</div>
                                        <div className="text-lg font-bold text-yellow-700">{analyzedData.macrosPerPortion.c}g</div>
                                    </div>
                                    <div className={`bg-white p-2 rounded-lg shadow-sm ${!isPremium ? 'opacity-50 blur-[2px]' : ''}`}>
                                        <div className="text-[10px] uppercase font-bold text-rose-500">Gord</div>
                                        <div className="text-lg font-bold text-rose-700">{analyzedData.macrosPerPortion.f}g</div>
                                    </div>
                                </div>
                                {!isPremium && <p className="text-xs text-center text-orange-600 mb-2 font-bold"><Lock size={10} className="inline mr-1"/> Macros visíveis no Premium</p>}

                                {analyzedData.micronutrients && (
                                    <div className="mb-6">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Micronutrientes</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {analyzedData.micronutrients.map((m, i) => (
                                                <span key={i} className="text-[10px] bg-white border border-orange-100 text-orange-800 px-2 py-1 rounded-md font-medium">
                                                    {m}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button 
                                    onClick={handleSave}
                                    className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Salvar no Livro
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.length === 0 && !showForm && (
                    <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <ChefHat className="mx-auto mb-3 opacity-30" size={48} />
                        <p>Nenhuma receita salva ainda.</p>
                    </div>
                )}
                {recipes.map(recipe => (
                    <div key={recipe.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all group relative">
                        <div className="h-40 bg-gray-100 relative overflow-hidden">
                            <img src={getImage(recipe.imageKeyword || recipe.name)} alt={recipe.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                                {recipe.portions} porções
                            </div>
                        </div>
                        
                        <div className="p-5">
                            <h4 className="font-bold text-gray-800 text-lg mb-3 line-clamp-1">{recipe.name}</h4>
                            
                            <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-xl relative overflow-hidden">
                                <div className="text-center">
                                    <Flame size={16} className="mx-auto text-orange-500 mb-1" />
                                    <span className="text-xs font-bold text-gray-700">{recipe.caloriesPerPortion}</span>
                                </div>
                                
                                {isPremium ? (
                                    <>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="text-center">
                                            <Dumbbell size={16} className="mx-auto text-blue-500 mb-1" />
                                            <span className="text-xs font-bold text-gray-700">{recipe.macrosPerPortion.p}g</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="text-center">
                                            <Wheat size={16} className="mx-auto text-yellow-500 mb-1" />
                                            <span className="text-xs font-bold text-gray-700">{recipe.macrosPerPortion.c}g</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="text-center">
                                            <Droplets size={16} className="mx-auto text-rose-500 mb-1" />
                                            <span className="text-xs font-bold text-gray-700">{recipe.macrosPerPortion.f}g</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-y-0 right-0 w-3/4 bg-white/80 backdrop-blur-sm flex items-center justify-center border-l border-gray-100">
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wide">
                                            <Lock size={10} /> Macros Premium
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="text-xs text-gray-500 line-clamp-2 mb-4 bg-white border border-gray-100 p-2 rounded-lg italic">
                                {recipe.ingredients}
                            </div>

                            <button 
                                onClick={() => onDeleteRecipe(recipe.id)}
                                className="w-full py-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={14} /> Excluir Receita
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecipeBook;