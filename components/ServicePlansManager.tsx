import React, { useState } from 'react';
import { ProfessionalProfile, ServicePlan, Patient } from '../types';
import { Tag, Plus, Edit2, Trash2, AlertTriangle, X, DollarSign } from 'lucide-react';

interface ServicePlansManagerProps {
    profile: ProfessionalProfile;
    onSaveProfile: (profile: ProfessionalProfile) => void;
    patients: Patient[];
}

const ServicePlansManager: React.FC<ServicePlansManagerProps> = ({ profile, onSaveProfile, patients }) => {
    const [showPlanForm, setShowPlanForm] = useState(false);
    const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
    const [newPlan, setNewPlan] = useState<Partial<ServicePlan>>({ title: '', price: 0, description: '', features: [] });
    const [currentFeature, setCurrentFeature] = useState('');

    const countPlanUsage = (planId: string) => {
        if (!patients) return 0;
        return patients.filter(p => p.planId === planId).length;
    };

    const handleSavePlan = () => {
        if (newPlan.title && newPlan.price) {
            let updatedPlans = [];
            if (editingPlanId) {
                // Edit existing
                updatedPlans = profile.plans?.map(p => p.id === editingPlanId ? { ...p, ...newPlan } as ServicePlan : p) || [];
            } else {
                // Create new
                const plan: ServicePlan = {
                    id: Date.now().toString(),
                    title: newPlan.title,
                    price: Number(newPlan.price),
                    description: newPlan.description || '',
                    features: newPlan.features || []
                };
                updatedPlans = [...(profile.plans || []), plan];
            }
            
            onSaveProfile({ ...profile, plans: updatedPlans });
            
            setShowPlanForm(false);
            setEditingPlanId(null);
            setNewPlan({ title: '', price: 0, description: '', features: [] });
        }
    };

    const handleEditPlan = (plan: ServicePlan) => {
        const usage = countPlanUsage(plan.id);
        if (usage > 0) {
            alert(`Este plano está sendo usado por ${usage} paciente(s). Você pode editar apenas o nome e descrição, mas não recomendamos alterar drasticamente.`);
        }
        setEditingPlanId(plan.id);
        setNewPlan(plan);
        setShowPlanForm(true);
    }

    const handleDeletePlan = (id: string) => {
        const usage = countPlanUsage(id);
        if (usage > 0) {
            alert(`Não é possível excluir este plano pois ele está vinculado a ${usage} paciente(s) ativo(s). Remova o vínculo dos pacientes antes de excluir.`);
            return;
        }

        if(confirm("Tem certeza que deseja excluir este plano?")) {
            const updatedPlans = profile.plans?.filter(p => p.id !== id) || [];
            onSaveProfile({ ...profile, plans: updatedPlans });
        }
    };

    const handleAddFeature = () => {
        if (currentFeature.trim()) {
            setNewPlan({ ...newPlan, features: [...(newPlan.features || []), currentFeature] });
            setCurrentFeature('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        const updated = [...(newPlan.features || [])];
        updated.splice(index, 1);
        setNewPlan({ ...newPlan, features: updated });
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-10">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <DollarSign className="text-emerald-600" /> Planos e Serviços
                </h2>
                <p className="text-gray-500 mt-1">Crie pacotes de serviços para que seus pacientes possam contratar.</p>
            </header>

            <div className="flex justify-between items-center mb-6">
                <div></div>
                <button 
                    type="button"
                    onClick={() => { setShowPlanForm(!showPlanForm); setEditingPlanId(null); setNewPlan({ title: '', price: 0, description: '', features: [] }); }}
                    className="bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center gap-2 shadow-lg"
                >
                    <Plus size={18} /> Novo Plano
                </button>
            </div>

            {showPlanForm && (
                <div className="bg-emerald-50/50 p-6 rounded-2xl mb-8 border border-emerald-100 animate-slide-up">
                    <h4 className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                        <Tag size={18}/> {editingPlanId ? 'Editar Serviço' : 'Novo Serviço'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" placeholder="Nome do Plano (Ex: Consulta Avulsa)" 
                            className="w-full p-3 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                            value={newPlan.title} onChange={e => setNewPlan({...newPlan, title: e.target.value})}
                        />
                        <input 
                            type="number" placeholder="Valor (R$)" 
                            className="w-full p-3 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                            value={newPlan.price || ''} onChange={e => setNewPlan({...newPlan, price: Number(e.target.value)})}
                        />
                        <div className="md:col-span-2">
                            <input 
                            type="text" placeholder="Descrição curta" 
                            className="w-full p-3 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                            value={newPlan.description} onChange={e => setNewPlan({...newPlan, description: e.target.value})}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <div className="flex gap-2">
                                <input 
                                    type="text" placeholder="Adicionar benefício (Ex: Suporte 24h)" 
                                    className="w-full p-3 bg-white border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                                    value={currentFeature} onChange={e => setCurrentFeature(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                                />
                                <button type="button" onClick={handleAddFeature} className="bg-emerald-200 text-emerald-800 px-4 rounded-xl font-bold hover:bg-emerald-300 transition-colors">+</button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {newPlan.features?.map((f, i) => (
                                    <span key={i} className="text-xs bg-white border border-emerald-200 text-emerald-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 group/feat cursor-pointer" onClick={() => handleRemoveFeature(i)}>
                                        {f} <X size={12} className="opacity-0 group-hover/feat:opacity-100 transition-opacity" />
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                            <button type="button" onClick={() => setShowPlanForm(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button type="button" onClick={handleSavePlan} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-md">
                                {editingPlanId ? 'Atualizar' : 'Criar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profile.plans?.map((plan) => {
                    const usageCount = countPlanUsage(plan.id);
                    return (
                        <div key={plan.id} className="bg-white border border-gray-100 rounded-[1.5rem] p-6 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-[1.5rem]"></div>
                            <div className="flex justify-between items-start mb-3 mt-2">
                                <h4 className="font-bold text-gray-800 text-lg">{plan.title}</h4>
                                <span className="bg-slate-900 text-white font-bold px-3 py-1 rounded-lg text-sm shadow-sm">
                                    R$ {plan.price.toFixed(2)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                            <div className="bg-gray-50 rounded-xl p-3 mb-4 flex-1">
                                <ul className="text-xs text-gray-600 space-y-2">
                                    {plan.features.map((f, i) => <li key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>{f}</li>)}
                                </ul>
                            </div>
                            
                            {usageCount > 0 && (
                                <div className="mb-3 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-bold flex items-center gap-2 border border-yellow-100">
                                    <AlertTriangle size={14} /> Em uso por {usageCount} paciente(s)
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => handleEditPlan(plan)}
                                    className="flex-1 py-2 text-xs font-bold text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleDeletePlan(plan.id)}
                                    disabled={usageCount > 0}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${usageCount > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600 hover:bg-red-50'}`}
                                >
                                    <Trash2 size={14} /> Remover
                                </button>
                            </div>
                        </div>
                    );
                })}
                {(!profile.plans || profile.plans.length === 0) && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-[1.5rem] bg-gray-50/50">
                        <p className="text-gray-400 font-medium">Nenhum plano cadastrado ainda.</p>
                        <button onClick={() => { setShowPlanForm(true); setEditingPlanId(null); setNewPlan({ title: '', price: 0, description: '', features: [] }); }} className="mt-2 text-emerald-600 text-sm font-bold hover:underline">Começar agora</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicePlansManager;