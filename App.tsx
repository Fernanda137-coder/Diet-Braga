import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import PatientManager from './components/PatientManager';
import FoodAnalyzer from './components/FoodAnalyzer';
import MealPlanner from './components/MealPlanner';
import ProgressStats from './components/ProgressStats';
import Login from './components/Login';
import ProfileSettings from './components/ProfileSettings';
import Agenda from './components/Agenda';
import Reminders from './components/Reminders';
import PatientHealthRecord from './components/PatientHealthRecord';
import DietaryPreferences from './components/DietaryPreferences';
import TipsAndAdvice from './components/TipsAndAdvice';
import WorkoutManager from './components/WorkoutManager';
import OnboardingQuestionnaire from './components/OnboardingQuestionnaire'; 
import ShoppingList from './components/ShoppingList'; 
import PatientPlans from './components/PatientPlans';
import SubscriptionGate from './components/SubscriptionGate'; 
import ChatRoom from './components/ChatRoom'; 
import RecipeBook from './components/RecipeBook'; 
import ServicePlansManager from './components/ServicePlansManager'; // NEW IMPORT
import CelebrationModal from './components/CelebrationModal'; // NEW IMPORT
import useLocalStorage from './hooks/useLocalStorage';
import { ViewState, Patient, FoodEntry, Gender, ProfessionalProfile, Appointment, Reminder, PaymentStatus, WorkoutSession, ShoppingItem, ChatMessage, Recipe } from './types';
import { Activity, Calendar, ClipboardList, User, ArrowRight, Utensils, Droplets, Clock, TrendingUp, Users, CheckCircle2, MoreHorizontal, LogOut, Sparkles, Plus, Minus, Coffee, Sun, Sunset, Moon, Zap, ChevronRight, Dumbbell, DollarSign, Bell, Star, Flame, Target, Lock, Crown, MessageCircle, Share2 } from 'lucide-react';

const DASHBOARD_IMAGES = [
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543353071-087f9fb536e0?q=80&w=2070&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop"
];

const App: React.FC = () => {
  const [loadingApp, setLoadingApp] = useState(false); 
  
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage<boolean>('dietbraga_auth_status', false);
  const [userType, setUserType] = useLocalStorage<'PROFESSIONAL' | 'PATIENT' | null>('dietbraga_user_type', null);
  const [loggedInUserId, setLoggedInUserId] = useLocalStorage<string | null>('dietbraga_user_id', null);

  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);

  const [waterIntake, setWaterIntake] = useState(0);
  const [dashboardImageIndex, setDashboardImageIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false); // NEW STATE

  // Initialize with empty profile instead of example data
  const [profProfile, setProfProfile] = useLocalStorage<ProfessionalProfile>('dietbraga_profile', {
    id: '', 
    name: '',
    email: '',
    crn: '',
    specialty: '',
    phone: '',
    bio: '',
    photoUrl: undefined,
    pixKey: '',
    subscriptionStatus: 'INACTIVE' // Default new profs to INACTIVE
  });

  const [patients, setPatients] = useLocalStorage<Patient[]>('dietbraga_patients', []);
  const [professionals, setProfessionals] = useLocalStorage<ProfessionalProfile[]>('dietbraga_professionals', []); // Store all professionals

  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('dietbraga_appointments', []);
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('dietbraga_reminders', []);
  const [foodLogs, setFoodLogs] = useLocalStorage<FoodEntry[]>('dietbraga_foodlogs', []);
  const [workoutLogs, setWorkoutLogs] = useLocalStorage<WorkoutSession[]>('dietbraga_workoutlogs', []); 
  const [chatMessages, setChatMessages] = useLocalStorage<ChatMessage[]>('dietbraga_chat_messages', []); // Chat State

  // Effect to ensure the logged in professional's profile is updated in the global list
  useEffect(() => {
      if (userType === 'PROFESSIONAL' && profProfile.id) {
          const index = professionals.findIndex(p => p.id === profProfile.id);
          if (index >= 0) {
              const updated = [...professionals];
              updated[index] = profProfile;
              setProfessionals(updated);
          } else {
              setProfessionals([...professionals, profProfile]);
          }
      }
  }, [profProfile]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDashboardImageIndex((prev) => (prev + 1) % DASHBOARD_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredPatients = useMemo(() => {
    if (userType === 'PROFESSIONAL' && loggedInUserId) {
      return patients.filter(p => p.professionalId === loggedInUserId);
    }
    return patients; 
  }, [patients, userType, loggedInUserId]);

  const filteredAppointments = useMemo(() => {
    const myPatientIds = filteredPatients.map(p => p.id);
    return appointments.filter(a => myPatientIds.includes(a.patientId));
  }, [appointments, filteredPatients]);


  const handleAddPatient = (newPatient: Patient) => {
    const patientWithOwnership = {
      ...newPatient,
      // Use loggedInUserId or empty string, do not fallback to 'prof_1'
      professionalId: userType === 'PROFESSIONAL' && loggedInUserId ? loggedInUserId : ''
    };
    setPatients([...patients, patientWithOwnership]);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
      setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleDeletePatient = (id: string) => {
      if (confirm("Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.")) {
          setPatients(patients.filter(p => p.id !== id));
          if (selectedPatientId === id) setSelectedPatientId(undefined);
      }
  };

  // Logic to unlink/remove premium status from a patient
  const handleUnlinkPatient = (id: string) => {
      setPatients(patients.map(p => p.id === id ? {
          ...p,
          professionalId: '', // Remove professional link
          planId: undefined,
          paymentStatus: 'PENDING', // Reset status
          subscriptionStatus: 'INACTIVE', // Make sure app subscription is also reset
          paymentProofUrl: undefined // Clear proof
      } : p));
      
      // If we were viewing that patient, clear selection
      if (selectedPatientId === id) setSelectedPatientId(undefined);
  };

  const handleUpdatePatientPreferences = (patientId: string, prefs: any) => {
      setPatients(patients.map(p => p.id === patientId ? { ...p, preferences: prefs } : p));
  }

  const handleUpdatePatientStatus = (patientId: string, status: PaymentStatus) => {
      setPatients(patients.map(p => p.id === patientId ? { ...p, paymentStatus: status } : p));
  }
  
  const handleUpdateShoppingList = (patientId: string, list: ShoppingItem[]) => {
      setPatients(patients.map(p => p.id === patientId ? { ...p, shoppingList: list } : p));
  }

  const handleRegister = (data: Patient | ProfessionalProfile, type: 'PROFESSIONAL' | 'PATIENT') => {
      if (type === 'PATIENT') {
          // New patients start with INACTIVE subscription
          const newP = { ...data, subscriptionStatus: 'INACTIVE' as any };
          setPatients([...patients, newP as Patient]);
      } else {
          // New professionals start with INACTIVE subscription
          const newProf = { ...data, subscriptionStatus: 'INACTIVE' as any };
          setProfProfile(newProf as ProfessionalProfile);
          // Also add to global list if not exists
          if (!professionals.find(p => p.id === newProf.id)) {
              setProfessionals([...professionals, newProf as ProfessionalProfile]);
          }
      }
  }

  const handleCompleteOnboarding = (updatedData: Partial<Patient>) => {
    if(loggedInUserId) {
       setPatients(patients.map(p => p.id === loggedInUserId ? { ...p, ...updatedData } : p));
    }
  }

  const handleMigrateToProfessional = () => {
    if (loggedInUserId) {
        // Direct to Plans page to find professional
        setCurrentView('PLANS');
    }
  }

  // Handle Solo Patient Selection of Professional
  const handleSelectProfessional = (profId: string, planId: string) => {
      if(loggedInUserId) {
          setPatients(patients.map(p => p.id === loggedInUserId ? {
              ...p,
              professionalId: profId,
              planId: planId,
              paymentStatus: 'PENDING',
              subscriptionStatus: 'INACTIVE' // Clear generic app sub if switching to pro
          } : p));
          alert("Solicitação enviada! Realize o pagamento para ativar seu plano.");
      }
  }

  // Handle App Subscription (Solo)
  const handleAppSubscribe = (planType: 'MONTHLY' | 'SEMESTRAL') => {
      if (loggedInUserId) {
          setPatients(patients.map(p => p.id === loggedInUserId ? {
              ...p,
              subscriptionStatus: 'ACTIVE',
              professionalId: '', // Ensure no pro linked
              paymentStatus: 'APPROVED' // App subscription is auto-approved mockup
          } : p));
          alert("Assinatura do App realizada com sucesso!");
      }
  }

  const handleResetPassword = (email: string, newPass: string, type: 'PROFESSIONAL' | 'PATIENT'): boolean => {
      if (type === 'PATIENT') {
          const patientExists = patients.find(p => p.email === email);
          if (patientExists) {
              setPatients(patients.map(p => p.email === email ? { ...p, password: newPass } : p));
              return true;
          }
      } else {
          if (profProfile.email === email) {
              setProfProfile({ ...profProfile, password: newPass });
              return true;
          }
      }
      return false;
  };

  const handleAddFoodEntry = (entry: FoodEntry) => setFoodLogs([...foodLogs, entry]);
  const handleAddWorkoutEntry = (entry: WorkoutSession) => setWorkoutLogs([...workoutLogs, entry]); 
  const handleDeleteWorkoutEntry = (id: string) => setWorkoutLogs(workoutLogs.filter(w => w.id !== id));

  const handleAddAppointment = (apt: Appointment) => setAppointments([...appointments, apt]);
  const handleUpdateStatus = (id: string, status: Appointment['status']) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };
  const handleAddReminder = (rem: Reminder) => setReminders([...reminders, rem]);
  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };
  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handleUploadProof = (file: string, type: 'image' | 'pdf') => {
      if (loggedInUserId) {
          setPatients(patients.map(p => p.id === loggedInUserId ? { ...p, paymentProofUrl: file, paymentProofType: type } : p));
      }
  }

  // RECIPE HANDLERS
  const handleSaveRecipe = (recipe: Recipe) => {
      if (activePatient) {
          const updatedRecipes = [...(activePatient.recipes || []), recipe];
          const updatedPatient = { ...activePatient, recipes: updatedRecipes };
          handleUpdatePatient(updatedPatient);
          alert("Receita salva no seu livro!");
      }
  };

  const handleDeleteRecipe = (id: string) => {
      if (activePatient) {
          if(confirm("Deseja excluir esta receita?")) {
              const updatedRecipes = (activePatient.recipes || []).filter(r => r.id !== id);
              const updatedPatient = { ...activePatient, recipes: updatedRecipes };
              handleUpdatePatient(updatedPatient);
          }
      }
  };

  // CHAT HANDLERS
  const handleSendMessage = (text: string, receiverId: string) => {
      if (!loggedInUserId) return;
      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          senderId: loggedInUserId,
          receiverId: receiverId,
          text: text,
          timestamp: new Date().toISOString(),
          read: false
      };
      setChatMessages([...chatMessages, newMessage]);
  }

  const handleMarkAsRead = (senderId: string) => {
      if (!loggedInUserId) return;
      setChatMessages(chatMessages.map(m => 
          (m.senderId === senderId && m.receiverId === loggedInUserId) ? { ...m, read: true } : m
      ));
  }

  const handleLogin = (type: 'PROFESSIONAL' | 'PATIENT', userId: string) => {
    setLoadingApp(true);
    setTimeout(() => {
      setUserType(type);
      setLoggedInUserId(userId);
      setIsLoggedIn(true);
      
      if (type === 'PATIENT') {
        setSelectedPatientId(userId);
      }
      // If Professional login, load their specific profile into state from list
      if (type === 'PROFESSIONAL') {
          const prof = professionals.find(p => p.id === userId);
          if (prof) setProfProfile(prof);
      }
      setLoadingApp(false);
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setLoggedInUserId(null);
    setCurrentView('DASHBOARD');
  };

  // SUBSCRIPTION GATE HANDLER (For Professionals mostly, or initial patient lock)
  const handleSubscriptionSuccess = () => {
      if (userType === 'PROFESSIONAL') {
          setProfProfile({ ...profProfile, subscriptionStatus: 'ACTIVE' });
      } else if (userType === 'PATIENT' && loggedInUserId) {
          setPatients(patients.map(p => p.id === loggedInUserId ? { ...p, subscriptionStatus: 'ACTIVE' } : p));
      }
      alert("Assinatura ativada com sucesso! Bem-vindo ao Premium.");
  };

  const activePatient = userType === 'PATIENT' 
     ? patients.find(p => p.id === loggedInUserId) 
     : patients.find(p => p.id === selectedPatientId) || filteredPatients.find(p => p.paymentStatus === 'APPROVED');

  // Check Subscription Status (Gate Logic)
  const isSubscriptionActive = () => {
      if (!isLoggedIn) return false;
      if (userType === 'PROFESSIONAL') {
          return profProfile.subscriptionStatus === 'ACTIVE';
      } 
      // Patients are handled via feature locks inside the app or by not having access to specific data
      return true; 
  }

  // Feature Restriction Logic - Calculates if user is Premium
  const isUserPremium = useMemo(() => {
      if (userType === 'PROFESSIONAL') return true; // Professionals see all features for patients usually
      if (!activePatient) return false;
      
      // If linked to professional, needs APPROVED status
      if (activePatient.professionalId) {
          return activePatient.paymentStatus === 'APPROVED';
      }
      // If Solo Patient, needs ACTIVE subscription
      return activePatient.subscriptionStatus === 'ACTIVE';
  }, [userType, activePatient]);

  const RestrictedView = () => (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 rounded-[2.5rem] border border-gray-200 relative overflow-hidden shadow-inner">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10 max-w-lg">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 text-emerald-600 shadow-xl mx-auto border-4 border-emerald-50">
                <Lock size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Conteúdo Premium</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
                Esta funcionalidade é exclusiva para usuários Premium. 
                {activePatient?.professionalId 
                    ? " Regularize sua assinatura com o nutricionista." 
                    : " Assine um plano do App ou contrate um profissional."}
            </p>
            <button 
                onClick={() => setCurrentView('PLANS')}
                className="bg-gray-900 text-white px-8 py-4 rounded-xl font-bold shadow-xl hover:bg-black hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto mx-auto"
            >
                <Crown size={20} className="text-yellow-400" fill="currentColor" />
                Desbloquear Acesso Agora
            </button>
          </div>
      </div>
  );

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getProfessionalName = () => {
      // Basic heuristic for gender based on name ending
      const firstName = profProfile.name.split(' ')[0];
      const title = firstName.endsWith('a') ? 'Dra.' : 'Dr.';
      return `${title} ${firstName}`;
  };

  const getNextMeal = () => {
      const hour = new Date().getHours();
      if (hour < 10) return { label: 'Café da Manhã', icon: <Coffee size={20}/>, time: '07:00 - 10:00', bg: 'bg-orange-100', text: 'text-orange-600' };
      if (hour < 15) return { label: 'Almoço', icon: <Sun size={20}/>, time: '12:00 - 14:00', bg: 'bg-yellow-100', text: 'text-yellow-600' };
      if (hour < 18) return { label: 'Lanche', icon: <Sunset size={20}/>, time: '16:00 - 17:00', bg: 'bg-rose-100', text: 'text-rose-600' };
      return { label: 'Jantar', icon: <Moon size={20}/>, time: '19:00 - 21:00', bg: 'bg-indigo-100', text: 'text-indigo-600' };
  };

  const getPatientName = () => {
      if (!activePatient) return 'Visitante';
      return activePatient.name ? activePatient.name.split(' ')[0] : 'Paciente';
  };

  const getRandomQuote = () => {
      const quotes = [
          "Que o alimento seja teu remédio e o remédio seja teu alimento. – Hipócrates",
          "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
          "Cuidar do corpo é um ato de amor próprio.",
          "A disciplina é a ponte entre metas e realizações."
      ];
      return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const renderContent = () => {
    // PROFESSIONAL WELCOME DASHBOARD (First Access / No Patients)
    if (userType === 'PROFESSIONAL' && filteredPatients.length === 0 && currentView === 'DASHBOARD') {
      return (
        <div className="animate-fade-in flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden max-w-4xl w-full">
                {/* Decoration Images */}
                <div className="absolute top-0 right-0 w-64 h-64 opacity-20 transform translate-x-1/3 -translate-y-1/3 pointer-events-none">
                    <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop" className="w-full h-full object-cover rounded-full" />
                </div>
                <div className="absolute bottom-0 left-0 w-80 h-80 opacity-10 transform -translate-x-1/3 translate-y-1/3 pointer-events-none">
                    <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop" className="w-full h-full object-cover rounded-full" />
                </div>

                <div className="relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                        Bem-vindo, <br/><span className="text-emerald-300">{getProfessionalName()}</span>
                    </h1>
                    <div className="w-24 h-1 bg-emerald-500 mx-auto my-6 rounded-full"></div>
                    <p className="text-emerald-100 text-lg md:text-xl font-medium italic max-w-2xl mx-auto leading-relaxed">
                        "{getRandomQuote()}"
                    </p>
                    
                    <button 
                        onClick={() => setCurrentView('PATIENTS')}
                        className="mt-10 bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-emerald-50 hover:scale-105 transition-all shadow-lg flex items-center gap-3 mx-auto"
                    >
                        <User size={24} /> Começar Cadastro de Pacientes
                    </button>
                </div>
            </div>
        </div>
      );
    }

    switch (currentView) {
      case 'DASHBOARD':
        return (
          <div className="space-y-8 animate-fade-in">
            {userType === 'PROFESSIONAL' ? (
              // DASHBOARD PROFISSIONAL (Redesenhado)
              <>
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 relative overflow-hidden min-h-[200px]">
                    
                    {/* Carousel Background Layer */}
                    {DASHBOARD_IMAGES.map((img, index) => (
                        <div 
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === dashboardImageIndex ? 'opacity-15' : 'opacity-0'}`}
                            style={{ backgroundImage: `url('${img}')` }}
                        />
                    ))}
                    
                    {/* Gradient for readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-0"></div>

                    <div className="relative z-10">
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Painel Nutricional
                        </p>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                            {getGreeting()}, <span className="text-emerald-600">{getProfessionalName()}</span>.
                        </h1>
                        <p className="text-gray-500 mt-2">Você tem <strong className="text-gray-800">{filteredAppointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length} consultas</strong> hoje.</p>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <button 
                            onClick={() => setShowCelebration(true)}
                            className="bg-emerald-100 text-emerald-800 px-4 py-3 rounded-xl font-bold hover:bg-emerald-200 transition-all shadow-sm flex items-center gap-2"
                            title="Gerar imagem de comemoração"
                        >
                            <Share2 size={18} />
                        </button>
                        <button onClick={() => setCurrentView('AGENDA')} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center gap-2">
                            <Calendar size={18} /> Ver Agenda
                        </button>
                    </div>
                </div>

                {/* Show Patient List directly on dashboard if exists */}
                <PatientManager 
                    patients={filteredPatients} 
                    onAddPatient={handleAddPatient} 
                    onUpdatePatient={handleUpdatePatient}
                    onSelectPatient={(p) => setSelectedPatientId(p.id)} 
                    selectedPatientId={selectedPatientId} 
                    onUpdatePatientStatus={handleUpdatePatientStatus}
                    onDeletePatient={handleDeletePatient}
                    onUnlinkPatient={handleUnlinkPatient}
                />
              </>
            ) : (
              // DASHBOARD PACIENTE (Refinado & Chamativo)
              <>
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* HERO SECTION */}
                    <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] shadow-2xl group min-h-[320px] flex flex-col justify-between">
                        {/* Dynamic Background */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/80 to-transparent"></div>
                        
                        <div className="relative z-10 p-8 md:p-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-bold border border-white/20 shadow-lg">
                                        <Sparkles size={14} className="text-yellow-300" fill="currentColor" />
                                        <span>Foco Atual: {activePatient?.goal || 'Saúde Total'}</span>
                                    </div>
                                    <button 
                                        onClick={() => setShowCelebration(true)}
                                        className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-1.5 rounded-full text-white transition-all border border-white/20"
                                        title="Gerar card de conquista"
                                    >
                                        <Share2 size={16} />
                                    </button>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
                                    {getGreeting()},<br/>
                                    {getPatientName()}!
                                </h1>
                                <p className="text-emerald-100 font-medium max-w-md text-lg">
                                    "Cada refeição saudável é um passo em direção à sua melhor versão. Continue firme!"
                                </p>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button 
                                    onClick={() => setCurrentView('MEAL_PLAN')}
                                    className="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg flex items-center gap-2"
                                >
                                    <Utensils size={18} /> Ver Dieta
                                </button>
                                <button 
                                    onClick={() => setCurrentView('CHAT')}
                                    className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-all border border-white/20 flex items-center gap-2"
                                >
                                    <MessageCircle size={18} /> Falar com Nutri
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* STATUS COLUMN */}
                    <div className="space-y-6">
                        {/* Next Meal Card */}
                        <div 
                            onClick={() => setCurrentView('MEAL_PLAN')}
                            className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-lg cursor-pointer hover:-translate-y-1 transition-transform relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                        <Clock size={20} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Próxima Refeição</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-1">{getNextMeal().label}</h3>
                                <p className="text-gray-500 text-sm font-medium">{getNextMeal().time}</p>
                            </div>
                        </div>

                        {/* Hydration Card */}
                        <div 
                            onClick={() => setWaterIntake(prev => prev + 250)}
                            className="bg-blue-600 p-6 rounded-[2.5rem] shadow-lg shadow-blue-200 cursor-pointer hover:bg-blue-700 transition-colors relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10 flex flex-col justify-between h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2 text-blue-100">
                                        <Droplets size={20} /> <span className="text-xs font-bold uppercase">Hidratação</span>
                                    </div>
                                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                        <Plus size={16} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-white">{waterIntake}<span className="text-lg font-normal opacity-70 ml-1">ml</span></p>
                                    <div className="w-full bg-black/20 h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div 
                                            className="bg-white h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min((waterIntake / (activePatient?.preferences?.waterIntakeGoal || 2000)) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-blue-100 text-xs mt-2 text-right">Meta: {activePatient?.preferences?.waterIntakeGoal || 2000}ml</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Quick Actions Grid */}
                 <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Zap className="text-yellow-500" fill="currentColor"/> Menu Rápido
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { id: 'FOOD_LOG', label: 'Diário', desc: 'Registrar', icon: <Plus size={24} />, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'hover:border-emerald-200' },
                            { id: 'WORKOUTS', label: 'Treinos', desc: 'Ver ficha', icon: <Dumbbell size={24} />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'hover:border-purple-200' },
                            { id: 'SHOPPING_LIST', label: 'Compras', desc: 'Lista', icon: <CheckCircle2 size={24} />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'hover:border-blue-200' },
                            { id: 'TIPS', label: 'Dicas', desc: 'Conteúdo', icon: <Star size={24} />, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'hover:border-yellow-200' },
                        ].map((item) => (
                            <button 
                                key={item.id}
                                onClick={() => setCurrentView(item.id as ViewState)} 
                                className={`bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all text-left group relative overflow-hidden ${item.border} transform hover:-translate-y-1`}
                            >
                                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{item.label}</h3>
                                <p className="text-xs text-gray-400 mt-1 font-medium group-hover:text-gray-500">{item.desc}</p>
                            </button>
                        ))}
                    </div>
                 </div>
              </>
            )}
          </div>
        );
      case 'PATIENTS':
        return <PatientManager 
            patients={filteredPatients} 
            onAddPatient={handleAddPatient} 
            onUpdatePatient={handleUpdatePatient}
            onSelectPatient={(p) => setSelectedPatientId(p.id)} 
            selectedPatientId={selectedPatientId} 
            onUpdatePatientStatus={handleUpdatePatientStatus}
            onDeletePatient={handleDeletePatient}
            onUnlinkPatient={handleUnlinkPatient}
        />;
      case 'AGENDA':
        return <Agenda appointments={filteredAppointments} patients={filteredPatients} onAddAppointment={handleAddAppointment} onUpdateStatus={handleUpdateStatus} />;
      case 'REMINDERS':
        return <Reminders reminders={reminders} onAddReminder={handleAddReminder} onToggleReminder={handleToggleReminder} onDeleteReminder={handleDeleteReminder} />;
      case 'CHAT': // CHAT ROUTE
        return (
            <ChatRoom 
                currentUserType={userType || 'PATIENT'}
                currentUserId={loggedInUserId || ''}
                patients={filteredPatients}
                professional={profProfile}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onMarkAsRead={handleMarkAsRead}
            />
        );
      case 'SERVICE_PLANS': // PROFESSIONAL PLAN MANAGEMENT
        return <ServicePlansManager profile={profProfile} onSaveProfile={setProfProfile} patients={patients} />;
      case 'RECIPES': // RECIPES ROUTE
        // Free tier allows viewing, but hides macros (handled inside RecipeBook)
        return activePatient ? (
            <RecipeBook 
                recipes={activePatient.recipes || []}
                onSaveRecipe={handleSaveRecipe}
                onDeleteRecipe={handleDeleteRecipe}
                isPremium={isUserPremium}
            />
        ) : null;
      case 'FOOD_LOG':
        // Free tier allowed
        return <div className="space-y-6 animate-fade-in"><h2 className="text-3xl font-bold text-gray-800">Diário Alimentar IA</h2><FoodAnalyzer onAddEntry={handleAddFoodEntry} /></div>;
      case 'WORKOUTS':
        // Free tier allowed, but AI Gen is locked (handled inside WorkoutManager)
        return activePatient ? <WorkoutManager patientId={activePatient.id} onSaveWorkout={handleAddWorkoutEntry} onDeleteWorkout={handleDeleteWorkoutEntry} history={workoutLogs.filter(w => w.patientId === activePatient.id)} isPremium={isUserPremium} /> : null;
      case 'MEAL_PLAN':
        // Free tier allowed
        return activePatient ? <MealPlanner patient={activePatient} /> : <div className="text-center py-20 text-gray-500">Selecione um paciente.</div>;
      case 'SHOPPING_LIST':
        // Free tier allowed, print locked inside component
        return activePatient ? <ShoppingList initialItems={activePatient.shoppingList || []} onUpdateList={(l) => handleUpdateShoppingList(activePatient.id, l)} isPremium={isUserPremium} /> : null;
      case 'PLANS':
        return activePatient ? (
            <PatientPlans 
                patient={activePatient} 
                professional={
                    // Pass the professional data. If no linked pro, pass a placeholder or empty profile
                    activePatient.professionalId 
                    ? professionals.find(p => p.id === activePatient.professionalId) || profProfile 
                    : profProfile // Fallback for solo (won't be used for view logic)
                } 
                onUploadProof={handleUploadProof} 
                professionals={professionals} // Pass all pros for discovery
                onSelectProfessional={handleSelectProfessional}
                onAppSubscribe={handleAppSubscribe}
            /> 
        ) : null;
      case 'PREFERENCES':
        return activePatient ? <DietaryPreferences patient={activePatient} onUpdatePreferences={(prefs) => handleUpdatePatientPreferences(activePatient.id, prefs)} /> : null;
      case 'TIPS':
        return <TipsAndAdvice />;
      case 'PROGRESS':
        // Keep restricted
        if(!isUserPremium) return <RestrictedView />;
        return activePatient ? <ProgressStats patient={activePatient} foodLogs={foodLogs} workoutLogs={workoutLogs} /> : <div className="text-center py-20 text-gray-500">Selecione um paciente.</div>;
      case 'PROFILE':
        return <ProfileSettings 
                    profile={profProfile} 
                    patient={activePatient} 
                    onSave={setProfProfile} 
                    onSavePatient={handleUpdatePatient} 
                    userType={userType || 'PATIENT'} 
                    isSoloPatient={userType === 'PATIENT' && !activePatient?.professionalId}
                    onMigrateToProfessional={handleMigrateToProfessional}
                    patients={patients} // Pass all patients to check plan usage
               />;
      case 'MY_RECORD':
        return activePatient ? (
            <PatientHealthRecord 
                patient={activePatient} 
                professional={activePatient.professionalId ? (professionals.find(p => p.id === activePatient.professionalId) || profProfile) : undefined} 
                onNavigateToPlans={() => setCurrentView('PLANS')} // Pass navigation callback
            /> 
        ) : <div className="text-center py-20 text-gray-500">Carregando dados...</div>;
      default:
        return null;
    }
  };

  if (loadingApp) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-gray-900"></div>
        <div className="relative z-10 flex flex-col items-center">
           <div className="h-24 w-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mb-8 animate-bounce"><span className="text-white text-4xl font-bold">DB</span></div>
           <h1 className="text-white text-2xl font-bold tracking-tight mb-2">Diet Braga</h1>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Only pass profProfile if it has an ID, otherwise pass empty array to avoid listing empty profile
    return <Login onLogin={handleLogin} onRegister={handleRegister} onResetPassword={handleResetPassword} patients={patients} professionals={professionals} />;
  }

  // SUBSCRIPTION GATE CHECK
  // Check if logged in user has an active subscription. If not, show the gate.
  // UPDATE: Only professionals are gated. Patients can use free tier.
  if (isLoggedIn && userType === 'PROFESSIONAL' && !isSubscriptionActive()) {
      return (
          <SubscriptionGate 
            userType={userType} 
            userName={profProfile.name} 
            onSubscribe={handleSubscriptionSuccess}
            onLogout={handleLogout}
          />
      );
  }

  // Intercept Render for Onboarding (Solo Patient who hasn't completed it)
  // FIXED CONDITION: Show onboarding if patient hasn't completed it, regardless of professional status
  // Also ensures activePatient is defined before showing
  if (userType === 'PATIENT' && activePatient && activePatient.onboardingCompleted === false) {
    return <OnboardingQuestionnaire patient={activePatient} onComplete={handleCompleteOnboarding} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar 
        currentView={currentView} 
        onChangeView={(v) => setCurrentView(v)} 
        userType={userType} 
        onLogout={handleLogout}
        patientStatus={activePatient?.paymentStatus}
        isPremium={isUserPremium} // Pass isPremium to Sidebar
      />
      <main className="flex-1 md:ml-72 p-6 md:p-10 overflow-x-hidden min-h-screen transition-all print:ml-0 print:p-0">
        {/* Mobile Header with Logout */}
        <div className="md:hidden flex justify-between items-center mb-6 print:hidden">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-xs">DB</span>
                </div>
                <span className="font-bold text-gray-700">Diet Braga</span>
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 bg-white text-rose-500 rounded-lg shadow-sm border border-gray-100 hover:bg-rose-50 transition-colors"
                title="Sair"
            >
                <LogOut size={20} />
            </button>
        </div>

        {renderContent()}
      </main>

      <CelebrationModal 
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        userName={userType === 'PROFESSIONAL' ? profProfile.name : (activePatient?.name || 'Visitante')}
        userType={userType || 'PATIENT'}
      />
    </div>
  );
};

const DashboardCard: React.FC<{ icon: React.ReactNode; label: string; value: string; subtext?: string; trend?: string; highlight?: boolean }> = ({ icon, label, value, subtext, trend, highlight }) => {
  return (
    <div className={`relative p-6 rounded-[2rem] border transition-all duration-300 group ${highlight ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl shadow-emerald-200' : 'bg-white text-gray-800 border-gray-100 shadow-sm hover:shadow-md'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl flex items-center justify-center ${highlight ? 'bg-white/20 text-white' : 'bg-gray-50 text-emerald-600 group-hover:bg-emerald-50'}`}>{icon}</div>
        {trend && (<span className={`text-xs font-bold py-1 px-2 rounded-full ${highlight ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>{trend}</span>)}
      </div>
      <p className={`text-sm font-semibold mb-1 ${highlight ? 'text-emerald-100' : 'text-gray-400 uppercase tracking-wide'}`}>{label}</p>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {subtext && (<p className={`text-xs mt-2 ${highlight ? 'text-emerald-200' : 'text-gray-400'}`}>{subtext}</p>)}
    </div>
  );
}

export default App;
