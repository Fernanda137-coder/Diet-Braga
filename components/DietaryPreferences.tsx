import React, { useState } from 'react';
import { Patient, DietPreferences } from '../types';
import { Save, Check, Sliders } from 'lucide-react';

interface DietaryPreferencesProps {
  patient: Patient;
  onUpdatePreferences: (prefs: DietPreferences) => void;
}

const DIET_TYPES = [
  'Balanceada', 'Low Carb', 'Cetogênica', 'Mediterrânea', 'Vegetariana', 'Vegana', 'Paleo', 'Jejum Intermitente'
];

// Organized Categories for selection
const FOOD_CATEGORIES = [
  {
    category: "Proteínas",
    items: ["Frango", "Carne Vermelha", "Peixe", "Ovos", "Tofu", "Porco", "Camarão", "Whey Protein"]
  },
  {
    category: "Carboidratos",
    items: ["Arroz Branco", "Arroz Integral", "Batata Doce", "Batata Inglesa", "Macarrão", "Aveia", "Pão", "Tapioca"]
  },
  {
    category: "Frutas & Vegetais",
    items: ["Banana", "Maçã", "Brócolis", "Cenoura", "Alface", "Tomate", "Abacate", "Frutas Cítricas"]
  },
  {
    category: "Outros",
    items: ["Leite", "Queijo", "Iogurte", "Castanhas", "Pasta de Amendoim", "Chocolate Amargo", "Café"]
  }
];

const DietaryPreferences: React.FC<DietaryPreferencesProps> = ({ patient, onUpdatePreferences }) => {
  const [prefs, setPrefs] = useState<DietPreferences>(
    patient.preferences || {
      dietType: 'Balanceada',
      favoriteFoods: [],
      dislikedFoods: [],
      mealsPerDay: 4,
      waterIntakeGoal: 2000,
      calorieGoal: undefined
    }
  );
  
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    onUpdatePreferences(prefs);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const toggleFavorite = (food: string) => {
    if (prefs.favoriteFoods.includes(food)) {
        setPrefs({ ...prefs, favoriteFoods: prefs.favoriteFoods.filter(f => f !== food) });
    } else {
        // Remove from dislikes if present
        const newDislikes = prefs.dislikedFoods.filter(f => f !== food);
        setPrefs({ ...prefs, favoriteFoods: [...prefs.favoriteFoods, food], dislikedFoods: newDislikes });
    }
  };

  const toggleDislike = (food: string) => {
    if (prefs.dislikedFoods.includes(food)) {
        setPrefs({ ...prefs, dislikedFoods: prefs.dislikedFoods.filter(f => f !== food) });
    } else {
        // Remove from favorites if present
        const newFavs = prefs.favoriteFoods.filter(f => f !== food);
        setPrefs({ ...prefs, dislikedFoods: [...prefs.dislikedFoods, food], favoriteFoods: newFavs });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Sliders className="text-emerald-600" /> Preferências Alimentares
        </h2>
        <p className="text-gray-500">Personalize seu perfil para receber planos alimentares mais assertivos.</p>
      </header>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        
        {/* Goals Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
                <label className="block font-semibold text-gray-700 mb-2">Refeições por dia</label>
                <input 
                    type="range" min="2" max="6" step="1" 
                    value={prefs.mealsPerDay}
                    onChange={(e) => setPrefs({...prefs, mealsPerDay: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="text-center font-bold text-emerald-600 mt-2">{prefs.mealsPerDay} refeições</div>
            </div>
            <div>
                <label className="block font-semibold text-gray-700 mb-2">Meta de Água (ml)</label>
                <input 
                    type="number" 
                    value={prefs.waterIntakeGoal}
                    onChange={(e) => setPrefs({...prefs, waterIntakeGoal: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
            </div>
             <div>
                <label className="block font-semibold text-gray-700 mb-2">Meta Calórica (Opcional)</label>
                <input 
                    type="number" 
                    placeholder="Auto (IA)"
                    value={prefs.calorieGoal || ''}
                    onChange={(e) => setPrefs({...prefs, calorieGoal: e.target.value ? parseInt(e.target.value) : undefined})}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
            </div>
        </div>

        {/* Diet Type */}
        <div className="mb-8">
           <label className="block text-lg font-bold text-gray-700 mb-3">Estilo de Dieta Principal</label>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {DIET_TYPES.map(type => (
               <button
                 key={type}
                 onClick={() => setPrefs({ ...prefs, dietType: type })}
                 className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                   prefs.dietType === type 
                     ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                     : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
                 }`}
               >
                 {type}
               </button>
             ))}
           </div>
        </div>

        {/* Food Selection Grid */}
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800">Seleção de Alimentos</h3>
            <p className="text-sm text-gray-500 -mt-4 mb-4">Clique uma vez para <span className="text-emerald-600 font-bold">Favoritar (Verde)</span>, duas vezes para <span className="text-rose-500 font-bold">Evitar (Vermelho)</span>.</p>
            
            {FOOD_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                    <h4 className="font-bold text-gray-700 mb-3">{cat.category}</h4>
                    <div className="flex flex-wrap gap-2">
                        {cat.items.map(item => {
                            const isFav = prefs.favoriteFoods.includes(item);
                            const isDislike = prefs.dislikedFoods.includes(item);
                            
                            return (
                                <button
                                    key={item}
                                    onClick={() => {
                                        if (isFav) toggleDislike(item); // Go from Fav to Dislike
                                        else if (isDislike) { 
                                             // Reset (remove both)
                                             setPrefs({
                                                ...prefs,
                                                favoriteFoods: prefs.favoriteFoods.filter(f => f !== item),
                                                dislikedFoods: prefs.dislikedFoods.filter(f => f !== item)
                                             });
                                        } else {
                                            toggleFavorite(item); // Go to Fav
                                        }
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                                        isFav 
                                            ? 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm' 
                                            : isDislike 
                                                ? 'bg-rose-100 border-rose-300 text-rose-800 shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                                >
                                    {item}
                                </button>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>

        <div className="flex justify-end pt-8 border-t border-gray-100 mt-8">
           <button 
             onClick={handleSave}
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all"
           >
             {success ? <Check /> : <Save />}
             {success ? 'Salvo!' : 'Salvar Preferências'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default DietaryPreferences;