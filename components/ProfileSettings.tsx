import React, { useState, useRef, useEffect } from 'react';
import { ProfessionalProfile, Patient } from '../types';
import { Save, User, Award, Mail, Phone, Camera, QrCode, Stethoscope, ArrowRight, ZoomIn, ZoomOut, Move, Lock, Briefcase, X } from 'lucide-react';

interface ProfileSettingsProps {
  profile: ProfessionalProfile;
  patient?: Patient;
  onSave: (profile: ProfessionalProfile) => void;
  onSavePatient?: (patient: Patient) => void;
  userType: 'PROFESSIONAL' | 'PATIENT';
  isSoloPatient?: boolean;
  onMigrateToProfessional?: () => void;
  patients?: Patient[]; 
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, patient, onSave, onSavePatient, userType, isSoloPatient, onMigrateToProfessional, patients = [] }) => {
  const [formData, setFormData] = useState<ProfessionalProfile>(profile);
  const [patientFormData, setPatientFormData] = useState<Partial<Patient>>(patient || {});
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const PREVIEW_SIZE = 250; 

  useEffect(() => {
      if (patient) {
          setPatientFormData(patient);
      }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userType === 'PROFESSIONAL') {
        onSave(formData);
    } else if (onSavePatient && patient) {
        onSavePatient({ ...patient, ...patientFormData } as Patient);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result as string);
        setCropScale(1);
        setCropPos({ x: 0, y: 0 });
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmCrop = () => {
    if (!imageRef.current || !tempImage) return;

    const canvas = document.createElement('canvas');
    const OUTPUT_SIZE = 400; 
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      const scaleFactor = OUTPUT_SIZE / PREVIEW_SIZE;
      
      ctx.beginPath();
      ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
      ctx.clip();

      const img = imageRef.current;
      
      const drawX = cropPos.x * scaleFactor;
      const drawY = cropPos.y * scaleFactor;
      
      const displayedWidth = img.width * cropScale;
      const displayedHeight = img.height * cropScale;
      
      const canvasWidth = displayedWidth * scaleFactor;
      const canvasHeight = displayedHeight * scaleFactor;
      
      ctx.drawImage(img, drawX, drawY, canvasWidth, canvasHeight);

      const finalUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (userType === 'PROFESSIONAL') {
          setFormData({ ...formData, photoUrl: finalUrl });
      } else {
          setPatientFormData({ ...patientFormData, photoUrl: finalUrl });
      }
      setShowCropper(false);
      setTempImage(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - cropPos.x, y: clientY - cropPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    setCropPos({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {};

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // PATIENT PROFILE
  if (userType === 'PATIENT') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
        {/* Header Cover for Patient */}
        <div className="relative h-48 rounded-[2.5rem] bg-gradient-to-r from-emerald-600 to-teal-500 overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-3xl text-white font-bold tracking-tight opacity-90">Meu Perfil Pessoal</h1>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 -mt-16 px-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Photo Column */}
                    <div className="flex flex-col items-center -mt-16 mb-4 md:mb-0">
                        <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                            <div className={`h-32 w-32 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden bg-white ${patientFormData.photoUrl ? '' : 'bg-emerald-50'}`}>
                                {patientFormData.photoUrl ? (
                                    <img src={patientFormData.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-emerald-600 font-bold text-4xl">{patientFormData.name?.charAt(0)}</span>
                                )}
                            </div>
                            <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-2 rounded-full shadow-md border-2 border-white hover:bg-emerald-700 transition-colors">
                                <Camera size={18} />
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>
                        <p className="mt-3 text-sm text-gray-500 font-medium">Paciente</p>
                    </div>

                    {/* Inputs Column */}
                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input 
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={patientFormData.name || ''}
                                        onChange={e => setPatientFormData({...patientFormData, name: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Email de Acesso</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input 
                                        type="email"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={patientFormData.email || ''}
                                        onChange={e => setPatientFormData({...patientFormData, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                    <input 
                                        type="password"
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={patientFormData.password || ''}
                                        onChange={e => setPatientFormData({...patientFormData, password: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Objetivo Principal</label>
                                <input 
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                    value={patientFormData.goal || ''}
                                    onChange={e => setPatientFormData({...patientFormData, goal: e.target.value})}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Sobre Mim</label>
                                <textarea 
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                                    value={patientFormData.notes || ''}
                                    onChange={e => setPatientFormData({...patientFormData, notes: e.target.value})}
                                    placeholder="Conte um pouco sobre sua rotina..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <button 
                                type="submit"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 flex items-center gap-2 transition-all transform active:scale-95"
                            >
                                {isSaved ? <span className="animate-pulse">Salvo!</span> : <><Save size={18} /> Salvar Alterações</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        {isSoloPatient && (
            <div className="mt-8 bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-lg relative overflow-hidden group hover:border-emerald-300 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <Stethoscope size={24} className="text-emerald-600" />
                            Acompanhamento Profissional
                        </h3>
                        <p className="text-gray-500 max-w-lg text-sm">
                            Migre para um plano com nutricionista e tenha acesso a dietas personalizadas, análise de exames e suporte via chat.
                        </p>
                    </div>
                    <button 
                    onClick={onMigrateToProfessional}
                    className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-black transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                    >
                        Encontrar Nutricionista <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        )}
      </div>
    );
  }

  // PROFESSIONAL PROFILE
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
      
      {/* Professional Cover */}
      <div className="relative h-56 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <Briefcase size={40} className="mb-4 opacity-80" />
              <h1 className="text-3xl font-bold tracking-tight">Perfil Profissional</h1>
              <p className="text-slate-400 mt-2">Gerencie seus dados e informações</p>
          </div>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 -mt-20 px-4">
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-gray-100">
            
            <div className="flex flex-col md:flex-row gap-10">
                {/* Photo Upload Area */}
                <div className="flex flex-col items-center md:items-start -mt-20 mb-6 md:mb-0">
                    <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                        <div className={`h-40 w-40 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-2xl overflow-hidden bg-white ${formData.photoUrl ? '' : 'bg-slate-50'}`}>
                        {formData.photoUrl ? (
                            <img src={formData.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <User size={64} className="text-slate-300" />
                        )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Camera className="text-white drop-shadow-md" size={32} />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                    </div>
                    <div className="text-center md:text-left mt-4">
                        <button type="button" onClick={triggerFileInput} className="text-emerald-600 font-bold text-sm hover:underline">Alterar Foto</button>
                    </div>
                </div>

                {/* Main Fields */}
                <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Nome Profissional</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-gray-800"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">CRN</label>
                            <div className="relative">
                                <Award className="absolute left-4 top-3.5 text-emerald-500" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={formData.crn}
                                    onChange={(e) => setFormData({ ...formData, crn: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Especialidade</label>
                            <input
                                type="text"
                                placeholder="Ex: Nutrição Esportiva"
                                value={formData.specialty}
                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Telefone / WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Chave PIX (Para Recebimento)</label>
                            <div className="relative">
                                <QrCode className="absolute left-4 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="CPF, Email, Telefone ou Chave Aleatória"
                                    value={formData.pixKey || ''}
                                    onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-mono text-sm"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Biografia</label>
                            <textarea
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                                placeholder="Conte sobre sua experiência e abordagem..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-10 flex items-center justify-end gap-4 border-t border-gray-100 pt-6">
                {isSaved && (
                    <span className="text-emerald-600 font-bold text-sm animate-pulse bg-emerald-50 px-3 py-1 rounded-lg">
                        Alterações salvas!
                    </span>
                )}
                <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-emerald-200 transition-all flex items-center gap-2 transform active:scale-95"
                >
                    <Save size={20} />
                    Salvar Perfil Profissional
                </button>
            </div>
        </div>
      </form>

      {/* Image Cropper Modal (Professional) */}
      {showCropper && tempImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
             <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
                 <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Ajustar Foto</h3>
                    <button type="button" onClick={() => setShowCropper(false)} className="text-gray-400 hover:text-gray-600">
                       <X size={20} />
                    </button>
                 </div>
                 
                 <div className="p-6 flex flex-col items-center">
                    <div className="relative border-4 border-emerald-500 rounded-full overflow-hidden shadow-inner bg-gray-100 mb-6 cursor-move group" 
                         style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
                         onMouseDown={handleMouseDown}
                         onTouchStart={handleMouseDown}
                         onMouseMove={handleMouseMove}
                         onTouchMove={handleMouseMove}
                         onMouseUp={handleMouseUp}
                         onMouseLeave={handleMouseUp}
                         onTouchEnd={handleMouseUp}
                    >
                         <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isDragging ? 'opacity-0' : 'opacity-60 group-hover:opacity-100'}`}>
                             <Move className="text-white drop-shadow-md" size={32} />
                         </div>

                         <img 
                           ref={imageRef}
                           src={tempImage} 
                           alt="Crop Preview" 
                           draggable={false}
                           onLoad={onImageLoad}
                           className="max-w-none origin-center select-none"
                           style={{ 
                             transform: `translate(${cropPos.x}px, ${cropPos.y}px) scale(${cropScale})`,
                           }}
                         />
                    </div>

                    <div className="w-full space-y-2 mb-6 px-4">
                       <div className="flex justify-between text-xs text-gray-500 font-bold uppercase">
                          <span className="flex items-center gap-1"><ZoomOut size={14}/> Menos Zoom</span>
                          <span className="flex items-center gap-1"><ZoomIn size={14}/> Mais Zoom</span>
                       </div>
                       <input 
                         type="range" 
                         min="0.5" 
                         max="3" 
                         step="0.1" 
                         value={cropScale}
                         onChange={(e) => setCropScale(parseFloat(e.target.value))}
                         className="w-full accent-emerald-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                       />
                    </div>

                    <div className="flex w-full gap-3">
                        <button 
                          type="button" 
                          onClick={() => setShowCropper(false)}
                          className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          Cancelar
                        </button>
                        <button 
                          type="button" 
                          onClick={handleConfirmCrop}
                          className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                        >
                          Salvar Foto
                        </button>
                    </div>
                 </div>
             </div>
          </div>
      )}
    </div>
  );
};

export default ProfileSettings;