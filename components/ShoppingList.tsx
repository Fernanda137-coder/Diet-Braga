import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, CheckSquare, Square, Tag, Printer, Lock } from 'lucide-react';
import { ShoppingItem } from '../types';

interface ShoppingListProps {
  initialItems: ShoppingItem[];
  onUpdateList: (items: ShoppingItem[]) => void;
  isPremium?: boolean; // New prop
}

// Database of common food brands
const BRAND_DATABASE: Record<string, string[]> = {
  "arroz": ["Camil", "Tio João", "Prato Fino", "Namorado"],
  "feijão": ["Camil", "Kicaldo", "Broto Legal"],
  "macarrão": ["Galo", "Adria", "Barilla", "Renata"],
  "café": ["Pilão", "3 Corações", "Melitta", "Nescafé"],
  "leite": ["Ninho", "Piracanjuba", "Italac", "Parmalat", "Molico"],
  "iogurte": ["Danone", "Nestlé", "Vigor", "Activia"],
  "pão": ["Pullman", "Wickbold", "Seven Boys"],
  "queijo": ["Polenghi", "President", "Tirol"],
  "presunto": ["Sadia", "Perdigão", "Seara"],
  "frango": ["Sadia", "Seara", "Korin"],
  "carne": ["Friboi", "Maturatta"],
  "azeite": ["Gallo", "Andorinha", "Borges"],
  "whey": ["Growth", "Max Titanium", "Dux", "IntegralMedica"],
  "creatina": ["Growth", "Max Titanium", "Black Skull"],
  "aveia": ["Quaker", "Nestlé", "Jasmine"],
  "chocolate": ["Nestlé", "Lacta", "Garoto", "Lindt"],
  "adoçante": ["Zero-Cal", "Linea", "Stevia"],
};

const ShoppingList: React.FC<ShoppingListProps> = ({ initialItems, onUpdateList, isPremium = false }) => {
  const [items, setItems] = useState<ShoppingItem[]>(initialItems || []);
  const [newItemName, setNewItemName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [suggestionRef]);

  const handleAddItem = (nameOverride?: string) => {
    const nameToAdd = nameOverride || newItemName;
    if (nameToAdd.trim()) {
      const newItem: ShoppingItem = {
        id: Date.now().toString(),
        name: nameToAdd.trim(),
        checked: false
      };
      const updated = [...items, newItem];
      setItems(updated);
      onUpdateList(updated);
      setNewItemName('');
      setShowSuggestions(false);
    }
  };

  const handleToggleItem = (id: string) => {
    const updated = items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updated);
    onUpdateList(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    onUpdateList(updated);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemName(e.target.value);
    setShowSuggestions(true);
  };

  const handlePrint = () => {
      if(isPremium) {
          window.print();
      } else {
          alert("A impressão/exportação da lista é exclusiva para usuários Premium.");
      }
  }

  const suggestions = useMemo(() => {
    if (!newItemName) return [];
    
    const lowerInput = newItemName.toLowerCase();
    
    // Check if user is typing a category that has brands
    const matchingCategory = Object.keys(BRAND_DATABASE).find(key => lowerInput.includes(key));
    
    if (matchingCategory) {
      const brands = BRAND_DATABASE[matchingCategory];
      return brands.map(brand => {
          // Replace the generic term with the branded term or append
          // E.g. input "leite", suggest "Leite Ninho", "Leite Piracanjuba"
          // Or if input is "arroz i", suggest "Arroz Integral Camil" (complex logic omitted for simplicity)
          // Simple logic: Capitalize category + Brand
          const prefix = matchingCategory.charAt(0).toUpperCase() + matchingCategory.slice(1);
          return `${prefix} ${brand}`;
      });
    }
    
    return [];
  }, [newItemName]);

  return (
    <div className="space-y-6 animate-fade-in print:space-y-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <ShoppingCart className="text-emerald-600" /> Lista de Compras
          </h2>
          <p className="text-gray-500">Organize suas compras baseadas na sua dieta.</p>
        </div>
        
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
         {/* Print Header (Visible if user uses browser print function manually) */}
         <div className="hidden print:block mb-8 text-center border-b border-gray-200 pb-4">
             <h1 className="text-2xl font-bold text-gray-900">Minha Lista de Compras - Diet Braga</h1>
             <p className="text-gray-500 text-sm">Gerado em {new Date().toLocaleDateString()}</p>
         </div>

         <div className="flex justify-end mb-4 print:hidden">
             <button 
                onClick={handlePrint}
                className={`p-3 rounded-xl transition-colors flex items-center gap-2 font-bold text-sm ${isPremium ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
             >
                 {isPremium ? <Printer size={20} /> : <Lock size={16} />}
                 {isPremium ? 'Imprimir / Salvar PDF' : 'Imprimir (Premium)'}
             </button>
         </div>

         <div className="mb-6 relative print:hidden" ref={suggestionRef}>
            <div className="flex gap-2">
                <input 
                type="text" 
                className="flex-1 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Adicionar item (Ex: Arroz, Leite...)"
                value={newItemName}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                />
                <button 
                onClick={() => handleAddItem()}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-xl transition-colors"
                >
                <Plus size={24} />
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl mt-2 z-20 overflow-hidden animate-slide-up">
                    <div className="bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <Tag size={12} /> Sugestões de Marcas
                    </div>
                    {suggestions.map((sug, idx) => (
                        <button
                            key={idx}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 text-sm border-b border-gray-50 last:border-0 transition-colors"
                            onClick={() => handleAddItem(sug)}
                        >
                            {sug}
                        </button>
                    ))}
                </div>
            )}
         </div>

         {items.length === 0 ? (
            <div className="text-center py-12 text-gray-400 print:hidden">
                <ShoppingCart className="mx-auto mb-3 opacity-30" size={48} />
                <p>Sua lista está vazia.</p>
            </div>
         ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-1">
                 {items.map((item) => (
                     <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border group transition-all cursor-pointer select-none print:border-b print:rounded-none print:border-gray-200 print:p-2 ${item.checked ? 'bg-emerald-50 border-emerald-100 opacity-60 print:bg-transparent' : 'bg-gray-50 border-gray-100 hover:bg-white hover:shadow-sm print:bg-transparent'}`}
                        onClick={() => handleToggleItem(item.id)}
                     >
                         <div className="flex items-center gap-3 overflow-hidden">
                             <div className={`transition-colors ${item.checked ? 'text-emerald-500 print:text-gray-800' : 'text-gray-300 group-hover:text-emerald-400 print:text-gray-800'}`}>
                                 {item.checked ? <CheckSquare size={22} /> : <Square size={22} />}
                             </div>
                             <span className={`font-medium truncate ${item.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                {item.name}
                             </span>
                         </div>
                         <button 
                           onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                           className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-50 rounded-lg print:hidden"
                         >
                             <Trash2 size={18} />
                         </button>
                     </div>
                 ))}
             </div>
         )}
         
         <div className="hidden print:block mt-10 text-center text-xs text-gray-400">
             Nutrição Inteligente
         </div>
      </div>
    </div>
  );
};

export default ShoppingList;