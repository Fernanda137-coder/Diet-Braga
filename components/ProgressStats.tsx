import React from 'react';
import { Patient, FoodEntry, WorkoutSession } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Dumbbell, Calendar, CheckCircle } from 'lucide-react';

interface ProgressStatsProps {
  patient: Patient;
  foodLogs: FoodEntry[];
  workoutLogs?: WorkoutSession[]; // Add workout logs prop
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ patient, foodLogs, workoutLogs = [] }) => {
  // Aggregate daily macros
  const dailyMacros = foodLogs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (!acc[date]) {
      acc[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    acc[date].calories += log.nutrients.calories;
    acc[date].protein += log.nutrients.protein;
    acc[date].carbs += log.nutrients.carbs;
    acc[date].fat += log.nutrients.fat;
    return acc;
  }, {} as Record<string, any>);

  const macroData = Object.values(dailyMacros).slice(-7); // Last 7 active days
  const weightData = patient.history.map(h => ({
    date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    weight: h.weight
  }));

  // Filter workouts for this patient
  const patientWorkouts = workoutLogs.filter(w => w.patientId === patient.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Evolução de Peso (kg)</h3>
            <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#059669" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#059669", strokeWidth: 2, stroke: "#fff" }} 
                    activeDot={{ r: 6 }} 
                />
                </LineChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* Calories Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Consumo Calórico Diário</h3>
            <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="calories" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* Macros Distribution Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Distribuição de Macronutrientes (Últimos dias)</h3>
            <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" />
                <Bar dataKey="protein" name="Proteínas" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={40} />
                <Bar dataKey="carbs" name="Carboidratos" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} barSize={40} />
                <Bar dataKey="fat" name="Gorduras" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>
        </div>

        {/* WORKOUT HISTORY SECTION (Visible to Nutri) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Dumbbell className="text-purple-600"/> Histórico de Treinos do Paciente
            </h3>
            {patientWorkouts.length === 0 ? (
                <p className="text-gray-500 italic">Nenhum treino registrado por este paciente.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {patientWorkouts.map(workout => (
                        <div key={workout.id} className="border border-purple-100 bg-purple-50/30 p-4 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-purple-400"/>
                                    <span className="font-bold text-gray-700">{new Date(workout.date).toLocaleDateString()}</span>
                                </div>
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded font-bold">{workout.type}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-3 uppercase font-semibold tracking-wide">Intensidade: {workout.intensity}</p>
                            <div className="space-y-1">
                                {workout.exercises.map((ex, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                        <CheckCircle size={12} className="text-green-500" />
                                        <span>{ex.name} <span className="text-gray-400 text-xs">({ex.sets}x{ex.reps})</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default ProgressStats;