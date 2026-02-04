import React, { useState } from 'react';
import { Patient, MealPlan, MealSection } from '../types';
import { generateMealPlan } from '../services/geminiService';
import { Sparkles, Loader2, Coffee, Sun, Sunset, Moon, Lightbulb, Dumbbell, Zap, ShoppingCart, Printer, Check, ArrowRight, Settings, CheckSquare, Square, PieChart, Info, Target } from 'lucide-react';

interface MealPlannerProps {
  patient: Patient;
}

const MealPlanner: React.FC<MealPlannerProps> = ({ patient }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [view, setView] = useState<'PLAN' | 'SHOPPING'>('PLAN');
  const [showConfig, setShowConfig] = useState(false);
  const [calorieLimit, setCalorieLimit] = useState<number | ''>('');

  // Meal Selection State
  const [selectedMeals, setSelectedMeals] = useState<Record<string, boolean>>({
    breakfast: true,
    lunch: true,
    snack: true,
    dinner: true,
    preWorkout: false,
    postWorkout: false
  });

  const toggleMeal = (key: string) => {
    setSelectedMeals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setShowConfig(false);
    try {
      // Convert state to array of keys
      const mealsToGenerate = Object.keys(selectedMeals).filter(k => selectedMeals[k]);
      const limit = calorieLimit ? Number(calorieLimit) : undefined;
      
      const newPlan = await generateMealPlan(patient, mealsToGenerate, limit);
      setPlan(newPlan);
      setView('PLAN');
    } catch (error) {
      alert("Erro ao gerar plano. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const MEAL_LABELS: Record<string, string> = {
      breakfast: "Café da Manhã",
      lunch: "Almoço",
      snack: "Lanche da Tarde",
      dinner: "Jantar",
      preWorkout: "Pré-treino",
      postWorkout: "Pós-treino"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-700 p-8 rounded-3xl text-white shadow-lg print:hidden relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        
        <div className="relative z-10 mb-4 md:mb-0 w-full md:w-auto">
          <h2 className="text-3xl font-bold mb-2">Planejamento Inteligente</h2>
          <p className="opacity-90 max-w-xl text-sm md:text-base">
            Plano baseado em: <span className="font-bold">{patient.preferences?.dietType || 'Dieta Balanceada'}</span>.
          </p>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className="mt-3 flex items-center gap-2 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Settings size={14} /> Configurar Refeições
          </button>
        </div>

        <div className="flex gap-2 relative z-10">
            {plan && (
                <button 
                  onClick={() => setView(view === 'PLAN' ? 'SHOPPING' : 'PLAN')}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                   {view === 'PLAN' ? <ShoppingCart size={20} /> : <Coffee size={20} />}
                   {view === 'PLAN' ? 'Ver Lista' : 'Ver Dieta'}
                </button>
            )}
            <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-white text-emerald-700 px-6 py-3 rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-70"
            >
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {loading ? "Gerando..." : "Gerar Plano"}
            </button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 animate-slide-up">
              <div className="mb-6 pb-6 border-b border-gray-100">
                  <h3 className="text-gray-800 font-bold mb-3 flex items-center gap-2">
                      <Target className="text-red-500" size={20}/> Definição de Metas (Opcional)
                  </h3>
                  <div className="flex items-center gap-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Limite Máximo de Calorias</label>
                          <div className="relative">
                              <input 
                                type="number" 
                                placeholder="Ex: 2000" 
                                className="w-40 border border-gray-300 rounded-lg p-2 pl-3 outline-none focus:ring-2 focus:ring-emerald-500 text-gray-800 font-bold"
                                value={calorieLimit}
                                onChange={(e) => setCalorieLimit(e.target.value ? Number(e.target.value) : '')}
                              />
                              <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">kcal</span>
                          </div>
                      </div>
                      <div className="text-xs text-gray-400 max-w-xs mt-5">
                          A IA irá ajustar as porções para não ultrapassar este valor total diário.
                      </div>
                  </div>
              </div>

              <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                  <CheckSquare className="text-emerald-600" size={20}/> Selecione as refeições para gerar:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.keys(selectedMeals).map((key) => (
                      <button
                        key={key}
                        onClick={() => toggleMeal(key)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                            selectedMeals[key] 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                          {selectedMeals[key] ? <CheckSquare size={18} /> : <Square size={18} />}
                          <span className="font-medium text-sm">{MEAL_LABELS[key]}</span>
                      </button>
                  ))}
              </div>
          </div>
      )}

      {plan && view === 'PLAN' && (
        <div className="space-y-6 animate-fade-in print:block">
          {/* Detailed Summary Card */}
          <div className="bg-white p-6 rounded-3xl shadow-md border border-emerald-100 print:border-black relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-600"></div>
             
             <div className="flex flex-col md:flex-row gap-8">
                 {/* Macro Chart / Summary */}
                 <div className="flex-1">
                     <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                         <PieChart className="text-emerald-600" /> Resumo Nutricional Diário
                     </h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                         <div className="bg-orange-50 p-4 rounded-2xl text-center">
                             <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Calorias</p>
                             <p className="text-2xl font-black text-gray-800">{plan.totalCalories} <span className="text-sm font-medium text-gray-500">kcal</span></p>
                         </div>
                         <div className="bg-blue-50 p-4 rounded-2xl text-center">
                             <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Proteína</p>
                             <p className="text-2xl font-black text-gray-800">{plan.totalMacros?.p || 0}<span className="text-sm font-medium text-gray-500">g</span></p>
                         </div>
                         <div className="bg-yellow-50 p-4 rounded-2xl text-center">
                             <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider">Carboidratos</p>
                             <p className="text-2xl font-black text-gray-800">{plan.totalMacros?.c || 0}<span className="text-sm font-medium text-gray-500">g</span></p>
                         </div>
                         <div className="bg-rose-50 p-4 rounded-2xl text-center">
                             <p className="text-xs text-rose-600 font-bold uppercase tracking-wider">Gorduras</p>
                             <p className="text-2xl font-black text-gray-800">{plan.totalMacros?.f || 0}<span className="text-sm font-medium text-gray-500">g</span></p>
                         </div>
                     </div>
                 </div>

                 {/* Micronutrients */}
                 <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                     <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                         <Info className="text-marsala-500" /> Vitaminas e Minerais
                     </h3>
                     {plan.micronutrients && plan.micronutrients.length > 0 ? (
                         <div className="flex flex-wrap gap-2">
                             {plan.micronutrients.map((micro, idx) => (
                                 <span key={idx} className="bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200">
                                     {micro}
                                 </span>
                             ))}
                         </div>
                     ) : (
                         <p className="text-gray-400 text-sm italic">Informações de micronutrientes não disponíveis.</p>
                     )}
                     <div className="mt-4 p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 border border-emerald-100">
                         <strong>Nota:</strong> Valores estimados baseados na composição média dos alimentos.
                     </div>
                 </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedMeals.breakfast && <MealCard icon={<Coffee className="text-orange-500" />} title="Café da Manhã" section={plan.breakfast} />}
            {selectedMeals.lunch && <MealCard icon={<Sun className="text-yellow-500" />} title="Almoço" section={plan.lunch} />}
            {selectedMeals.preWorkout && <MealCard icon={<Dumbbell className="text-purple-500" />} title="Pré-treino" section={plan.preWorkout} />}
            {selectedMeals.postWorkout && <MealCard icon={<Zap className="text-red-500" />} title="Pós-treino" section={plan.postWorkout} />}
            {selectedMeals.snack && <MealCard icon={<Sunset className="text-rose-500" />} title="Lanche da Tarde" section={plan.snack} />}
            {selectedMeals.dinner && <MealCard icon={<Moon className="text-indigo-500" />} title="Jantar" section={plan.dinner} />}
          </div>
          
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-4 print:break-before-auto">
            <h3 className="font-bold text-blue-800 flex items-center gap-2 mb-3">
              <Lightbulb size={20} /> Dicas Nutricionais
            </h3>
            <ul className="list-disc list-inside space-y-2 text-blue-900">
              {plan.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {plan && view === 'SHOPPING' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden animate-fade-in print:p-0 print:shadow-none print:border-none">
              {/* Watermark for Print/Display */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                  <div className="text-[200px] font-bold text-gray-900 rotate-[-30deg]">DietBraga</div>
              </div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6 print:border-black">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                            <ShoppingCart className="text-emerald-600" /> Lista de Compras
                        </h2>
                        <p className="text-gray-500 mt-1">Baseada no seu plano alimentar personalizado.</p>
                    </div>
                    <button onClick={handlePrint} className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition-colors print:hidden">
                        <Printer size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.shoppingList.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 print:bg-transparent print:border-b print:border-gray-200 print:rounded-none">
                            <div className="h-5 w-5 rounded border border-emerald-400 flex items-center justify-center print:border-black"></div>
                            <span className="font-medium text-gray-700">{item}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center text-sm text-gray-400 print:mt-12">
                    Gerado automaticamente por Diet Braga • {new Date().toLocaleDateString()}
                </div>
              </div>
          </div>
      )}
    </div>
  );
};

const MealCard: React.FC<{ icon: React.ReactNode; title: string; section: MealSection }> = ({ icon, title, section }) => {
    // If section is empty or zero calories (and wasn't selected or AI didn't generate), hide it
    if (!section || (section.options && section.options.length === 0)) return null;

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow group print:break-inside-avoid print:border-black">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-emerald-50 transition-colors print:hidden">
                        {icon}
                    </div>
                    <h3 className="font-bold text-gray-800">{title}</h3>
                </div>
                <div className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                    ~{section.calories} kcal
                </div>
            </div>
            
            <div className="flex-1 space-y-3">
                {section.options?.map((opt, i) => (
                    <div key={i} className="flex gap-2 items-start text-sm text-gray-600 p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <ArrowRight size={14} className="mt-0.5 text-emerald-500 shrink-0" />
                    <span>{opt}</span>
                    </div>
                ))}
            </div>

            {section.macros && (
                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between text-[10px] text-gray-500 uppercase font-bold">
                    <span>P: {section.macros.p}g</span>
                    <span>C: {section.macros.c}g</span>
                    <span>G: {section.macros.f}g</span>
                </div>
            )}
        </div>
    );
};

export default MealPlanner;