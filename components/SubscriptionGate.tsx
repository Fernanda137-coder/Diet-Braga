import React, { useState } from 'react';
import { Check, Star, Shield, Zap, CreditCard, Lock, Sparkles, User, Briefcase } from 'lucide-react';

interface SubscriptionGateProps {
    userType: 'PROFESSIONAL' | 'PATIENT';
    userName: string;
    onSubscribe: () => void;
    onLogout: () => void;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ userType, userName, onSubscribe, onLogout }) => {
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

    const handlePayment = () => {
        setLoading(true);
        // Simulating API call for payment
        setTimeout(() => {
            onSubscribe();
            setLoading(false);
        }, 2000);
    };

    const isProf = userType === 'PROFESSIONAL';

    const features = isProf ? [
        "Gestão ilimitada de pacientes",
        "Agenda inteligente e lembretes",
        "Geração de Dietas com IA",
        "Prontuário eletrônico completo",
        "Link de pagamento PIX integrado"
    ] : [
        "Acesso ao aplicativo móvel",
        "Diário alimentar com IA",
        "Gerador de treinos personalizados",
        "Chat com nutricionista (se vinculado)",
        "Acompanhamento de progresso avançado"
    ];

    const price = isProf ? 89.90 : 19.90;
    const yearlyPrice = isProf ? 899.90 : 199.90;

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-900/40"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="bg-white/95 backdrop-blur-xl max-w-5xl w-full rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row animate-slide-up border border-white/20">
                
                {/* Left Side: Value Prop */}
                <div className="md:w-5/12 bg-gradient-to-br from-emerald-800 to-teal-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    <div className="relative z-10">
                        <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
                            {isProf ? <Briefcase className="text-white" /> : <User className="text-white" />}
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Diet Braga <span className="text-emerald-300">Premium</span></h1>
                        <p className="text-emerald-100 opacity-90">
                            {isProf 
                             ? "A ferramenta definitiva para nutricionistas que desejam escalar seus atendimentos." 
                             : "Sua saúde em outro nível. Desbloqueie todo o potencial do seu corpo."}
                        </p>
                    </div>

                    <div className="space-y-4 mt-8 relative z-10">
                        {features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-300">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                                <span className="text-sm font-medium">{feat}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 relative z-10">
                        <div className="flex items-center gap-3 opacity-70 mb-4">
                            <Shield size={16} />
                            <span className="text-xs">Pagamento seguro via Stripe/PIX</span>
                        </div>
                        <button onClick={onLogout} className="text-xs text-emerald-300 hover:text-white underline transition-colors">
                            Sair e entrar com outra conta
                        </button>
                    </div>
                </div>

                {/* Right Side: Payment Form */}
                <div className="md:w-7/12 p-10 flex flex-col justify-center bg-white">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Escolha seu Plano</h2>
                        <p className="text-gray-500 text-sm mt-1">Olá, {userName}. Sua conta está criada, ative-a agora.</p>
                    </div>

                    {/* Plan Switcher */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-100 p-1.5 rounded-2xl inline-flex relative">
                            <button 
                                onClick={() => setSelectedPlan('MONTHLY')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative z-10 ${selectedPlan === 'MONTHLY' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                            >
                                Mensal
                            </button>
                            <button 
                                onClick={() => setSelectedPlan('YEARLY')}
                                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all relative z-10 ${selectedPlan === 'YEARLY' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                            >
                                Anual <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 rounded ml-1">-20%</span>
                            </button>
                        </div>
                    </div>

                    {/* Price Display */}
                    <div className="text-center mb-8">
                        <div className="flex items-start justify-center gap-1">
                            <span className="text-lg font-medium text-gray-400 mt-2">R$</span>
                            <span className="text-6xl font-black text-gray-800 tracking-tighter">
                                {selectedPlan === 'MONTHLY' ? price.toFixed(2).replace('.', ',') : (yearlyPrice/12).toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-lg font-medium text-gray-400 mt-auto mb-2">/mês</span>
                        </div>
                        {selectedPlan === 'YEARLY' && (
                            <p className="text-emerald-600 text-sm font-bold mt-2 bg-emerald-50 inline-block px-3 py-1 rounded-full">
                                Cobrado R$ {yearlyPrice.toFixed(2).replace('.', ',')} anualmente
                            </p>
                        )}
                    </div>

                    {/* Payment Button */}
                    <button 
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-gray-200 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processando...
                            </div>
                        ) : (
                            <>
                                <CreditCard size={20} className="group-hover:text-emerald-400 transition-colors" />
                                Assinar Agora
                            </>
                        )}
                    </button>

                    <div className="mt-6 flex justify-center gap-4 text-gray-400">
                        <Lock size={16} />
                        <span className="text-xs">Seus dados estão protegidos com criptografia de ponta a ponta.</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionGate;