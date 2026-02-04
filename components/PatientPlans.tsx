import React, { useState, useRef } from 'react';
import { ProfessionalProfile, Patient, ServicePlan, PaymentStatus } from '../types';
import { CreditCard, Upload, CheckCircle, FileCheck, Loader2, QrCode, Tag, Check, Send, User, Crown, Star, Copy, ShieldCheck, Stethoscope, Search, ArrowRight, Zap, Smartphone, CheckSquare } from 'lucide-react';

interface PatientPlansProps {
    professional: ProfessionalProfile;
    patient: Patient;
    onUploadProof: (file: string, type: 'image' | 'pdf') => void;
    professionals?: ProfessionalProfile[]; // New prop for discovery
    onSelectProfessional?: (profId: string, planId: string) => void; // New prop for migration
    onAppSubscribe?: (planType: 'MONTHLY' | 'SEMESTRAL') => void; // New prop for app subscription
}

const PatientPlans: React.FC<PatientPlansProps> = ({ professional, patient, onUploadProof, professionals = [], onSelectProfessional, onAppSubscribe }) => {
    const [proofFile, setProofFile] = useState<string | null>(null);
    const [proofType, setProofType] = useState<'image' | 'pdf'>('image');
    const [fileName, setFileName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Discovery State
    const [viewMode, setViewMode] = useState<'APP_SUBSCRIPTION' | 'FIND_PROFESSIONAL' | 'PROFESSIONAL_PLANS'>('APP_SUBSCRIPTION');
    const [selectedProf, setSelectedProf] = useState<ProfessionalProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // If patient already has a professional (even if pending), force view to Professional Plans or Status
    const isLinked = !!patient.professionalId;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setProofType(file.type === 'application/pdf' ? 'pdf' : 'image');
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofFile(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProof = () => {
        if (!proofFile) return;
        setIsUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            onUploadProof(proofFile, proofType);
            setIsUploading(false);
            alert("Comprovante enviado! Aguarde a confirmação do nutricionista para a liberação do acesso completo.");
        }, 1500);
    };

    const copyPix = () => {
        if (professional.pixKey) {
            navigator.clipboard.writeText(professional.pixKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleSubscribeApp = (type: 'MONTHLY' | 'SEMESTRAL') => {
        if(confirm(`Confirmar assinatura ${type === 'MONTHLY' ? 'Mensal' : 'Semestral'}?`)) {
            if(onAppSubscribe) onAppSubscribe(type);
        }
    }

    const filteredProfessionals = professionals.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- RENDER CONDITION 1: PREMIUM ACTIVE (App or Professional) ---
    if (patient.paymentStatus === 'APPROVED' || patient.subscriptionStatus === 'ACTIVE') {
        const isAppSub = patient.subscriptionStatus === 'ACTIVE' && !patient.professionalId;
        
        return (
            <div className="space-y-8 animate-fade-in relative">
                {/* Confetti Effect Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-10 left-[10%] w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="absolute top-20 right-[20%] w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-75"></div>
                    <div className="absolute bottom-40 left-[15%] w-4 h-4 bg-purple-400 rounded-full animate-pulse delay-150"></div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30 text-gray-900 shrink-0">
                            <Crown size={48} fill="currentColor" />
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-emerald-300 text-xs font-bold mb-2 border border-white/10">
                                <ShieldCheck size={12} /> Assinatura Ativa
                            </div>
                            <h2 className="text-4xl font-bold mb-2">Você é Premium!</h2>
                            <p className="text-emerald-100/80 text-lg">
                                Parabéns, {patient.name.split(' ')[0]}. Seu acesso completo à plataforma está liberado.
                            </p>
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:bg-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-2 text-emerald-300 font-bold">
                                <CheckCircle size={18} /> Dieta Completa
                            </div>
                            <p className="text-xs text-gray-300">Acesso ilimitado ao plano alimentar.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:bg-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-2 text-emerald-300 font-bold">
                                <CheckCircle size={18} /> Treinos Personalizados
                            </div>
                            <p className="text-xs text-gray-300">Visualize e registre seus treinos diários.</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:bg-white/20 transition-colors">
                            <div className="flex items-center gap-3 mb-2 text-emerald-300 font-bold">
                                <CheckCircle size={18} /> Evolução Detalhada
                            </div>
                            <p className="text-xs text-gray-300">Gráficos de peso, medidas e fotos de progresso.</p>
                        </div>
                    </div>
                </div>

                {/* Professional Info OR Migration CTA */}
                {isLinked ? (
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                            <User className="text-emerald-600"/> Seu Nutricionista
                        </h3>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gray-100 rounded-full overflow-hidden border-2 border-emerald-500">
                                {professional.photoUrl ? (
                                    <img src={professional.photoUrl} className="h-full w-full object-cover" alt="Nutri" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-emerald-100 text-emerald-600 font-bold text-xl">
                                        {professional.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-lg">{professional.name}</p>
                                <p className="text-gray-500 text-sm">{professional.specialty} • CRN {professional.crn}</p>
                                <p className="text-emerald-600 text-xs font-bold mt-1">Acompanhamento Ativo</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-3xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-emerald-800 font-bold text-lg mb-1">Quer levar seus resultados além?</h3>
                            <p className="text-emerald-600/80 text-sm">Contrate um nutricionista para um acompanhamento 100% personalizado.</p>
                        </div>
                        <button 
                            onClick={() => { setViewMode('FIND_PROFESSIONAL'); }} 
                            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2"
                        >
                            Encontrar Profissional <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // --- RENDER CONDITION 2: SOLO PATIENT FLOW (Subscription or Find Nutri) ---
    if (!isLinked && viewMode === 'APP_SUBSCRIPTION') {
        return (
            <div className="space-y-8 animate-fade-in">
                <header>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Smartphone className="text-emerald-600" /> Assinatura do App
                    </h2>
                    <p className="text-gray-500 mt-2">Escolha como deseja desbloquear as ferramentas premium.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Monthly Plan */}
                    <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Zap size={100} className="text-gray-900" />
                        </div>
                        <h3 className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-2">Mensal</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-lg font-bold text-gray-400">R$</span>
                            <span className="text-5xl font-black text-gray-900">19,90</span>
                            <span className="text-gray-400 font-medium">/mês</span>
                        </div>
                        <ul className="space-y-3 mb-8">
                            <li className="flex gap-3 text-sm text-gray-600"><CheckCircle size={18} className="text-emerald-500" /> Acesso ao Diário com IA</li>
                            <li className="flex gap-3 text-sm text-gray-600"><CheckCircle size={18} className="text-emerald-500" /> Treinos Personalizados</li>
                            <li className="flex gap-3 text-sm text-gray-600"><CheckCircle size={18} className="text-emerald-500" /> Gráficos de Evolução</li>
                        </ul>
                        <button 
                            onClick={() => handleSubscribeApp('MONTHLY')}
                            className="w-full py-4 rounded-xl border-2 border-gray-900 text-gray-900 font-bold hover:bg-gray-900 hover:text-white transition-all"
                        >
                            Assinar Mensal
                        </button>
                    </div>

                    {/* Semestral Plan (Best Value) */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-700 shadow-xl relative overflow-hidden transform hover:-translate-y-1 transition-all">
                        <div className="absolute top-4 right-4 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                            Melhor Valor
                        </div>
                        <h3 className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-2">Semestral</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-lg font-bold text-gray-500">R$</span>
                            <span className="text-5xl font-black text-white">16,65</span>
                            <span className="text-gray-400 font-medium">/mês</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-6 bg-white/10 inline-block px-2 py-1 rounded">Cobrado R$ 99,90 a cada 6 meses</p>
                        
                        <ul className="space-y-3 mb-8">
                            <li className="flex gap-3 text-sm text-gray-300"><CheckCircle size={18} className="text-emerald-400" /> Todas as funções liberadas</li>
                            <li className="flex gap-3 text-sm text-gray-300"><CheckCircle size={18} className="text-emerald-400" /> Economize 17%</li>
                            <li className="flex gap-3 text-sm text-gray-300"><CheckCircle size={18} className="text-emerald-400" /> Prioridade no suporte</li>
                        </ul>
                        <button 
                            onClick={() => handleSubscribeApp('SEMESTRAL')}
                            className="w-full py-4 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/50"
                        >
                            Assinar Semestral
                        </button>
                    </div>
                </div>

                <div className="text-center pt-8 border-t border-gray-100">
                    <p className="text-gray-500 mb-4">Prefere um acompanhamento humano e personalizado?</p>
                    <button 
                        onClick={() => setViewMode('FIND_PROFESSIONAL')}
                        className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline"
                    >
                        <Stethoscope size={20} /> Encontrar um Nutricionista
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER CONDITION 3: FIND PROFESSIONAL ---
    if (!isLinked && viewMode === 'FIND_PROFESSIONAL') {
        return (
            <div className="space-y-6 animate-fade-in">
                <header className="flex items-center justify-between">
                    <div>
                        <button onClick={() => setViewMode('APP_SUBSCRIPTION')} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-2">
                            <ArrowRight size={14} className="rotate-180" /> Voltar para Planos do App
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800">Encontrar Especialista</h2>
                    </div>
                </header>

                <div className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou especialidade..." 
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredProfessionals.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">Nenhum profissional encontrado.</div>
                    ) : (
                        filteredProfessionals.map(prof => (
                            <div key={prof.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-center gap-6">
                                <div className="h-20 w-20 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                                    {prof.photoUrl ? <img src={prof.photoUrl} className="w-full h-full object-cover" /> : <User size={32} className="text-gray-400" />}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl font-bold text-gray-900">{prof.name}</h3>
                                    <p className="text-emerald-600 font-medium">{prof.specialty}</p>
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{prof.bio || "Nutricionista focado em resultados."}</p>
                                </div>
                                <button 
                                    onClick={() => { setSelectedProf(prof); setViewMode('PROFESSIONAL_PLANS'); }}
                                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors"
                                >
                                    Ver Planos
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER CONDITION 4: VIEW SPECIFIC PROFESSIONAL PLANS ---
    if (!isLinked && viewMode === 'PROFESSIONAL_PLANS' && selectedProf) {
        return (
            <div className="space-y-8 animate-fade-in">
                <header>
                    <button onClick={() => setViewMode('FIND_PROFESSIONAL')} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 mb-4">
                        <ArrowRight size={14} className="rotate-180" /> Voltar para lista
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gray-100 rounded-full overflow-hidden">
                             {selectedProf.photoUrl ? <img src={selectedProf.photoUrl} className="w-full h-full object-cover" /> : <User size={24} className="m-3 text-gray-400" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Planos de {selectedProf.name}</h2>
                            <p className="text-emerald-600 font-medium">{selectedProf.specialty}</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedProf.plans && selectedProf.plans.length > 0 ? (
                        selectedProf.plans.map(plan => (
                            <div key={plan.id} className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-emerald-500 hover:shadow-xl transition-all relative group">
                                <h4 className="text-xl font-bold text-gray-800 mb-2">{plan.title}</h4>
                                <p className="text-gray-500 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                                <div className="text-3xl font-bold text-emerald-600 mb-6">R$ {plan.price.toFixed(2)}</div>
                                
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-gray-700">
                                            <CheckSquare size={18} className="text-emerald-500 shrink-0" /> {f}
                                        </li>
                                    ))}
                                </ul>

                                <button 
                                    onClick={() => onSelectProfessional && onSelectProfessional(selectedProf.id, plan.id)}
                                    className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                                >
                                    Contratar Plano
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                            Este profissional ainda não cadastrou planos.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER CONDITION 5: PENDING PAYMENT (Linked to Professional) ---
    // User already has a professional but status is PENDING or REJECTED
    return (
        <div className="space-y-8 animate-fade-in">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <CreditCard className="text-emerald-600" /> Planos & Pagamento
                    </h2>
                    <p className="text-gray-500">Realize o pagamento para liberar seu acompanhamento.</p>
                </div>
                {patient.paymentStatus === 'PENDING' && (
                    <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                        <Loader2 size={16} className="animate-spin" /> Em Análise
                    </span>
                )}
            </header>

            {/* NUTRITIONIST PROFILE CARD */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative z-10 bg-gray-100">
                        {professional.photoUrl ? (
                            <img src={professional.photoUrl} alt={professional.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-20 transform translate-y-4"></div>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{professional.name}</h3>
                    <p className="text-emerald-600 font-medium mb-3">{professional.specialty}</p>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xl">
                        "{professional.bio || 'Especialista em transformar vidas através da nutrição.'}"
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">CRN: {professional.crn}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SELECTED PLAN INFO */}
                <div className="space-y-6">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <Star className="text-yellow-500" fill="currentColor" size={18} /> Plano Selecionado
                    </h3>
                    
                    {professional.plans?.filter(p => p.id === patient.planId).map(plan => (
                         <div key={plan.id} className="bg-white border-2 border-emerald-500 rounded-2xl p-6 relative overflow-hidden shadow-lg">
                            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">SEU PLANO</div>
                            
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div>
                                    <h4 className="font-bold text-xl text-gray-800">{plan.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                                </div>
                                <div className="text-right mt-6">
                                    <span className="text-3xl font-bold text-emerald-600">R$ {plan.price.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4">
                                <ul className="space-y-2">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="bg-emerald-100 p-0.5 rounded-full">
                                                <Check size={10} className="text-emerald-700" strokeWidth={3} />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                    {!patient.planId && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm">
                            Plano não identificado. Entre em contato com o suporte.
                        </div>
                    )}
                </div>

                {/* PAYMENT SECTION */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-white to-gray-50 p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                        <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
                            <QrCode className="text-emerald-600"/> Pagamento via PIX
                        </h3>
                        
                        <div className="bg-gray-900 p-5 rounded-2xl text-center mb-6 relative group shadow-inner">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-2 tracking-widest">Chave PIX do Profissional</p>
                            <div className="text-white font-mono text-lg break-all font-bold mb-2">
                                {professional.pixKey || "Chave não informada"}
                            </div>
                            <button 
                                onClick={copyPix}
                                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? "Copiado!" : "Copiar Chave"}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-700 text-sm">Anexar Comprovante</h4>
                            
                            {patient.paymentProofUrl && !proofFile ? (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                                    <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                                        <FileCheck size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-800">Comprovante Enviado</p>
                                        <p className="text-xs text-emerald-600">Em análise. Aguarde confirmação.</p>
                                    </div>
                                    <div className="ml-auto">
                                        <CheckCircle size={20} className="text-emerald-500" />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <label className={`block w-full cursor-pointer group border-2 border-dashed rounded-xl p-6 transition-all text-center ${proofFile ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 bg-white hover:bg-gray-50'}`}>
                                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} ref={fileInputRef} />
                                        {proofFile ? (
                                            <div className="flex flex-col items-center text-emerald-600">
                                                <FileCheck size={32} className="mb-2" />
                                                <span className="font-bold text-sm">{fileName}</span>
                                                <span className="text-xs mt-1 text-emerald-500">Clique para alterar</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                                                <Upload size={32} className="mb-2" />
                                                <span className="font-medium text-sm text-gray-600">Clique para selecionar o arquivo</span>
                                                <span className="text-xs mt-1">Imagem (JPG, PNG) ou PDF</span>
                                            </div>
                                        )}
                                    </label>

                                    <button 
                                        onClick={handleSubmitProof}
                                        disabled={!proofFile || isUploading}
                                        className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-1"
                                    >
                                        {isUploading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                        {isUploading ? "Enviando..." : "Confirmar Envio"}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PatientPlans;