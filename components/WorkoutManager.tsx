import React, { useState } from 'react';
import { WorkoutSession, Exercise } from '../types';
import { Dumbbell, Plus, Sparkles, CheckCircle, PlayCircle, Loader2, Calendar, Trash2, RefreshCcw, ChevronDown, ChevronUp, Lightbulb, Video, Lock } from 'lucide-react';
import { generateWorkoutPlan, generateReplacementExercise } from '../services/geminiService';

interface WorkoutManagerProps {
  patientId: string;
  onSaveWorkout: (workout: WorkoutSession) => void;
  onDeleteWorkout: (id: string) => void;
  history: WorkoutSession[];
  isPremium?: boolean; // New prop
}

// Usando Pollinations AI para gerar imagens mais específicas do exercício
const getImage = (keyword: string) => `https://image.pollinations.ai/prompt/gym%20workout%20exercise%20${encodeURIComponent(keyword)}%20realistic%204k%20fitness?width=300&height=300&nologo=true`;

interface ExerciseCardProps {
    ex: Exercise;
    index: number;
    allowReplace?: boolean;
    replacingIndex?: number | null;
    onReplace?: (index: number) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ ex, index, allowReplace = false, replacingIndex, onReplace }) => {
    const [expanded, setExpanded] = useState(false);
    const isReplacing = replacingIndex === index;

    // Função para abrir vídeo no YouTube
    const handleVideoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`https://www.youtube.com/results?search_query=como+fazer+${encodeURIComponent(ex.name)}+execução+correta`, '_blank');
    }

    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group/card">
          <div className="flex items-start gap-4 p-4">
            {/* Thumbnail / Video Trigger */}
            <div 
                className="h-24 w-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative group cursor-pointer shadow-inner border border-gray-200"
                onClick={handleVideoClick}
                title="Clique para ver vídeo da execução"
            >
                {isReplacing ? (
                    <div className="h-full w-full flex items-center justify-center bg-gray-50">
                        <Loader2 className="animate-spin text-purple-600" />
                    </div>
                ) : (
                    <>
                        <img 
                            src={getImage(ex.imageKeyword || ex.name)} 
                            alt={ex.name} 
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&fit=crop' }}
                        />
                        {/* Overlay de Play */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors backdrop-blur-[1px]">
                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                <PlayCircle className="text-purple-600 ml-1" size={20} fill="currentColor" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 text-center">
                            <p className="text-[10px] text-white font-bold flex items-center justify-center gap-1">
                                <Video size={10} /> Ver Vídeo
                            </p>
                        </div>
                    </>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-gray-800 text-lg leading-tight mb-1">{ex.name}</h4>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                                {ex.sets} séries
                            </span>
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                {ex.reps} reps
                            </span>
                        </div>
                    </div>
                    {allowReplace && onReplace && (
                        <button 
                            onClick={() => onReplace(index)}
                            disabled={isReplacing}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                            title="Substituir exercício"
                        >
                            <RefreshCcw size={18} className={isReplacing ? 'animate-spin' : ''} />
                        </button>
                    )}
                </div>
                
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="text-xs flex items-center gap-1 text-gray-500 font-bold hover:text-purple-600 transition-colors"
                >
                    {expanded ? 'Ocultar detalhes' : 'Ver Instruções'}
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>
          </div>
          
          {/* Expanded Details Section */}
          {expanded && (
             <div className="bg-gray-50/50 border-t border-gray-100 p-4 text-sm animate-fade-in space-y-3">
                {ex.instructions && (
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <p className="font-bold text-gray-700 mb-2 flex items-center gap-2 text-xs uppercase tracking-wide">
                             <PlayCircle size={14} className="text-purple-500" /> Execução Técnica
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-gray-600 pl-1 marker:text-purple-500 marker:font-bold">
                            {ex.instructions.map((inst, i) => (
                                <li key={i}>{inst}</li>
                            ))}
                        </ol>
                    </div>
                )}
                {ex.tips && (
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                        <p className="font-bold text-yellow-800 mb-2 flex items-center gap-2 text-xs uppercase tracking-wide">
                             <Lightbulb size={14} fill="currentColor" /> Dica Pro
                        </p>
                         <ul className="space-y-1 text-yellow-900 pl-1">
                            {ex.tips.map((tip, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0"></span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
             </div>
          )}
      </div>
    );
}

const WorkoutManager: React.FC<WorkoutManagerProps> = ({ patientId, onSaveWorkout, onDeleteWorkout, history, isPremium = false }) => {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'AI' | 'HISTORY'>('MANUAL');
  const [loadingAI, setLoadingAI] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);

  // Manual Form State
  const [manualExercises, setManualExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Partial<Exercise>>({ name: '', sets: 3, reps: '10' });
  
  // AI Form State
  const [aiType, setAiType] = useState('Full Body');
  const [aiIntensity, setAiIntensity] = useState('Moderado');
  const [generatedExercises, setGeneratedExercises] = useState<Exercise[]>([]);

  const handleAddManualExercise = () => {
    if (currentExercise.name) {
      setManualExercises([...manualExercises, {
        name: currentExercise.name,
        sets: currentExercise.sets || 3,
        reps: currentExercise.reps || '10',
        imageKeyword: currentExercise.name // Fallback: use name as keyword
      }]);
      setCurrentExercise({ name: '', sets: 3, reps: '10' });
    }
  };

  const handleGenerateAI = async () => {
    setLoadingAI(true);
    try {
        const result = await generateWorkoutPlan(aiType, aiIntensity);
        setGeneratedExercises(result.exercises);
    } catch (e) {
        alert("Erro ao gerar treino.");
    } finally {
        setLoadingAI(false);
    }
  };

  const handleReplaceExercise = async (index: number) => {
    const exerciseToReplace = generatedExercises[index];
    setReplacingIndex(index);
    try {
      const newExercise = await generateReplacementExercise(exerciseToReplace.name, aiType, aiIntensity);
      const updatedExercises = [...generatedExercises];
      updatedExercises[index] = newExercise;
      setGeneratedExercises(updatedExercises);
    } catch (e) {
      alert("Erro ao substituir exercício.");
    } finally {
      setReplacingIndex(null);
    }
  }

  const saveSession = (exercises: Exercise[], type: string, intensity: string) => {
      if (exercises.length === 0) return;
      const session: WorkoutSession = {
          id: Date.now().toString(),
          patientId,
          date: new Date().toISOString(),
          type: type as any,
          intensity: intensity as any,
          exercises,
          completed: true
      };
      onSaveWorkout(session);
      alert("Treino registrado com sucesso!");
      setManualExercises([]);
      setGeneratedExercises([]);
      setActiveTab('HISTORY');
  };

  const handleDeleteHistory = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este treino do histórico?")) {
        onDeleteWorkout(id);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Dumbbell className="text-emerald-600" /> Registro de Treino
                </h2>
                <p className="text-gray-500">Registre suas atividades físicas para que seu nutricionista acompanhe.</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <button onClick={() => setActiveTab('MANUAL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'MANUAL' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}>Manual</button>
                <button 
                    onClick={() => isPremium && setActiveTab('AI')} 
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${activeTab === 'AI' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'} ${!isPremium ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {!isPremium && <Lock size={12} />} IA Generator
                </button>
                <button onClick={() => setActiveTab('HISTORY')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'HISTORY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>Histórico</button>
            </div>
        </header>

        {activeTab === 'MANUAL' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-700 mb-4">Adicionar Exercício</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nome do Exercício</label>
                            <input 
                              type="text" 
                              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                              placeholder="Ex: Supino Reto"
                              value={currentExercise.name}
                              onChange={e => setCurrentExercise({...currentExercise, name: e.target.value})}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Séries</label>
                                <input 
                                  type="number" 
                                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                                  value={currentExercise.sets}
                                  onChange={e => setCurrentExercise({...currentExercise, sets: Number(e.target.value)})}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-600 mb-1">Repetições</label>
                                <input 
                                  type="text" 
                                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none"
                                  placeholder="10-12"
                                  value={currentExercise.reps}
                                  onChange={e => setCurrentExercise({...currentExercise, reps: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        {/* Preview Image */}
                        {currentExercise.name && (
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                                <div className="h-12 w-12 bg-white rounded overflow-hidden border border-gray-100">
                                   <img src={getImage(currentExercise.name)} className="w-full h-full object-cover" alt="Preview"/>
                                </div>
                                <p className="text-xs text-gray-500">Visualização sugerida para "{currentExercise.name}"</p>
                            </div>
                        )}

                        <button 
                          onClick={handleAddManualExercise}
                          disabled={!currentExercise.name}
                          className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Adicionar à Lista
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700">Resumo do Treino</h3>
                    {manualExercises.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-400 border border-dashed border-gray-200">
                            Adicione exercícios para montar seu treino.
                        </div>
                    ) : (
                        manualExercises.map((ex, i) => <ExerciseCard key={i} ex={ex} index={i} />)
                    )}
                    
                    {manualExercises.length > 0 && (
                        <button 
                          onClick={() => saveSession(manualExercises, 'Personalizado', 'Moderado')}
                          className="w-full bg-emerald-800 text-white font-bold py-3 rounded-xl hover:bg-emerald-900 shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={20} /> Finalizar e Registrar Treino
                        </button>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'AI' && (
             <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-3xl border border-purple-100">
                 {!generatedExercises.length ? (
                     <div className="max-w-xl mx-auto text-center space-y-6">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-purple-900">Gerador de Treino IA</h3>
                        <p className="text-purple-700/80">Selecione suas preferências e deixe a inteligência artificial montar sua rotina de hoje.</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-left">
                            <div>
                                <label className="block text-sm font-bold text-purple-800 mb-2">Tipo de Treino</label>
                                <select className="w-full p-3 rounded-xl border-purple-200 focus:ring-purple-500" value={aiType} onChange={e => setAiType(e.target.value)}>
                                    <option>Full Body</option>
                                    <option>Superior (Push)</option>
                                    <option>Superior (Pull)</option>
                                    <option>Inferior (Legs)</option>
                                    <option>Cardio & Core</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-purple-800 mb-2">Intensidade</label>
                                <select className="w-full p-3 rounded-xl border-purple-200 focus:ring-purple-500" value={aiIntensity} onChange={e => setAiIntensity(e.target.value)}>
                                    <option>Leve</option>
                                    <option>Moderado</option>
                                    <option>Intenso</option>
                                </select>
                            </div>
                        </div>

                        <button 
                          onClick={handleGenerateAI}
                          disabled={loadingAI}
                          className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 flex items-center justify-center gap-2 mt-4"
                        >
                            {loadingAI ? <Loader2 className="animate-spin"/> : <Sparkles />}
                            {loadingAI ? 'Gerando...' : 'Gerar Treino'}
                        </button>
                     </div>
                 ) : (
                     <div className="space-y-6">
                         <div className="flex justify-between items-center">
                             <h3 className="text-xl font-bold text-purple-900">Treino Sugerido ({aiType})</h3>
                             <button onClick={() => setGeneratedExercises([])} className="text-sm text-purple-600 hover:underline">Gerar Outro</button>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {generatedExercises.map((ex, i) => <ExerciseCard key={i} ex={ex} index={i} allowReplace={true} replacingIndex={replacingIndex} onReplace={handleReplaceExercise} />)}
                         </div>

                         <button 
                          onClick={() => saveSession(generatedExercises, aiType, aiIntensity)}
                          className="w-full bg-purple-700 text-white font-bold py-4 rounded-xl hover:bg-purple-800 shadow-lg shadow-purple-200 flex items-center justify-center gap-2"
                        >
                            <CheckCircle /> Aceitar e Registrar Treino
                        </button>
                     </div>
                 )}
             </div>
        )}

        {activeTab === 'HISTORY' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b border-gray-100 font-bold text-gray-700 flex items-center gap-2">
                    <Calendar size={18} /> Histórico Recente
                </div>
                <div className="divide-y divide-gray-100">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">Nenhum treino registrado ainda.</div>
                    ) : (
                        history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(session => (
                            <div key={session.id} className="p-4 hover:bg-gray-50 transition-colors group relative">
                                <div className="flex justify-between items-start mb-2 pr-8">
                                    <div>
                                        <span className="font-bold text-gray-800">{session.type}</span>
                                        <span className="text-xs text-gray-500 ml-2">{new Date(session.date).toLocaleDateString()} às {new Date(session.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${session.intensity === 'Intenso' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {session.intensity}
                                    </span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {session.exercises.map((ex, i) => (
                                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                                            {ex.name} ({ex.sets}x{ex.reps})
                                        </span>
                                    ))}
                                </div>
                                
                                {/* Delete Button */}
                                <button 
                                    onClick={() => handleDeleteHistory(session.id)}
                                    className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Excluir treino"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default WorkoutManager;