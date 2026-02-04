import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Patient, ProfessionalProfile } from '../types';
import { Send, User, Search, ArrowLeft, MessageCircle } from 'lucide-react';

interface ChatRoomProps {
    currentUserType: 'PROFESSIONAL' | 'PATIENT';
    currentUserId: string;
    patients: Patient[]; // For Professional to see list
    professional?: ProfessionalProfile; // For Patient to see who they are talking to
    messages: ChatMessage[];
    onSendMessage: (text: string, receiverId: string) => void;
    onMarkAsRead: (senderId: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ currentUserType, currentUserId, patients, professional, messages, onSendMessage, onMarkAsRead }) => {
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // If Patient, auto-select the professional
    useEffect(() => {
        if (currentUserType === 'PATIENT' && professional) {
            setSelectedContactId(professional.id);
        }
    }, [currentUserType, professional]);

    const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const activeMessages = messages.filter(m => 
        (m.senderId === currentUserId && m.receiverId === selectedContactId) ||
        (m.senderId === selectedContactId && m.receiverId === currentUserId)
    ).sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    useEffect(() => {
        if (selectedContactId) {
            onMarkAsRead(selectedContactId);
            scrollToBottom();
        }
    }, [selectedContactId, messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim() && selectedContactId) {
            onSendMessage(inputText, selectedContactId);
            setInputText('');
        }
    };

    // VIEW FOR PROFESSIONAL (List + Chat)
    if (currentUserType === 'PROFESSIONAL') {
        return (
            <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                {/* Sidebar List */}
                <div className={`w-full md:w-80 bg-gray-50 border-r border-gray-100 flex flex-col ${selectedContactId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><MessageCircle size={18} /> Conversas</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar paciente..." 
                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {filteredPatients.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm mt-10">Nenhum paciente encontrado.</p>
                        ) : (
                            filteredPatients.map(p => {
                                // Count unread
                                const unread = messages.filter(m => m.senderId === p.id && m.receiverId === currentUserId && !m.read).length;
                                return (
                                    <div 
                                        key={p.id}
                                        onClick={() => setSelectedContactId(p.id)}
                                        className={`p-4 cursor-pointer hover:bg-white transition-colors border-b border-gray-100 flex items-center gap-3 ${selectedContactId === p.id ? 'bg-white border-l-4 border-l-emerald-500 shadow-sm' : ''}`}
                                    >
                                        <div className="relative">
                                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
                                                {p.photoUrl ? <img src={p.photoUrl} className="h-full w-full object-cover" /> : p.name.charAt(0)}
                                            </div>
                                            {unread > 0 && (
                                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                                    {unread}
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-gray-800 text-sm truncate">{p.name}</h4>
                                            <p className="text-xs text-gray-500 truncate">Clique para conversar</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col ${!selectedContactId ? 'hidden md:flex' : 'flex'}`}>
                    {selectedContactId ? (
                        <>
                            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white shadow-sm z-10">
                                <button onClick={() => setSelectedContactId(null)} className="md:hidden p-2 text-gray-500"><ArrowLeft /></button>
                                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
                                    {patients.find(p => p.id === selectedContactId)?.photoUrl ? 
                                        <img src={patients.find(p => p.id === selectedContactId)?.photoUrl} className="h-full w-full object-cover" /> 
                                        : patients.find(p => p.id === selectedContactId)?.name.charAt(0)}
                                </div>
                                <h3 className="font-bold text-gray-800">{patients.find(p => p.id === selectedContactId)?.name}</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {activeMessages.length === 0 && (
                                    <div className="text-center text-gray-400 mt-10 text-sm">
                                        Nenhuma mensagem ainda. Inicie a conversa!
                                    </div>
                                )}
                                {activeMessages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.senderId === currentUserId ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-[10px] mt-1 text-right ${msg.senderId === currentUserId ? 'text-emerald-200' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                                    placeholder="Digite sua mensagem..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <button type="submit" className="bg-emerald-600 text-white p-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                                    <Send size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="bg-gray-100 p-6 rounded-full mb-4">
                                <MessageCircle size={48} className="text-gray-300" />
                            </div>
                            <p>Selecione um paciente para iniciar o atendimento.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // VIEW FOR PATIENT (Direct Chat)
    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md z-10">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold border-2 border-white/30 overflow-hidden">
                    {professional?.photoUrl ? <img src={professional.photoUrl} className="h-full w-full object-cover" /> : <User />}
                </div>
                <div>
                    <h3 className="font-bold text-lg">{professional?.name || 'Seu Nutricionista'}</h3>
                    <p className="text-xs text-emerald-100 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online agora
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')] bg-gray-50">
                 {activeMessages.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 text-sm bg-white/80 p-4 rounded-xl inline-block mx-auto backdrop-blur-sm">
                        👋 Oi! Envie uma mensagem para seu nutricionista.
                    </div>
                )}
                {activeMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-sm ${msg.senderId === currentUserId ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                            <p>{msg.text}</p>
                            <p className={`text-[10px] mt-1 text-right ${msg.senderId === currentUserId ? 'text-emerald-200' : 'text-gray-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-3">
                <input 
                    type="text" 
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all outline-none"
                    placeholder="Digite sua mensagem..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="bg-emerald-600 text-white p-3 rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 transform active:scale-95">
                    <Send size={22} />
                </button>
            </form>
        </div>
    );
};

export default ChatRoom;