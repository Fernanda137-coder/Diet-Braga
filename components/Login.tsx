import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, Briefcase, ArrowRight, Eye, EyeOff, KeyRound, ChevronLeft, Stethoscope, ChevronDown, Check, Target, AlertCircle } from 'lucide-react';
import { Patient, ProfessionalProfile } from '../types';

interface LoginProps {
  onLogin: (userType: 'PROFESSIONAL' | 'PATIENT', userId: string) => void;
  onRegister: (data: Patient | ProfessionalProfile, type: 'PROFESSIONAL' | 'PATIENT') => void;
  onResetPassword: (email: string, newPass: string, type: 'PROFESSIONAL' | 'PATIENT') => boolean;
  patients: Patient[];
  professionals: ProfessionalProfile[]; 
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onResetPassword, patients, professionals }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [userType, setUserType] = useState<'PROFESSIONAL' | 'PATIENT'>('PATIENT');
  const [showPassword, setShowPassword] = useState(false);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDietType, setRegDietType] = useState('Balanceada'); 
  const [selectedProfId, setSelectedProfId] = useState<string>(''); 
  const [regCalorieGoal, setRegCalorieGoal] = useState<number | ''>(''); 

  // Reset Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); 

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setErrorMessage(null);
  }, [isRegistering, userType, isForgotPassword]);

  // Updated Background Image - Healthy Food Flat Lay
  const BACKGROUND_IMAGE = "https://images.unsplash.com/photo-1490818387583-1baba5e638af?q=80&w=2000&auto=format&fit=crop";

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    
    setTimeout(() => {
      let userId = ''; 
      const cleanEmail = email.trim().toLowerCase();
      
      if (userType === 'PATIENT') {
        const found = patients.find(p => (p.email?.toLowerCase() === cleanEmail));
        
        if (found) {
            if (found.password && found.password !== password) { 
                setErrorMessage('A senha informada está incorreta.');
                setLoading(false); 
                return; 
            }

            // REMOVED PENDING CHECK: Allow login even if pending to upload proof inside app
            if (found.paymentStatus === 'REJECTED') {
                setErrorMessage(`Seu cadastro foi rejeitado pelo nutricionista. Motivo: Informações ou comprovante inválidos.`);
                setLoading(false);
                return;
            }
            userId = found.id;
        } else {
             setErrorMessage('Não encontramos uma conta com este e-mail.');
             setLoading(false); 
             return;
        }
      } else {
        const prof = professionals.find(p => p.email.toLowerCase() === cleanEmail);
        if (prof) {
            if (prof.password && prof.password !== password) {
                setErrorMessage('A senha informada está incorreta.');
                setLoading(false);
                return;
            }
            userId = prof.id;
        } else {
            setErrorMessage('Profissional não encontrado.');
            setLoading(false);
            return;
        }
      }

      onLogin(userType, userId);
      setLoading(false);
    }, 1000);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanRegEmail = regEmail.trim().toLowerCase();

    setTimeout(() => {
        const emailExistsInPatients = patients.some(p => p.email?.toLowerCase() === cleanRegEmail);
        const emailExistsInProfs = professionals.some(p => p.email?.toLowerCase() === cleanRegEmail);

        if (emailExistsInPatients || emailExistsInProfs) {
            setErrorMessage("Este email já está cadastrado no sistema. Por favor, faça login.");
            setLoading(false);
            return;
        }

        if (userType === 'PATIENT') {
            const isSolo = !selectedProfId;
            const newPatient: Patient = {
                id: Date.now().toString(),
                professionalId: selectedProfId || '',
                name: regName,
                email: cleanRegEmail,
                password: regPassword,
                age: 30, 
                gender: 'Outro' as any,
                weight: 70,
                height: 170,
                goal: 'Manter Saúde',
                allergies: '',
                restrictions: '',
                notes: '',
                history: [],
                // If solo, approved immediately (SaaS flow). If with professional, PENDING (Restricted flow).
                paymentStatus: isSolo ? 'APPROVED' : 'PENDING',
                onboardingCompleted: false, 
                shoppingList: [],
                preferences: {
                    dietType: regDietType,
                    favoriteFoods: [],
                    dislikedFoods: [],
                    mealsPerDay: 3,
                    waterIntakeGoal: 2000,
                    calorieGoal: isSolo && regCalorieGoal ? Number(regCalorieGoal) : undefined
                }
            };
            onRegister(newPatient, 'PATIENT');
            
            // Auto login or success message
            alert("Cadastro realizado com sucesso! Faça login para continuar.");
            setIsRegistering(false);
            
        } else {
            const newProf: ProfessionalProfile = {
                id: Date.now().toString(),
                name: regName,
                email: cleanRegEmail,
                password: regPassword,
                crn: '',
                specialty: 'Nutricionista',
                phone: '',
                bio: ''
            };
            onRegister(newProf, 'PROFESSIONAL');
            alert("Cadastro profissional realizado!");
            setIsRegistering(false);
        }
        setLoading(false);
    }, 1500);
  }

  const handleResetSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setErrorMessage(null);
      setTimeout(() => {
          if (resetStep === 1) {
              setResetStep(2);
              setLoading(false);
          } else {
              const success = onResetPassword(resetEmail.trim().toLowerCase(), resetNewPassword, userType);
              if (success) {
                  alert("Senha redefinida com sucesso!");
                  setIsForgotPassword(false);
                  setResetStep(1);
                  setResetEmail('');
                  setResetNewPassword('');
              } else {
                  setErrorMessage("Email não encontrado para o tipo de usuário selecionado.");
                  setResetStep(1);
              }
              setLoading(false);
          }
      }, 1000);
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url('${BACKGROUND_IMAGE}')` }}
    >
      {/* Overlay Escuro com Tom de Verde para leitura */}
      <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-[2px]"></div>

      {/* Elementos Decorativos Sutis (Mistura Verde + Marsala) */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-marsala-400/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>

      {/* LOGIN CONTAINER DARK GREEN */}
      <div className="bg-emerald-900/95 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-[450px] border border-emerald-700/50 relative z-10 animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="text-center mb-8">
           {/* LOGO BRANCO COM LETRAS MARSALA */}
           <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/50 mx-auto mb-4">
              <span className="text-marsala-600 text-2xl font-bold">DB</span>
           </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
              {isForgotPassword ? 'Redefinir Senha' : (isRegistering ? 'Criar Conta' : 'Bem-vindo')}
          </h1>
          <p className="text-emerald-100/80 text-sm mt-2">
              {isForgotPassword ? 'Recupere o acesso à sua conta' : (isRegistering ? 'Preencha seus dados para começar' : 'Acesse sua conta para continuar')}
          </p>
        </div>

        {/* User Type Switcher */}
        <div className="mb-8 bg-emerald-950/40 p-1.5 rounded-2xl flex relative">
          <div 
             className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out ${userType === 'PATIENT' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
          ></div>
          <button
            type="button"
            onClick={() => setUserType('PATIENT')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-colors relative z-10 ${
              userType === 'PATIENT' ? 'text-emerald-900' : 'text-emerald-300 hover:text-white'
            }`}
          >
            <User size={16} />
            Paciente
          </button>
          <button
            type="button"
            onClick={() => setUserType('PROFESSIONAL')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-colors relative z-10 ${
              userType === 'PROFESSIONAL' ? 'text-emerald-900' : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Briefcase size={16} />
            Profissional
          </button>
        </div>

        {/* Error Message Display */}
        {errorMessage && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-xl flex items-start gap-3 animate-fade-in">
                <AlertCircle className="text-red-300 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-100 font-medium">{errorMessage}</p>
            </div>
        )}

        {isForgotPassword ? (
            // FORGOT PASSWORD FORM
            <form onSubmit={handleResetSubmit} className="space-y-5 animate-fade-in">
                {resetStep === 1 ? (
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Seu Email Cadastrado</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-emerald-400" />
                            </div>
                            <input
                                type="email"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-emerald-950/40 border border-emerald-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-all text-white placeholder:text-emerald-700"
                                placeholder="email@exemplo.com"
                                value={resetEmail}
                                onChange={(e) => { setResetEmail(e.target.value); setErrorMessage(null); }}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                         <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Nova Senha</label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-emerald-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                className="w-full pl-11 pr-12 py-3.5 bg-emerald-950/40 border border-emerald-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-all text-white placeholder:text-emerald-700"
                                placeholder="Nova senha segura"
                                value={resetNewPassword}
                                onChange={(e) => setResetNewPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-emerald-400 hover:text-white cursor-pointer"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                         </div>
                    </div>
                )}
                
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => { setIsForgotPassword(false); setResetStep(1); setErrorMessage(null); }}
                        className="flex-1 py-3.5 rounded-2xl border border-emerald-700 text-emerald-200 font-bold hover:bg-emerald-800 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-white hover:bg-emerald-50 text-emerald-900 font-bold py-3.5 rounded-2xl shadow-lg transition-all"
                    >
                        {loading ? <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-900/30 border-t-emerald-900 rounded-full"></span> : (resetStep === 1 ? 'Verificar' : 'Salvar')}
                    </button>
                </div>
            </form>

        ) : !isRegistering ? (
            // LOGIN FORM
            <form onSubmit={handleLoginSubmit} className="space-y-5 animate-fade-in">
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Email</label>
                <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-emerald-400 group-focus-within:text-white transition-colors" />
                </div>
                <input
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-emerald-950/40 border border-emerald-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-all font-medium text-white placeholder:text-emerald-700"
                    placeholder="email@exemplo.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }}
                />
                </div>
            </div>
            
            <div className="space-y-1.5">
                <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Senha</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-emerald-400 group-focus-within:text-white transition-colors" />
                    </div>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        className="w-full pl-11 pr-12 py-3.5 bg-emerald-950/40 border border-emerald-700/50 rounded-2xl focus:ring-4 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-all font-medium text-white placeholder:text-emerald-700"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-emerald-400 hover:text-white cursor-pointer"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="text-right">
                    <button 
                        type="button" 
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs font-bold text-emerald-300 hover:text-white hover:underline mt-1"
                    >
                        Esqueci minha senha
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-white hover:bg-emerald-50 text-emerald-900 font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/50 mt-4 flex items-center justify-center gap-2 group transform active:scale-[0.98]"
            >
                {loading ? (
                <span className="w-5 h-5 border-2 border-emerald-900/30 border-t-emerald-900 rounded-full animate-spin"></span>
                ) : (
                <>
                    Entrar na Plataforma <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
                )}
            </button>
            </form>
        ) : (
            // REGISTER FORM
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Nome Completo</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-white placeholder:text-emerald-700"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Email</label>
                    <input
                        type="email"
                        required
                        className="w-full px-4 py-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-white placeholder:text-emerald-700"
                        value={regEmail}
                        onChange={(e) => { setRegEmail(e.target.value); setErrorMessage(null); }}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Senha</label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full px-4 py-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none pr-10 text-white placeholder:text-emerald-700"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                        />
                         <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400 hover:text-white cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                
                {userType === 'PATIENT' && (
                    <>
                        <div className="space-y-2 mb-4">
                            <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Modalidade de Uso</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedProfId('')}
                                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative ${!selectedProfId ? 'bg-white border-white text-emerald-900 shadow-sm' : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-400 hover:border-emerald-500 hover:text-emerald-200'}`}
                                >
                                    {!selectedProfId && <div className="absolute top-2 right-2 text-emerald-600"><Check size={14} strokeWidth={3} /></div>}
                                    <User size={24} className={!selectedProfId ? "text-emerald-600" : "text-emerald-500"} />
                                    <span className="text-xs font-bold text-center leading-tight">Seguir por<br/>Conta Própria</span>
                                </button>
                                
                                {professionals.length > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProfId(professionals[0]?.id || '')} 
                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all relative ${selectedProfId ? 'bg-white border-white text-emerald-900 shadow-sm' : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-400 hover:border-emerald-500 hover:text-emerald-200'}`}
                                    >
                                        {selectedProfId && <div className="absolute top-2 right-2 text-emerald-600"><Check size={14} strokeWidth={3} /></div>}
                                        <Stethoscope size={24} className={selectedProfId ? "text-emerald-600" : "text-emerald-500"} />
                                        <span className="text-xs font-bold text-center leading-tight">Com<br/>Nutricionista</span>
                                    </button>
                                ) : (
                                    <div className="p-3 rounded-xl border bg-emerald-950/20 border-emerald-800 flex flex-col items-center justify-center gap-2 opacity-60 cursor-not-allowed">
                                        <Stethoscope size={24} className="text-emerald-600" />
                                        <span className="text-xs font-bold text-center leading-tight text-emerald-500">Nenhum Nutricionista<br/>Disponível</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SOLO PATIENT - CALORIE GOAL */}
                        {!selectedProfId && (
                            <div className="space-y-1 animate-fade-in mb-2">
                                <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Meta de Calorias (Opcional)</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Target className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <input
                                        type="number"
                                        placeholder="Ex: 2000 kcal"
                                        className="w-full pl-11 pr-4 py-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-white placeholder:text-emerald-700"
                                        value={regCalorieGoal}
                                        onChange={(e) => setRegCalorieGoal(e.target.value ? Number(e.target.value) : '')}
                                    />
                                </div>
                            </div>
                        )}

                        {selectedProfId && professionals.length > 0 && (
                            <div className="space-y-1 animate-fade-in">
                                <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Selecione o Profissional</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Stethoscope className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <select 
                                        className="w-full pl-11 pr-10 py-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none appearance-none font-medium text-white cursor-pointer transition-colors hover:bg-emerald-900"
                                        value={selectedProfId}
                                        onChange={(e) => setSelectedProfId(e.target.value)}
                                    >
                                        {professionals.map(prof => (
                                            <option key={prof.id} value={prof.id} className="text-gray-800">{prof.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-emerald-400">
                                        <ChevronDown size={20} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-emerald-200 ml-1 uppercase tracking-wide">Preferência de Dieta</label>
                            <select 
                                className="w-full px-4 py-3 bg-emerald-950/40 border border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-emerald-400 outline-none text-white"
                                value={regDietType}
                                onChange={(e) => setRegDietType(e.target.value)}
                            >
                                <option className="text-gray-800" value="Balanceada">Balanceada</option>
                                <option className="text-gray-800" value="Low Carb">Low Carb</option>
                                <option className="text-gray-800" value="Cetogênica">Cetogênica</option>
                                <option className="text-gray-800" value="Vegetariana">Vegetariana</option>
                                <option className="text-gray-800" value="Vegana">Vegana</option>
                            </select>
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white hover:bg-emerald-50 text-emerald-900 font-bold py-3.5 rounded-xl mt-4 flex items-center justify-center gap-2"
                >
                    {loading ? <span className="w-5 h-5 border-2 border-emerald-900/30 border-t-emerald-900 rounded-full animate-spin"></span> : 'Criar Conta'}
                </button>
            </form>
        )}

        <div className="mt-8 pt-6 border-t border-emerald-800 text-center">
           {!isForgotPassword && (
               <button 
                 onClick={() => setIsRegistering(!isRegistering)}
                 className="text-sm text-emerald-300 hover:text-white transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
               >
                 {isRegistering ? (
                     <>
                        <ChevronLeft size={16} /> Já tem uma conta? Faça Login
                     </>
                 ) : 'Não tem conta? Registre-se'}
               </button>
           )}
           {isForgotPassword && (
               <button 
                onClick={() => setIsForgotPassword(false)}
                className="text-sm text-emerald-300 hover:text-white transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
               >
                   <ChevronLeft size={16} /> Voltar para o Login
               </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default Login;