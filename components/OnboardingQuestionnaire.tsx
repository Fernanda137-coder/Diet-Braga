import React, { useState, useRef } from 'react';
import { Patient, Gender } from '../types';
import { ChevronRight, ChevronLeft, Check, HeartPulse, Scale, Utensils, AlertCircle, Dumbbell, User, Camera, ArrowRight, Activity } from 'lucide-react';

interface OnboardingQuestionnaireProps {
  patient: Patient;
  onComplete: (updatedData: Partial<Patient>) => void;
}

const COMMON_PATHOLOGIES = [
  "Diabetes", "Hipertensão", "Gastrite", "Intolerância à Lactose", "Colesterol Alto", "Hipotireoidismo", "Síndrome do Intestino Irritável"
];

const DIET_TYPES = [
  'Balanceada', 'Low Carb', 'Cetogênica', 'Vegetariana', 'Vegana', 'Jejum Intermitente'
];

const TRAINING_TYPES = [
  'Musculação', 'Crossfit', 'Corrida', 'Natação', 'Pilates/Yoga', 'Funcional', 'Artes Marciais', 'Esportes Coletivos'
];

// Expanded Categories for selection
const FOOD_CATEGORIES = [
  { 
    category: "Proteínas", 
    items: ["Frango", "Carne Vermelha", "Peixe Branco", "Salmão/Atum", "Ovos", "Tofu", "Porco", "Camarão", "Whey Protein", "Iogurte Proteico"] 
  },
  { 
    category: "Carboidratos", 
    items: ["Arroz Branco", "Arroz Integral", "Batata Doce", "Batata Inglesa", "Macarrão", "Aveia", "Pão Integral", "Pão Francês", "Tapioca", "Cuscuz"] 
  },
  { 
    category: "Leguminosas", 
    items: ["Feijão Preto", "Feijão Carioca", "Lentilha", "Grão de Bico", "Ervilha", "Soja"] 
  },
  { 
    category: "Vegetais", 
    items: ["Brócolis", "Cenoura", "Alface/Folhas", "Tomate", "Abobrinha", "Berinjela", "Espinafre", "Couve", "Beterraba", "Pepino"] 
  },
  { 
    category: "Frutas", 
    items: ["Banana", "Maçã", "Uva", "Melancia", "Melão", "Morango", "Abacate", "Laranja/Limão", "Manga", "Abacaxi"] 
  },
  { 
    category: "Gorduras & Laticínios", 
    items: ["Azeite de Oliva", "Manteiga", "Castanhas/Nozes", "Pasta de Amendoim", "Leite", "Queijo Branco", "Queijo Amarelo", "Requeijão"] 
  },
  { 
    category: "Bebidas & Extras", 
    items: ["Café", "Chá", "Suco Natural", "Refrigerante Zero", "Chocolate Amargo", "Mel", "Adoçante"] 
  }
];

const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({ patient, onComplete }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Patient>>({
    ...patient,
    measurements: patient.measurements || {
        shoulder: 0, chest: 0, waist: 0, abdomen: 0, hips: 0,
        armRight: 0, armLeft: 0, forearmRight: 0, forearmLeft: 0,
        thighRight: 0, thighLeft: 0, calfRight: 0, calfLeft: 0
    },
    preferences: patient.preferences || {
        dietType: 'Balanceada',
        favoriteFoods: [],
        dislikedFoods: [],
        mealsPerDay: 4,
        waterIntakeGoal: 2000,
        calorieGoal: patient.preferences?.calorieGoal,
        trainingFrequency: 0,
        trainingType: ''
    }
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const togglePathology = (p: string) => {
    const current = formData.pathologies || [];
    const updated = current.includes(p) ? current.filter(i => i !== p) : [...current, p];
    setFormData({ ...formData, pathologies: updated });
  };

  const handleFinish = () => {
    onComplete({ ...formData, onboardingCompleted: true });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, photoUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  const toggleFoodPreference = (food: string, type: 'FAV' | 'DISLIKE') => {
      const prefs = formData.preferences!;
      let newFavs = [...prefs.favoriteFoods];
      let newDislikes = [...prefs.dislikedFoods];

      if (type === 'FAV') {
          if (newFavs.includes(food)) newFavs = newFavs.filter(f => f !== food);
          else {
              newFavs.push(food);
              newDislikes = newDislikes.filter(f => f !== food); // Remove from dislikes if added to favs
          }
      } else {
          if (newDislikes.includes(food)) newDislikes = newDislikes.filter(f => f !== food);
          else {
              newDislikes.push(food);
              newFavs = newFavs.filter(f => f !== food); // Remove from favs if added to dislikes
          }
      }

      setFormData({
          ...formData,
          preferences: { ...prefs, favoriteFoods: newFavs, dislikedFoods: newDislikes }
      });
  };

  // Background Image based on step for dynamic feel
  const getBackgroundImage = () => {
      switch(step) {
          case 1: return "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"; // Gym/Profile
          case 2: return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"; // Workout
          case 3: return "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=2070&auto=format&fit=crop"; // Health
          case 4: return "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop"; // Diet
          case 5: return "https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop"; // Food
          default: return "";
      }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden transition-all duration-700">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out opacity-40 scale-105"
        style={{ backgroundImage: `url('${getBackgroundImage()}')` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900/90 to-emerald-900/80 backdrop-blur-sm"></div>

      <div className="bg-white/95 backdrop-blur-xl w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh] relative z-10 border border-white/20 animate-slide-up">
        
        {/* Header Progress */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">{step}</span>
                    Configuração Inicial
                </h1>
                <p className="text-gray-500 text-sm ml-10">Vamos personalizar sua experiência.</p>
            </div>
            <div className="flex gap-1">
                {Array.from({ length: totalSteps }).map((_, i) => (
                    <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${i + 1 <= step ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                ))}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            
            {/* STEP 1: Profile & Bio */}
            {step === 1 && (
                <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                    <div className="text-center">
                        <div 
                            className="relative w-32 h-32 mx-auto mb-4 cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={`w-full h-full rounded-full border-4 border-emerald-100 shadow-xl overflow-hidden flex items-center justify-center bg-gray-50 group-hover:border-emerald-300 transition-all ${!formData.photoUrl && 'animate-pulse'}`}>
                                {formData.photoUrl ? (
                                    <img src={formData.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={48} className="text-emerald-200" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-emerald-700 transition-colors">
                                <Camera size={18} />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handlePhotoUpload} 
                                accept="image/*" 
                                className="hidden" 
                            />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Olá, {patient.name.split(' ')[0]}!</h3>
                        <p className="text-gray-500">Adicione uma foto para o seu perfil ficar completo.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Idade</label>
                            <input type="number" className="w-full border-gray-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.age} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Gênero</label>
                            <select className="w-full border-gray-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})}>
                                <option value={Gender.MALE}>Masculino</option>
                                <option value={Gender.FEMALE}>Feminino</option>
                                <option value={Gender.OTHER}>Outro</option>
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Peso Atual (kg)</label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input type="number" className="w-full pl-10 border-gray-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Altura (cm)</label>
                            <div className="relative">
                                <Activity className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input type="number" className="w-full pl-10 border-gray-200 bg-white rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg" value={formData.height} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: Workout Routine */}
            {step === 2 && (
                <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-600">
                            <Dumbbell size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Rotina de Treinos</h2>
                        <p className="text-gray-500">Para calcularmos seu gasto calórico corretamente.</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-lg font-bold text-gray-700 mb-4 text-center">Quantas vezes você treina por semana?</label>
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <span className="text-gray-400 font-bold text-sm">Sedentário</span>
                                <input 
                                    type="range" min="0" max="7" step="1" 
                                    className="w-full mx-4 accent-purple-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    value={formData.preferences?.trainingFrequency || 0}
                                    onChange={e => setFormData({
                                        ...formData, 
                                        preferences: { ...formData.preferences!, trainingFrequency: parseInt(e.target.value) }
                                    })}
                                />
                                <span className="text-purple-600 font-black text-xl w-8 text-center">{formData.preferences?.trainingFrequency}x</span>
                            </div>
                        </div>

                        {(formData.preferences?.trainingFrequency || 0) > 0 && (
                            <div className="animate-fade-in">
                                <label className="block text-lg font-bold text-gray-700 mb-4">Qual sua modalidade principal?</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {TRAINING_TYPES.map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({
                                                ...formData,
                                                preferences: { ...formData.preferences!, trainingType: type }
                                            })}
                                            className={`py-3 px-2 rounded-xl text-sm font-bold border-2 transition-all ${
                                                formData.preferences?.trainingType === type
                                                ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                                                : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 3: Health & Objectives */}
            {step === 3 && (
                <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600">
                            <HeartPulse size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Saúde e Objetivos</h2>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Qual seu objetivo principal?</label>
                            <select className="w-full border-gray-200 bg-gray-50 rounded-xl p-4 font-medium text-gray-700 focus:ring-2 focus:ring-rose-500 outline-none" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})}>
                                <option value="Emagrecimento">Emagrecimento (Perder Gordura)</option>
                                <option value="Hipertrofia">Hipertrofia (Ganhar Músculo)</option>
                                <option value="Manutenção">Manutenção e Saúde</option>
                                <option value="Performance">Performance Esportiva</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Possui alguma condição de saúde?</label>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_PATHOLOGIES.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => togglePathology(p)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                                            formData.pathologies?.includes(p) 
                                            ? 'bg-rose-500 text-white border-rose-500 shadow-md transform scale-105' 
                                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-rose-200'
                                        }`}
                                    >
                                        {formData.pathologies?.includes(p) && <Check size={12} className="inline mr-1"/>}
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                             <label className="block text-sm font-bold text-gray-700 mb-2">Alergias Alimentares (Opcional)</label>
                             <input type="text" placeholder="Ex: Camarão, Amendoim..." className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-rose-500 outline-none" value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})} />
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: Diet Config */}
            {step === 4 && (
                <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600">
                            <Utensils size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Preferências da Dieta</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3">Estilo de Alimentação</label>
                            <div className="grid grid-cols-2 gap-3">
                                {DIET_TYPES.map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFormData({...formData, preferences: { ...formData.preferences!, dietType: t }})}
                                        className={`py-3 px-4 rounded-xl text-sm font-bold border transition-all text-left flex justify-between items-center ${
                                            formData.preferences?.dietType === t
                                            ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                        }`}
                                    >
                                        {t}
                                        {formData.preferences?.dietType === t && <Check size={16} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                            <label className="block text-sm font-bold text-gray-700 mb-4">Quantas refeições você prefere fazer por dia?</label>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 font-bold">2</span>
                                <input 
                                    type="range" min="2" max="6" step="1" 
                                    className="w-full mx-4 accent-orange-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    value={formData.preferences?.mealsPerDay}
                                    onChange={e => setFormData({
                                        ...formData, 
                                        preferences: { ...formData.preferences!, mealsPerDay: parseInt(e.target.value) }
                                    })}
                                />
                                <span className="bg-orange-500 text-white font-bold w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
                                    {formData.preferences?.mealsPerDay}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 5: Food Selection (Expanded & Visual) */}
            {step === 5 && (
                <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">O que você gosta de comer?</h2>
                        <p className="text-sm text-gray-500 mt-2">
                            Toque 1x para <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Amar</span>, 
                            2x para <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">Evitar</span>.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {FOOD_CATEGORIES.map((cat, idx) => (
                            <div key={idx} className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                                    {cat.category}
                                </h4>
                                <div className="flex flex-wrap gap-2.5">
                                    {cat.items.map(item => {
                                        const isFav = formData.preferences?.favoriteFoods.includes(item);
                                        const isDislike = formData.preferences?.dislikedFoods.includes(item);

                                        return (
                                            <button
                                                key={item}
                                                onClick={() => {
                                                    if (isFav) toggleFoodPreference(item, 'DISLIKE');
                                                    else if (isDislike) {
                                                        const p = formData.preferences!;
                                                        setFormData({
                                                            ...formData,
                                                            preferences: {
                                                                ...p,
                                                                favoriteFoods: p.favoriteFoods.filter(f => f !== item),
                                                                dislikedFoods: p.dislikedFoods.filter(f => f !== item)
                                                            }
                                                        })
                                                    } else {
                                                        toggleFoodPreference(item, 'FAV');
                                                    }
                                                }}
                                                className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all transform active:scale-95 ${
                                                    isFav 
                                                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-sm' 
                                                        : isDislike 
                                                            ? 'bg-rose-50 border-rose-400 text-rose-700 line-through decoration-rose-500 opacity-80'
                                                            : 'bg-white border-transparent text-gray-600 hover:border-gray-200 shadow-sm'
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
                </div>
            )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 bg-white/80 backdrop-blur-md border-t border-gray-100 flex justify-between items-center relative z-20">
            <button 
                onClick={prevStep} 
                disabled={step === 1}
                className="px-6 py-3 rounded-2xl text-gray-500 font-bold hover:bg-gray-100 disabled:opacity-30 transition-colors flex items-center gap-2"
            >
                <ChevronLeft size={20} /> Voltar
            </button>
            
            {step < totalSteps ? (
                <button 
                    onClick={nextStep}
                    className="px-8 py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all flex items-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                    Próximo <ArrowRight size={20} />
                </button>
            ) : (
                <button 
                    onClick={handleFinish}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-3 shadow-xl shadow-emerald-200 hover:shadow-2xl hover:-translate-y-1 animate-pulse-slow"
                >
                    <Check size={20} /> Concluir Setup
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingQuestionnaire;