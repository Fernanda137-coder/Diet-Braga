import React, { useMemo } from 'react';
import { Patient, Gender, ProfessionalProfile } from '../types';
import { Ruler, Weight, Activity, HeartPulse, FileText, User, Target, Calculator, ScanLine, Info, Stethoscope, Lock, Crown, Dna } from 'lucide-react';
import { AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Area } from 'recharts';

interface PatientHealthRecordProps {
  patient: Patient;
  professional?: ProfessionalProfile;
  onNavigateToPlans?: () => void;
}

const PatientHealthRecord: React.FC<PatientHealthRecordProps> = ({ patient, professional, onNavigateToPlans }) => {
  
  // Check if content should be locked (Patient has a professional but is PENDING)
  const isPremiumLocked = patient.professionalId && patient.paymentStatus === 'PENDING';

  // IMC Calculation
  const imc = useMemo(() => {
    if (patient.height && patient.weight) {
      const heightInMeters = patient.height / 100;
      return (patient.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return 'N/A';
  }, [patient.weight, patient.height]);

  const imcStatus = useMemo(() => {
    const imcVal = parseFloat(imc);
    if (isNaN(imcVal)) return '';
    if (imcVal < 18.5) return 'Abaixo do Peso';
    if (imcVal < 24.9) return 'Peso Normal';
    if (imcVal < 29.9) return 'Sobrepeso';
    return 'Obesidade';
  }, [imc]);

  // Body Fat Calculation (Jackson-Pollock 7)
  const bodyFat = useMemo(() => {
    const s = patient.skinfolds;
    const age = patient.age || 0;
    const gender = patient.gender;

    if (!s) return null;

    const sum7 = 
      (s.chest || 0) + 
      (s.midAxillary || 0) + 
      (s.triceps || 0) + 
      (s.subscapular || 0) + 
      (s.abdominal || 0) + 
      (s.suprailiac || 0) + 
      (s.thigh || 0);

    if (sum7 === 0) return null;

    let bodyDensity = 0;

    if (gender === Gender.MALE) {
      bodyDensity = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 * sum7) - (0.00028826 * age);
    } else {
      bodyDensity = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 * sum7) - (0.00012828 * age);
    }

    const bf = (495 / bodyDensity) - 450;
    return isNaN(bf) ? null : bf.toFixed(1);
  }, [patient.skinfolds, patient.age, patient.gender]);

  const chartData = patient.history.map(h => ({
    date: new Date(h.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    weight: h.weight
  }));

  const renderMeasurementItem = (label: string, value?: number) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
      <span className="text-gray-500 text-sm font-medium">{label}</span>
      <span className="text-gray-800 font-bold">{value && value > 0 ? `${value} cm` : '-'}</span>
    </div>
  );

  const PremiumLockOverlay = () => (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center rounded-3xl border border-gray-100">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center text-yellow-400 mb-4 shadow-lg">
              <Lock size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Dados Restritos</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
              A avaliação antropométrica detalhada está disponível apenas para pacientes com plano ativo.
          </p>
          <button 
            onClick={onNavigateToPlans}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2 transform hover:-translate-y-1"
          >
              <Crown size={18} className="text-yellow-400" fill="currentColor"/> Liberar Acesso Completo
          </button>
      </div>
  );

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-marsala-800 to-marsala-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-rose-400 opacity-10 rounded-full blur-2xl"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 mb-6">
          <div className="h-28 w-28 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border-4 border-white/10 shadow-inner shrink-0">
             {patient.photoUrl ? (
                 <img src={patient.photoUrl} alt={patient.name} className="h-full w-full rounded-full object-cover" />
             ) : (
                 <User size={48} className="text-white" strokeWidth={1.5} />
             )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">{patient.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-marsala-100 text-sm font-medium">
              <span className="bg-white/10 px-4 py-1.5 rounded-full flex items-center gap-2"><User size={14}/> {patient.age} anos</span>
              <span className="bg-white/10 px-4 py-1.5 rounded-full">{patient.gender}</span>
              <span className="bg-marsala-500/80 px-4 py-1.5 rounded-full text-white shadow-sm flex items-center gap-2 border border-marsala-400/30">
                <Target size={14}/> {patient.goal}
              </span>
            </div>
          </div>
          
          <div className="flex gap-8 bg-black/20 p-4 rounded-2xl backdrop-blur-sm border border-white/5">
            <div className="text-center">
              <p className="text-marsala-300 text-[10px] uppercase tracking-wider font-bold mb-1">Peso Atual</p>
              <p className="text-3xl font-bold">{patient.weight} <span className="text-lg font-normal opacity-70">kg</span></p>
            </div>
            <div className="w-px bg-white/10"></div>
            <div className="text-center">
              <p className="text-marsala-300 text-[10px] uppercase tracking-wider font-bold mb-1">Altura</p>
              <p className="text-3xl font-bold">{patient.height} <span className="text-lg font-normal opacity-70">cm</span></p>
            </div>
          </div>
        </div>

        {/* Nutritionist Info Section */}
        {professional && (
           <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Stethoscope size={20} className="text-marsala-200" />
                 </div>
                 <div>
                    <p className="text-marsala-200 text-[10px] font-bold uppercase tracking-wide">Nutricionista Responsável</p>
                    <p className="text-white font-bold text-lg leading-tight">{professional.name}</p>
                 </div>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                 <p className="text-marsala-200 text-[10px] font-bold uppercase text-center md:text-right">Registro Profissional</p>
                 <p className="text-white font-mono text-sm tracking-wide">{professional.crn}</p>
              </div>
           </div>
        )}
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* IMC Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
          <div className="p-3 bg-blue-50 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
             <Activity className="text-blue-600" size={28} strokeWidth={1.5} />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wide">IMC (Índice de Massa)</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-4xl font-bold text-gray-800">{imc}</p>
            <span className="text-gray-400 font-medium text-sm">kg/m²</span>
          </div>
          <span className={`mt-3 px-3 py-1 rounded-full text-xs font-bold ${
            imcStatus === 'Peso Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {imcStatus}
          </span>
        </div>

        {/* Body Fat Card */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-rose-500"></div>
          {/* Conditional Lock for Body Fat if no data or locked */}
          {isPremiumLocked && <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center"><Lock className="text-gray-400" /></div>}
          
          <div className="p-3 bg-orange-50 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
             <Calculator className="text-orange-600" size={28} strokeWidth={1.5} />
          </div>
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wide">Gordura Corporal Est.</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-4xl font-bold text-gray-800">{bodyFat || '--'}</p>
            <span className="text-gray-400 font-medium text-sm">%</span>
          </div>
           <p className="text-[10px] text-gray-400 mt-2">Protocolo Jackson-Pollock 7</p>
        </div>

        {/* Clinical Summary */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300 md:col-span-2 lg:col-span-1">
             <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-400 to-red-500"></div>
             <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-rose-50 rounded-xl">
                    <HeartPulse className="text-rose-500" size={20} />
                 </div>
                 <h3 className="font-bold text-gray-800">Resumo Clínico</h3>
             </div>
             
             <div className="space-y-4 flex-1">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Patologias e Condições</p>
                    <div className="flex flex-wrap gap-2">
                        {patient.pathologies && patient.pathologies.length > 0 ? (
                            patient.pathologies.map(p => (
                                <span key={p} className="bg-rose-50 text-rose-700 px-2 py-1 rounded-md text-xs font-bold border border-rose-100">{p}</span>
                            ))
                        ) : <span className="text-gray-400 text-sm italic">Nenhuma registrada</span>}
                    </div>
                </div>
                
                {/* Family History Section */}
                {patient.familyHistory && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1.5 flex items-center gap-1"><Dna size={12}/> Histórico Familiar</p>
                        <p className="text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 leading-snug">
                            {patient.familyHistory}
                        </p>
                    </div>
                )}

                <div>
                     <p className="text-xs font-bold text-gray-400 uppercase mb-1.5">Alergias</p>
                     <p className="text-sm font-medium text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                         {patient.allergies || 'Nenhuma alergia relatada'}
                     </p>
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Measurements Column */}
         <div className="lg:col-span-2 space-y-6">
             {/* Weight Chart */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Weight className="text-marsala-500" size={20}/> Evolução de Peso
                    </h3>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#955251" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#955251" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="weight" stroke="#955251" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
             </div>

             {/* Detailed Measurements Grid */}
             <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                {isPremiumLocked && <PremiumLockOverlay />}
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6">
                    <Ruler className="text-blue-500" size={20}/> Perímetros e Circunferências
                </h3>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${isPremiumLocked ? 'blur-sm opacity-50' : ''}`}>
                    {/* Tronco */}
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-blue-600 uppercase mb-3 bg-blue-50 inline-block px-2 py-1 rounded">Tronco</h4>
                        {renderMeasurementItem('Ombros', patient.measurements?.shoulder)}
                        {renderMeasurementItem('Tórax', patient.measurements?.chest)}
                        {renderMeasurementItem('Cintura', patient.measurements?.waist)}
                        {renderMeasurementItem('Abdômen', patient.measurements?.abdomen)}
                        {renderMeasurementItem('Quadril', patient.measurements?.hips)}
                    </div>

                    {/* Membros */}
                    <div className="space-y-1">
                        <h4 className="text-xs font-bold text-blue-600 uppercase mb-3 bg-blue-50 inline-block px-2 py-1 rounded">Membros (Dir / Esq)</h4>
                        {renderMeasurementItem('Braço Relaxado', patient.measurements?.armRight)} 
                        {/* Note: Simplified display */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm font-medium">Braços</span>
                            <span className="text-gray-800 font-bold text-sm">
                                {patient.measurements?.armRight || '-'} <span className="text-gray-300">/</span> {patient.measurements?.armLeft || '-'}
                            </span>
                        </div>
                         <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm font-medium">Antebraços</span>
                            <span className="text-gray-800 font-bold text-sm">
                                {patient.measurements?.forearmRight || '-'} <span className="text-gray-300">/</span> {patient.measurements?.forearmLeft || '-'}
                            </span>
                        </div>
                         <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm font-medium">Coxas</span>
                            <span className="text-gray-800 font-bold text-sm">
                                {patient.measurements?.thighRight || '-'} <span className="text-gray-300">/</span> {patient.measurements?.thighLeft || '-'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-gray-500 text-sm font-medium">Panturrilhas</span>
                            <span className="text-gray-800 font-bold text-sm">
                                {patient.measurements?.calfRight || '-'} <span className="text-gray-300">/</span> {patient.measurements?.calfLeft || '-'}
                            </span>
                        </div>
                    </div>
                </div>
             </div>
         </div>

         {/* Sidebar: Skinfolds & Notes */}
         <div className="space-y-6">
            {/* Skinfolds Card */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                {isPremiumLocked && <PremiumLockOverlay />}
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-purple-50 rounded-xl text-purple-600">
                        <ScanLine size={20} />
                    </div>
                    <h3 className="font-bold text-gray-800">Dobras Cutâneas</h3>
                </div>
                
                <div className={`space-y-3 ${isPremiumLocked ? 'blur-sm opacity-50' : ''}`}>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Tríceps</p>
                            <p className="font-bold text-gray-800">{patient.skinfolds?.triceps || '-'} <span className="text-[10px] font-normal text-gray-500">mm</span></p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Subescapular</p>
                            <p className="font-bold text-gray-800">{patient.skinfolds?.subscapular || '-'} <span className="text-[10px] font-normal text-gray-500">mm</span></p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Bíceps</p>
                            <p className="font-bold text-gray-800">{patient.skinfolds?.biceps || '-'} <span className="text-[10px] font-normal text-gray-500">mm</span></p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Axilar M.</p>
                            <p className="font-bold text-gray-800">{patient.skinfolds?.midAxillary || '-'} <span className="text-[10px] font-normal text-gray-500">mm</span></p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Supra-ilíaca</p>
                            <p className="font-bold text-gray-800">{patient.skinfolds?.suprailiac || '-'} <span className="text-[10px] font-normal text-gray-500">mm</span></p>
                        </div>
                         <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Abdominal</p>
                            <p className="font-bold text-gray-800">{patient.skinfolds?.abdominal || '-'} <span className="text-[10px] font-normal text-gray-500">mm</span></p>
                        </div>
                         <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Coxa</p>
                            <p className="font-bold text-gray-800">{patient.skinfolds?.thigh || '-'} <span className="text-[10px] font-normal text-gray-500">mm</span></p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-400 mt-2 bg-gray-50 p-2 rounded-lg">
                        <Info size={14} className="shrink-0 mt-0.5" />
                        Base para cálculo de gordura corporal (Jackson-Pollock 7 dobras).
                    </div>
                </div>
            </div>

            {/* Notes / Prontuário Text */}
            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 relative shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <FileText size={20} />
                    </div>
                    <h3 className="font-bold text-amber-900">Evolução Clínica</h3>
                </div>
                <div className="bg-white/60 p-4 rounded-xl border border-amber-100/50 min-h-[150px]">
                    <p className="text-amber-900/80 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                        {patient.notes || 'Nenhuma observação registrada pelo profissional.'}
                    </p>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PatientHealthRecord;