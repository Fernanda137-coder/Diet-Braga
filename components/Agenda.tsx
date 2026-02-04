import React, { useState } from 'react';
import { Appointment, Patient } from '../types';
import { CalendarDays, Clock, CheckCircle, XCircle, Plus, Video, Calendar as CalendarIcon, List } from 'lucide-react';

interface AgendaProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (apt: Appointment) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

const Agenda: React.FC<AgendaProps> = ({ appointments, patients, onAddAppointment, onUpdateStatus }) => {
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'LIST'>('CALENDAR');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [newApt, setNewApt] = useState<Partial<Appointment>>({
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    type: 'Primeira Consulta',
    videoUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newApt.patientId && newApt.date && newApt.time) {
      const patient = patients.find(p => p.id === newApt.patientId);
      const appointment: Appointment = {
        id: Date.now().toString(),
        patientId: newApt.patientId!,
        patientName: patient?.name || 'Desconhecido',
        date: newApt.date!,
        time: newApt.time!,
        type: newApt.type || 'Consulta',
        status: 'PENDING',
        videoUrl: newApt.videoUrl
      };
      onAddAppointment(appointment);
      setShowForm(false);
      setNewApt({ date: new Date().toISOString().split('T')[0], time: '09:00', type: 'Primeira Consulta', videoUrl: '' });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-emerald-100 text-emerald-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'CONFIRMED': return 'Confirmado';
      case 'COMPLETED': return 'Realizado';
      case 'CANCELLED': return 'Cancelado';
      default: return 'Pendente';
    }
  };

  // Sort by date/time
  const sortedAppointments = [...appointments].sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });

  // Calendar Helpers
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
      const today = new Date(selectedDate);
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = getDaysInMonth(year, month);
      const firstDay = getFirstDayOfMonth(year, month);
      
      const days = [];
      // Empty cells for days before the 1st
      for (let i = 0; i < firstDay; i++) {
          days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 border border-gray-100"></div>);
      }

      for (let d = 1; d <= daysInMonth; d++) {
          const dateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const dailyAppointments = appointments.filter(a => a.date === dateStr);
          
          days.push(
              <div 
                key={d} 
                className={`h-24 border border-gray-100 p-2 relative hover:bg-gray-50 transition-colors cursor-pointer ${dateStr === selectedDate ? 'bg-emerald-50/50' : 'bg-white'}`}
                onClick={() => setSelectedDate(dateStr)}
              >
                  <span className={`text-sm font-bold ${dateStr === new Date().toISOString().split('T')[0] ? 'bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>{d}</span>
                  <div className="mt-1 space-y-1 overflow-y-auto max-h-[60px] custom-scrollbar">
                      {dailyAppointments.map(apt => (
                          <div key={apt.id} className={`text-[10px] truncate px-1.5 py-0.5 rounded ${getStatusColor(apt.status)}`}>
                              {apt.time} {apt.patientName}
                          </div>
                      ))}
                  </div>
              </div>
          );
      }
      return days;
  };

  const filteredByDate = appointments.filter(a => a.date === selectedDate);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Agenda de Consultas</h2>
        <div className="flex gap-2">
            <div className="bg-gray-100 p-1 rounded-lg flex">
                <button onClick={() => setViewMode('CALENDAR')} className={`p-2 rounded-md transition-all ${viewMode === 'CALENDAR' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}><CalendarIcon size={18}/></button>
                <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-md transition-all ${viewMode === 'LIST' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500'}`}><List size={18}/></button>
            </div>
            <button
            onClick={() => setShowForm(!showForm)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
            <Plus size={18} /> Nova Consulta
            </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
          <h3 className="font-semibold mb-4 text-gray-700">Agendar Horário</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Paciente</label>
              <select
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={newApt.patientId || ''}
                onChange={(e) => setNewApt({ ...newApt, patientId: e.target.value })}
              >
                <option value="">Selecione um paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newApt.date}
                onChange={(e) => setNewApt({ ...newApt, date: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <input
                type="time"
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={newApt.time}
                onChange={(e) => setNewApt({ ...newApt, time: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Consulta</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={newApt.type}
                onChange={(e) => setNewApt({ ...newApt, type: e.target.value })}
              >
                <option value="Primeira Consulta">Primeira Consulta</option>
                <option value="Retorno">Retorno</option>
                <option value="Bioimpedância">Bioimpedância</option>
                <option value="Online">Atendimento Online</option>
              </select>
            </div>

            {newApt.type === 'Online' && (
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Link da Videochamada (Meet, Zoom)</label>
                 <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={newApt.videoUrl}
                  onChange={(e) => setNewApt({ ...newApt, videoUrl: e.target.value })}
                />
              </div>
            )}

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
                Agendar
              </button>
            </div>
          </form>
        </div>
      )}

      {viewMode === 'CALENDAR' ? (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
              <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Calendar Header */}
                  <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800 capitalize">
                          {new Date(selectedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2">
                          <button onClick={() => {
                              const d = new Date(selectedDate);
                              d.setMonth(d.getMonth() - 1);
                              setSelectedDate(d.toISOString().split('T')[0]);
                          }} className="p-1 hover:bg-gray-200 rounded text-gray-600">{"<"}</button>
                          <button onClick={() => {
                              const d = new Date(selectedDate);
                              d.setMonth(d.getMonth() + 1);
                              setSelectedDate(d.toISOString().split('T')[0]);
                          }} className="p-1 hover:bg-gray-200 rounded text-gray-600">{">"}</button>
                      </div>
                  </div>
                  {/* Grid */}
                  <div className="grid grid-cols-7 text-center bg-gray-50 border-b border-gray-100">
                      {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(day => (
                          <div key={day} className="py-2 text-xs font-bold text-gray-500 uppercase">{day}</div>
                      ))}
                  </div>
                  <div className="grid grid-cols-7 auto-rows-fr">
                      {renderCalendar()}
                  </div>
              </div>

              {/* Selected Day Details */}
              <div className="w-full lg:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col">
                  <h4 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                      {new Date(selectedDate).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h4>
                  <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                      {filteredByDate.length === 0 ? (
                          <div className="text-center text-gray-400 py-10">
                              <CalendarIcon className="mx-auto mb-2 opacity-30" size={32}/>
                              <p className="text-sm">Sem consultas.</p>
                          </div>
                      ) : (
                          filteredByDate.map(apt => (
                              <div key={apt.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                  <div className="flex justify-between items-start mb-1">
                                      <span className="font-bold text-emerald-600 text-sm">{apt.time}</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                                  </div>
                                  <p className="font-bold text-gray-800 text-sm">{apt.patientName}</p>
                                  <p className="text-xs text-gray-500">{apt.type}</p>
                                  {apt.videoUrl && <a href={apt.videoUrl} target="_blank" className="block mt-2 text-xs text-emerald-600 hover:underline">Link da chamada</a>}
                              </div>
                          ))
                      )}
                  </div>
              </div>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedAppointments.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-100">
                <CalendarDays className="mx-auto mb-3 text-gray-300" size={48} />
                <p>Nenhuma consulta agendada.</p>
            </div>
            ) : (
            sortedAppointments.map((apt) => (
                <div key={apt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between h-full">
                <div>
                    <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                        <CalendarDays size={16} />
                        {new Date(apt.date).toLocaleDateString('pt-BR')}
                        <span className="mx-1">•</span>
                        <Clock size={16} />
                        {apt.time}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(apt.status)}`}>
                        {getStatusLabel(apt.status)}
                    </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-1">{apt.patientName}</h3>
                    <p className="text-sm text-gray-600 mb-4">{apt.type}</p>

                    {apt.videoUrl && apt.status !== 'CANCELLED' && (
                    <a 
                        href={apt.videoUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="mb-4 flex items-center justify-center gap-2 w-full bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors border border-emerald-100"
                    >
                        <Video size={16} />
                        Entrar na Chamada
                    </a>
                    )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                    {apt.status === 'PENDING' && (
                    <button 
                        onClick={() => onUpdateStatus(apt.id, 'CONFIRMED')}
                        className="flex-1 bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 flex items-center justify-center gap-1"
                    >
                        <CheckCircle size={16} /> Confirmar
                    </button>
                    )}
                    {apt.status === 'CONFIRMED' && (
                    <button 
                        onClick={() => onUpdateStatus(apt.id, 'COMPLETED')}
                        className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center justify-center gap-1"
                    >
                        <CheckCircle size={16} /> Concluir
                    </button>
                    )}
                    {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
                    <button 
                        onClick={() => onUpdateStatus(apt.id, 'CANCELLED')}
                        className="flex-none px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center"
                        title="Cancelar"
                    >
                        <XCircle size={18} />
                    </button>
                    )}
                </div>
                </div>
            ))
            )}
        </div>
      )}
    </div>
  );
};

export default Agenda;