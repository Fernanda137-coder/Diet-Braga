import React, { useState, useMemo } from 'react';
import { Patient, Gender, Skinfolds, BodyMeasurements, PaymentStatus } from '../types';
import { Plus, Search, User, AlertCircle, FileText, Ruler, ScanLine, HeartPulse, Check, Calculator, Clock, CheckCircle, XCircle, FileImage, File, Edit2, Save, ZoomIn, Eye, Download, Trash2, Bell, UserMinus, ShieldAlert, X } from 'lucide-react';

interface PatientManagerProps {
  patients: Patient[];
  onAddPatient: (p: Patient) => void;
  onUpdatePatient?: (p: Patient) => void; // New prop for updating
  onSelectPatient: (p: Patient) => void;
  selectedPatientId?: string;
  onUpdatePatientStatus?: (id: string, status: PaymentStatus, rejectionReason?: string) => void;
  onDeletePatient?: (id: string) => void; // New prop for deletion
  onUnlinkPatient?: (id: string) => void; // New prop for removing premium/unlink
}

const COMMON_PATHOLOGIES = [
  "Diabetes Tipo 1",
  "Diabetes Tipo 2",
  "Hipertensão Arterial",
  "Obesidade",
  "Dislipidemia (Colesterol Alto)",
  "Gastrite",
  "Refluxo Gastroesofágico",
  "Síndrome do Intestino Irritável",
  "Doença Celíaca",
  "Intolerância à Lactose",
  "Hipotireoidismo",
  "Anemia Ferropriva",
  "Esteatose Hepática",
  "Insuficiência Renal"
];

const PatientManager: React.FC<PatientManagerProps> = ({ patients, onAddPatient, onUpdatePatient, onSelectPatient, selectedPatientId, onUpdatePatientStatus, onDeletePatient, onUnlinkPatient }) => {
  const [showForm, setShowForm] = useState(false);
  const [viewProof, setViewProof] = useState<string | null>(null);
  
  // Custom Pathology State
  const [customPathology, setCustomPathology] = useState('');

  // State for editing an existing patient
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Default empty patient for new creation and for initializing edits
  const defaultPatient: Partial<Patient> = {
    name: '',
    age: 30,
    gender: Gender.FEMALE,
    weight: 70,
    height: 170,
    goal: 'Emagrecimento',
    allergies: '',
    restrictions: '',
    pathologies: [],
    familyHistory: '',
    notes: '',
    paymentStatus: 'APPROVED',
    skinfolds: {
      triceps: 0, subscapular: 0, biceps: 0, midAxillary: 0, chest: 0, abdominal: 0, suprailiac: 0, supraspinale: 0, thigh: 0, calf: 0
    },
    measurements: {
      shoulder: 0, chest: 0, waist: 0, abdomen: 0, hips: 0,
      armRight: 0, armLeft: 0, forearmRight: 0, forearmLeft: 0,
      thighRight: 0, thighLeft: 0, calfRight: 0, calfLeft: 0
    }
  };

  const [formData, setFormData] = useState<Partial<Patient>>(defaultPatient);

  const handleOpenNew = () => {
      setFormData(defaultPatient);
      setEditingPatient(null);
      setShowForm(true);
  }

  const handleOpenEdit = (patient: Patient) => {
      onSelectPatient(patient); // Also select in parent
      
      // Merge current patient data with default structure to ensure nested objects exist
      const safeData: Partial<Patient> = {
          ...defaultPatient,
          ...patient,
          measurements: { ...defaultPatient.measurements, ...(patient.measurements || {}) },
          skinfolds: { ...defaultPatient.skinfolds, ...(patient.skinfolds || {}) }
      };

      setFormData(safeData);
      setEditingPatient(patient);
      setShowForm(true);
  }

  const handleSkinfoldChange = (key: keyof Skinfolds, value: string) => {
    setFormData(prev => ({
      ...prev,
      skinfolds: {
        ...(prev.skinfolds || defaultPatient.skinfolds!),
        [key]: Number(value)
      }
    }));
  };

  const handleMeasurementChange = (key: keyof BodyMeasurements, value: string) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...(prev.measurements || defaultPatient.measurements!),
        [key]: Number(value)
      }
    }));
  };

  const togglePathology = (pathology: string) => {
    setFormData(prev => {
      const current = prev.pathologies || [];
      if (current.includes(pathology)) {
        return { ...prev, pathologies: current.filter(p => p !== pathology) };
      } else {
        return { ...prev, pathologies: [...current, pathology] };
      }
    });
  };

  const addCustomPathology = () => {
      if (customPathology.trim()) {
          togglePathology(customPathology.trim());
          setCustomPathology("");
      }
  };

  const addTimestampNote = () => {
      const now = new Date();
      const timestamp = `[${now.toLocaleDateString()} ${now.toLocaleTimeString()}] - `;
      setFormData(prev => ({
          ...prev,
          notes: prev.notes ? `${prev.notes}\n\n${timestamp}` : timestamp
      }));
  }

  // Handle Approval with Notification Simulation
  const handleApprovePatient = (patientId: string, patientName: string) => {
      if (onUpdatePatientStatus) {
          onUpdatePatientStatus(patientId, 'APPROVED');
          // Simulating notification
          alert(`✅ Paciente ${patientName} aprovado!\n\nUma notificação push/email foi enviada para o paciente informando que seu acesso foi liberado.`);
      }
  }

  const handleUnlink = (e: React.MouseEvent, patientId: string, patientName: string) => {
      e.stopPropagation();
      if (confirm(`ATENÇÃO: Deseja remover o acesso Premium de ${patientName}?\n\nO paciente perderá o acesso aos seus planos e passará a usar o aplicativo como usuário gratuito (Solo).`)) {
          if(onUnlinkPatient) onUnlinkPatient(patientId);
      }
  }

  // Cálculo de Gordura Jackson-Pollock (7 Dobras)
  const calculateBodyFat = useMemo(() => {
    const s = formData.skinfolds;
    const age = formData.age || 0;
    const gender = formData.gender;

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

    const bodyFatPercentage = (495 / bodyDensity) - 450;
    return isNaN(bodyFatPercentage) ? null : bodyFatPercentage.toFixed(2);
  }, [formData.skinfolds, formData.age, formData.gender]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPatient && onUpdatePatient) {
        // UPDATE MODE
        const updated: Patient = {
            ...editingPatient,
            ...formData as Patient,
            // Preserve history logic: add new entry only if weight changed
            history: (formData.weight !== editingPatient.weight) 
                ? [...editingPatient.history, { date: new Date().toISOString().split('T')[0], weight: formData.weight || 0 }]
                : editingPatient.history
        };
        onUpdatePatient(updated);
        alert("Paciente atualizado com sucesso!");
        setShowForm(false);
    } else {
        // CREATE MODE
        if (formData.name) {
            const patient: Patient = {
                id: Date.now().toString(),
                professionalId: '', 
                name: formData.name!,
                age: formData.age || 0,
                gender: formData.gender || Gender.OTHER,
                weight: formData.weight || 0,
                height: formData.height || 0,
                goal: formData.goal || '',
                allergies: formData.allergies || '',
                restrictions: formData.restrictions || '',
                pathologies: formData.pathologies || [],
                familyHistory: formData.familyHistory || '',
                notes: formData.notes || '',
                history: [{ date: new Date().toISOString().split('T')[0], weight: formData.weight || 0 }],
                skinfolds: formData.skinfolds as Skinfolds,
                measurements: formData.measurements as BodyMeasurements,
                paymentStatus: 'APPROVED'
            };
            onAddPatient(patient);
            setShowForm(false);
        }
    }
  };

  const pendingPatients = patients.filter(p => p.paymentStatus === 'PENDING');
  const approvedPatients = patients.filter(p => p.paymentStatus !== 'PENDING' && p.paymentStatus !== 'REJECTED');

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Gerenciar Pacientes</h2>
            <p className="text-gray-500 text-sm">Acompanhe solicitações e prontuários.</p>
        </div>
        {!showForm && (
            <button
            onClick={handleOpenNew}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-200 font-medium"
            >
            <Plus size={20} /> Novo Paciente
            </button>
        )}
      </div>

      {/* PENDING REQUESTS SECTION */}
      {!showForm && pendingPatients.length > 0 && (
         <div className="space-y-4">
            <div className="flex items-center gap-2 text-marsala-700 bg-marsala-50 px-4 py-2 rounded-lg self-start inline-flex border border-marsala-100">
                <Clock size={18} />
                <h3 className="font-bold text-sm uppercase tracking-wide">Solicitações Pendentes ({pendingPatients.length})</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {pendingPatients.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col group relative">
                     {/* Decorative Top Line */}
                     <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 to-marsala-400"></div>
                     
                     <div className="p-5 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg border border-orange-200">
                                {p.name.charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="font-bold text-gray-800 truncate" title={p.name}>{p.name}</h4>
                                <p className="text-xs text-gray-500 truncate" title={p.email}>{p.email}</p>
                            </div>
                        </div>

                        {/* Proof Area */}
                        <div className="mb-5 flex-1">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Comprovante</p>
                            {p.paymentProofUrl ? (
                                p.paymentProofType === 'pdf' ? (
                                    <div 
                                        onClick={() => setViewProof(p.id)}
                                        className="bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-colors group/proof"
                                    >
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <FileText className="text-red-500" size={20} />
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-red-700 block">Documento PDF</span>
                                            <span className="text-[10px] text-red-400 flex items-center gap-1 group-hover/proof:underline">
                                                Clique para abrir <Eye size={10} />
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => setViewProof(p.id)}
                                        className="relative h-32 w-full bg-gray-100 rounded-xl overflow-hidden cursor-pointer border border-gray-200 group/image"
                                    >
                                        <img src={p.paymentProofUrl} alt="Proof" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity backdrop-blur-[2px]">
                                            <div className="bg-white/20 p-2 rounded-full border border-white/50 text-white">
                                                <ZoomIn size={20} />
                                            </div>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center text-gray-400 text-xs">
                                    Nenhum comprovante anexado.
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-auto pt-4 border-t border-gray-50">
                            <button 
                                onClick={() => handleApprovePatient(p.id, p.name)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                            >
                                <Check size={14} /> Aprovar
                            </button>
                            <button 
                                onClick={() => onUpdatePatientStatus && onUpdatePatientStatus(p.id, 'REJECTED')}
                                className="flex-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                            >
                                <XCircle size={14} /> Rejeitar
                            </button>
                        </div>
                     </div>

                     {/* Proof Viewer Modal */}
                     {viewProof === p.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setViewProof(null)}>
                           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                                 <div>
                                     <h3 className="font-bold text-gray-800">Comprovante de Pagamento</h3>
                                     <p className="text-xs text-gray-500">Enviado por {p.name}</p>
                                 </div>
                                 <button onClick={() => setViewProof(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XCircle className="text-gray-500" /></button>
                              </div>
                              <div className="flex-1 bg-gray-50 p-6 overflow-auto flex items-center justify-center relative">
                                 {p.paymentProofType === 'pdf' ? (
                                    <iframe src={p.paymentProofUrl} className="w-full h-full rounded-lg border border-gray-300 shadow-sm min-h-[500px]" title="PDF Viewer"></iframe>
                                 ) : (
                                    <img src={p.paymentProofUrl} alt="Comprovante Full" className="max-w-full max-h-full rounded-lg shadow-lg object-contain" />
                                 )}
                              </div>
                              <div className="p-4 bg-white border-t border-gray-100 flex justify-end">
                                  <a href={p.paymentProofUrl} download={`comprovante-${p.name}`} className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
                                      <Download size={16} /> Baixar Arquivo
                                  </a>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Main List (Approved/Active) */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-700">Pacientes Ativos ({approvedPatients.length})</h3>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                    type="text"
                    placeholder="Buscar paciente..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all text-sm"
                    />
                </div>
            </div>
            <div className="divide-y divide-gray-100">
            {approvedPatients.map((p) => (
                <div
                key={p.id}
                onClick={() => handleOpenEdit(p)}
                className={`p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors ${selectedPatientId === p.id ? 'bg-emerald-50/50' : ''}`}
                >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-700 font-bold text-lg shadow-sm border border-emerald-200/50">
                    {p.name.charAt(0)}
                    </div>
                    <div>
                    <h4 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                        {p.name} 
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-100 text-emerald-700 p-1 rounded-full">
                            <Edit2 size={10} />
                        </span>
                    </h4>
                    <div className="flex flex-wrap gap-2 text-xs mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">{p.goal}</span>
                        {p.pathologies && p.pathologies.length > 0 && (
                        <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded flex items-center gap-1 border border-rose-100 font-medium">
                            <HeartPulse size={10} /> {p.pathologies.length} Patologia(s)
                        </span>
                        )}
                    </div>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p className="text-sm font-bold text-gray-800 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 mb-1 inline-block">
                        {p.weight} kg <span className="text-gray-300">|</span> {p.height} cm
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400 font-medium">{p.age} anos</p>
                        <div className="h-4 w-px bg-gray-200"></div>
                        
                        {/* UNLINK / REMOVE PREMIUM BUTTON */}
                        <button
                            onClick={(e) => handleUnlink(e, p.id, p.name)}
                            className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="Remover Premium / Desvincular"
                        >
                            <ShieldAlert size={16} />
                        </button>

                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeletePatient && onDeletePatient(p.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                            title="Excluir Paciente"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
                </div>
            ))}
            {approvedPatients.length === 0 && (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                    <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <User size={32} className="text-gray-300" />
                    </div>
                    <p>Nenhum paciente ativo no momento.</p>
                </div>
            )}
            </div>
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-slide-up">
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <User size={20} className={editingPatient ? "text-blue-600" : "text-emerald-600"} /> 
                {editingPatient ? `Editando: ${editingPatient.name}` : 'Novo Paciente'}
            </h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
              >
                <option value={Gender.MALE}>Masculino</option>
                <option value={Gender.FEMALE}>Feminino</option>
                <option value={Gender.OTHER}>Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="Ex: Hipertrofia, Emagrecimento..."
              />
            </div>
            
            <div className="bg-gray-50 p-4 rounded-xl md:col-span-2 grid grid-cols-2 gap-4">
               <h4 className="text-sm font-bold text-gray-600 md:col-span-2">Medidas Básicas</h4>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                  />
               </div>
            </div>

            {/* Seção de Patologias e Histórico */}
            <div className="md:col-span-2 bg-rose-50/50 p-4 rounded-xl border border-rose-200 shadow-sm space-y-4">
                <div className="space-y-3">
                    <label className="block text-sm font-bold text-rose-800 flex items-center gap-2">
                        <HeartPulse size={18} /> Patologias e Doenças Diagnosticadas
                    </label>
                    
                    {/* Common Selection */}
                    <div className="flex flex-wrap gap-2 mb-2">
                        {COMMON_PATHOLOGIES.map(p => (
                            <button
                                type="button"
                                key={p}
                                onClick={() => togglePathology(p)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                    formData.pathologies?.includes(p) 
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm' 
                                    : 'bg-white border-gray-200 text-gray-500 hover:border-rose-300'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Custom Input */}
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="Outra doença ou condição (ex: Fibromialgia, Gota...)"
                            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-rose-500"
                            value={customPathology}
                            onChange={e => setCustomPathology(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addCustomPathology())}
                        />
                        <button 
                            type="button" 
                            onClick={addCustomPathology}
                            className="bg-rose-100 text-rose-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-rose-200"
                        >
                            Adicionar
                        </button>
                    </div>

                    {/* Display Custom/Selected Items not in Common List */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.pathologies?.filter(p => !COMMON_PATHOLOGIES.includes(p)).map(p => (
                            <span key={p} className="bg-rose-100 text-rose-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-rose-200">
                                {p}
                                <button type="button" onClick={() => togglePathology(p)} className="hover:bg-rose-200 rounded-full p-0.5"><X size={12} /></button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="pt-2 border-t border-rose-200">
                    <label className="block text-sm font-bold text-rose-800 mb-1">Histórico Familiar de Doenças (Hereditariedade)</label>
                    <textarea 
                        className="w-full border border-rose-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none bg-white"
                        rows={2}
                        placeholder="Ex: Pai hipertenso, Mãe diabética..."
                        value={formData.familyHistory || ''}
                        onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                    />
                </div>
            </div>

            {/* Seção de Prontuário */}
            <div className="md:col-span-2 bg-yellow-50/50 p-4 rounded-xl border border-yellow-200 shadow-sm">
              <label className="block text-sm font-bold text-yellow-800 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2"><FileText size={18} /> Prontuário / Evolução Clínica</span>
                <button 
                  type="button" 
                  onClick={addTimestampNote}
                  className="text-xs bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-1 rounded-full font-semibold transition-colors flex items-center gap-1"
                >
                    <Plus size={12} /> Adicionar Evolução (Hoje)
                </button>
              </label>
              <textarea
                className="w-full border border-yellow-300 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500 outline-none bg-white text-gray-800 leading-relaxed font-medium"
                rows={8}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Histórico médico, medicamentos em uso, evolução do paciente, etc."
              />
              <p className="text-xs text-gray-500 mt-1 text-right">Dica: Use o botão acima para inserir data/hora automaticamente.</p>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all"
              >
                <Save size={18} />
                {editingPatient ? 'Atualizar Prontuário' : 'Salvar Novo Paciente'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PatientManager;