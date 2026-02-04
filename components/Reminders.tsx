import React, { useState } from 'react';
import { Reminder } from '../types';
import { Bell, Droplets, Pill, Utensils, Calendar, Plus, Trash2, CheckSquare, Square } from 'lucide-react';

interface RemindersProps {
  reminders: Reminder[];
  onAddReminder: (rem: Reminder) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
}

const Reminders: React.FC<RemindersProps> = ({ reminders, onAddReminder, onToggleReminder, onDeleteReminder }) => {
  const [showForm, setShowForm] = useState(false);
  const [newRem, setNewRem] = useState<Partial<Reminder>>({
    title: '',
    message: '',
    time: '08:00',
    type: 'OTHER'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRem.title && newRem.time) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: newRem.title!,
        message: newRem.message || '',
        time: newRem.time!,
        type: (newRem.type as any) || 'OTHER',
        active: true
      };
      onAddReminder(reminder);
      setShowForm(false);
      setNewRem({ title: '', message: '', time: '08:00', type: 'OTHER' });
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'WATER': return <Droplets className="text-blue-500" />;
      case 'MEDICATION': return <Pill className="text-rose-500" />;
      case 'MEAL': return <Utensils className="text-orange-500" />;
      case 'CONSULTATION': return <Calendar className="text-emerald-500" />;
      default: return <Bell className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Lembretes e Notificações</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus size={18} /> Criar Lembrete
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="font-semibold mb-4 text-gray-700">Novo Lembrete</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Ex: Beber Água"
                value={newRem.title}
                onChange={(e) => setNewRem({ ...newRem, title: e.target.value })}
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={newRem.type}
                onChange={(e) => setNewRem({ ...newRem, type: e.target.value as any })}
              >
                <option value="OTHER">Geral</option>
                <option value="WATER">Hidratação</option>
                <option value="MEAL">Refeição</option>
                <option value="MEDICATION">Medicação</option>
                <option value="CONSULTATION">Consulta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <input
                type="time"
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newRem.time}
                onChange={(e) => setNewRem({ ...newRem, time: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensagem (Opcional)</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Detalhes adicionais..."
                value={newRem.message}
                onChange={(e) => setNewRem({ ...newRem, message: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {reminders.length === 0 ? (
           <div className="p-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">
             <Bell className="mx-auto mb-3 text-gray-300" size={48} />
             <p>Você não tem lembretes ativos.</p>
          </div>
        ) : (
          reminders.map((rem) => (
            <div key={rem.id} className={`flex items-center p-4 bg-white rounded-xl shadow-sm border transition-all ${rem.active ? 'border-gray-100' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
              <button 
                onClick={() => onToggleReminder(rem.id)}
                className={`mr-4 ${rem.active ? 'text-emerald-500' : 'text-gray-400'}`}
              >
                {rem.active ? <CheckSquare size={24} /> : <Square size={24} />}
              </button>
              
              <div className="p-2 bg-gray-50 rounded-lg mr-4">
                {getIcon(rem.type)}
              </div>

              <div className="flex-1">
                <h4 className={`font-semibold ${rem.active ? 'text-gray-800' : 'text-gray-500 line-through'}`}>{rem.title}</h4>
                <p className="text-sm text-gray-500">{rem.time} • {rem.message}</p>
              </div>

              <button 
                onClick={() => onDeleteReminder(rem.id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Reminders;