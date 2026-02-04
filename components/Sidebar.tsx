import React from 'react';
import { ViewState, PaymentStatus } from '../types';
import { LayoutDashboard, Users, Utensils, BookOpen, TrendingUp, Bell, UserCog, LogOut, CalendarDays, ClipboardCheck, Sliders, Lightbulb, Dumbbell, ShoppingCart, CreditCard, Lock, Crown, MessageCircle, ChefHat, DollarSign } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  userType: 'PROFESSIONAL' | 'PATIENT' | null;
  onLogout: () => void;
  patientStatus?: PaymentStatus;
  isPremium?: boolean; // New prop to check premium status properly
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userType, onLogout, patientStatus, isPremium }) => {
  
  const isLocked = (id: string) => {
      if (userType !== 'PATIENT') return false;
      if (isPremium) return false; // Unlock all if premium

      // Features that require PREMIUM (Locked for free users)
      const premiumFeatures = ['PROGRESS']; // Only Progress is locked from navigation, others are open but limited
      return premiumFeatures.includes(id);
  };

  const menuItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'DASHBOARD', label: 'Início', icon: <LayoutDashboard size={20} strokeWidth={1.5} /> },
  ];

  if (userType === 'PROFESSIONAL') {
    menuItems.push(
      { id: 'PATIENTS', label: 'Meus Pacientes', icon: <Users size={20} strokeWidth={1.5} /> },
      { id: 'AGENDA', label: 'Agenda', icon: <CalendarDays size={20} strokeWidth={1.5} /> },
      { id: 'CHAT', label: 'Bate-papo', icon: <MessageCircle size={20} strokeWidth={1.5} /> },
      { id: 'SERVICE_PLANS', label: 'Meus Planos', icon: <DollarSign size={20} strokeWidth={1.5} /> }, // New Item
      { id: 'MEAL_PLAN', label: 'Gerador de Dietas', icon: <BookOpen size={20} strokeWidth={1.5} /> }, // Renamed
      { id: 'FOOD_LOG', label: 'Diário Alimentar', icon: <Utensils size={20} strokeWidth={1.5} /> },
      { id: 'TIPS', label: 'Dicas & IA', icon: <Lightbulb size={20} strokeWidth={1.5} /> },
      { id: 'PROFILE', label: 'Perfil Profissional', icon: <UserCog size={20} strokeWidth={1.5} /> }
    );
  } else if (userType === 'PATIENT') {
    menuItems.push(
      { id: 'PLANS', label: 'Financeiro & Planos', icon: <CreditCard size={20} strokeWidth={1.5} /> },
      { id: 'CHAT', label: 'Falar com Nutri', icon: <MessageCircle size={20} strokeWidth={1.5} /> },
      { id: 'WORKOUTS', label: 'Meus Treinos', icon: <Dumbbell size={20} strokeWidth={1.5} /> },
      { id: 'MEAL_PLAN', label: 'Minha Dieta', icon: <BookOpen size={20} strokeWidth={1.5} /> },
      { id: 'RECIPES', label: 'Minhas Receitas', icon: <ChefHat size={20} strokeWidth={1.5} /> },
      { id: 'SHOPPING_LIST', label: 'Lista de Compras', icon: <ShoppingCart size={20} strokeWidth={1.5} /> },
      { id: 'FOOD_LOG', label: 'Diário Alimentar', icon: <Utensils size={20} strokeWidth={1.5} /> },
      { id: 'PROGRESS', label: 'Meu Progresso', icon: <TrendingUp size={20} strokeWidth={1.5} /> },
      { id: 'MY_RECORD', label: 'Meu Prontuário', icon: <ClipboardCheck size={20} strokeWidth={1.5} /> },
      { id: 'PREFERENCES', label: 'Preferências', icon: <Sliders size={20} strokeWidth={1.5} /> },
      { id: 'TIPS', label: 'Dicas de Saúde', icon: <Lightbulb size={20} strokeWidth={1.5} /> },
      { id: 'PROFILE', label: 'Minha Conta', icon: <UserCog size={20} strokeWidth={1.5} /> }
    );
  }

  return (
    <aside className="w-72 h-screen fixed left-0 top-0 hidden md:flex flex-col z-20 bg-emerald-900 border-r border-emerald-800 shadow-xl print:hidden text-white">
      
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-6">
          {/* Logo Box - White Background with Marsala Icon */}
          <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-black/20 shrink-0">
             <span className="text-marsala-600 font-bold text-lg">DB</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">Diet Braga</h1>
            <p className="text-[10px] text-emerald-300 font-semibold tracking-wider uppercase mt-1">
              {userType === 'PROFESSIONAL' ? 'Área do Nutri' : 'Área do Paciente'}
            </p>
          </div>
        </div>
        
        {userType === 'PATIENT' && isPremium && (
            <div className="bg-emerald-800/50 rounded-xl p-3 flex items-center gap-3 border border-emerald-700/50">
                <div className="p-1.5 bg-yellow-400/20 rounded-lg">
                    <Crown size={16} className="text-yellow-400" fill="currentColor" />
                </div>
                <div>
                    <p className="text-xs font-bold text-white uppercase tracking-wide">Versão Premium</p>
                    <p className="text-[10px] text-emerald-300">Acesso Total Liberado</p>
                </div>
            </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 space-y-1">
        <nav>
          {menuItems.map((item) => {
            const locked = isLocked(item.id);
            const isActive = currentView === item.id;
            return (
                <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 font-medium group mb-1 ${
                    isActive
                    ? 'bg-white text-emerald-900 shadow-lg shadow-black/10' // Active: White BG, Dark Green Text
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white' // Inactive: Light Green Text, Darker Green Hover
                }`}
                >
                <div className="flex items-center gap-3">
                    <span className={`${isActive ? 'text-marsala-600' : 'text-emerald-300'} ${locked ? 'opacity-50' : ''}`}>
                        {item.icon}
                    </span>
                    <span className={locked ? 'opacity-50' : ''}>{item.label}</span>
                </div>
                {locked && <Lock size={14} className="text-emerald-400/50" />}
                </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-emerald-800 bg-emerald-950/20">
        <button 
          onClick={() => onChangeView('REMINDERS')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 font-medium ${
            currentView === 'REMINDERS' ? 'bg-marsala-600 text-white' : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
          }`}
        >
          <Bell size={20} strokeWidth={1.5} />
          <span className="flex-1 text-left">Notificações</span>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/30 hover:text-red-200 rounded-xl transition-all font-bold group"
          title="Sair do sistema"
        >
          <LogOut size={20} strokeWidth={1.5} className="group-hover:scale-110 transition-transform"/>
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
