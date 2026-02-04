import React, { useState, useEffect, useRef } from 'react';
import { analyzeFoodText, searchFoodDatabase } from '../services/geminiService';
import { FoodEntry, MacroNutrients } from '../types';
import { Send, Loader2, PlusCircle, CheckCircle, Search, ScanBarcode, AlignLeft, X, Sparkles, Clock, Leaf } from 'lucide-react';
import { Html5QrcodeScanner } from "html5-qrcode";

interface FoodAnalyzerProps {
  onAddEntry: (entry: FoodEntry) => void;
}

type TabMode = 'TEXT' | 'SEARCH' | 'BARCODE';

const FoodAnalyzer: React.FC<FoodAnalyzerProps> = ({ onAddEntry }) => {
  const [mode, setMode] = useState<TabMode>('TEXT');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MacroNutrients | null>(null);
  const [resultDescription, setResultDescription] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Cleanup scanner when switching away from BARCODE mode
    if (mode !== 'BARCODE' && scannerRef.current) {
      scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      scannerRef.current = null;
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'BARCODE' && !scannerRef.current) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        const scanner = new Html5QrcodeScanner("reader", config, false);
        
        scanner.render(async (decodedText) => {
          if(loading) return; // Prevent multiple scans
          await handleBarcodeScan(decodedText);
          scanner.clear();
          scannerRef.current = null;
          setMode('TEXT'); // Switch back to view result
        }, (error) => {
          // console.warn(error);
        });
        
        scannerRef.current = scanner;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const handleBarcodeScan = async (barcode: string) => {
    setLoading(true);
    setResult(null);
    setInput(`Código de barras: ${barcode}`);
    
    try {
      // 1. Try OpenFoodFacts API first for basic data
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();

      let productName = "Produto Escaneado";
      let basicMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

      if (data.status === 1 && data.product) {
        const p = data.product;
        const nutriments = p.nutriments;
        productName = p.product_name || productName;
        
        basicMacros = {
          calories: Number(nutriments['energy-kcal_100g'] || nutriments['energy-kcal_serving'] || 0),
          protein: Number(nutriments['proteins_100g'] || nutriments['proteins_serving'] || 0),
          carbs: Number(nutriments['carbohydrates_100g'] || nutriments['carbohydrates_serving'] || 0),
          fat: Number(nutriments['fat_100g'] || nutriments['fat_serving'] || 0)
        };
      }

      setResultDescription(productName);
      setInput(productName);

      // 2. ALWAYS call AI to get Benefits & Usage Advice (which Barcode API usually lacks)
      // Pass the name found (or barcode if name not found) to AI for enrichment
      const enrichedData = await searchFoodDatabase(productName);
      
      // Merge Data: prioritize OpenFoodFacts for Macros (real data), AI for benefits/usage
      // If OFF failed (0 cals), use AI macros.
      const finalResult: MacroNutrients = {
          calories: basicMacros.calories > 0 ? basicMacros.calories : enrichedData.calories,
          protein: basicMacros.calories > 0 ? basicMacros.protein : enrichedData.protein,
          carbs: basicMacros.calories > 0 ? basicMacros.carbs : enrichedData.carbs,
          fat: basicMacros.calories > 0 ? basicMacros.fat : enrichedData.fat,
          micronutrients: enrichedData.micronutrients,
          benefits: enrichedData.benefits,
          usageAdvice: enrichedData.usageAdvice
      };

      setResult(finalResult);

    } catch (err) {
      console.error(err);
      alert("Erro ao consultar código de barras. Tentando análise manual.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      let data: MacroNutrients;
      if (mode === 'SEARCH') {
        data = await searchFoodDatabase(input);
        setResultDescription(input);
      } else {
        data = await analyzeFoodText(input);
        setResultDescription(input);
      }
      setResult(data);
    } catch (error) {
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (result) {
      onAddEntry({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        description: resultDescription || input,
        nutrients: result
      });
      setInput('');
      setResult(null);
      setResultDescription('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Registro & Análise</h2>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-50 p-1 rounded-xl">
          <button
            onClick={() => { setMode('TEXT'); setInput(''); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'TEXT' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <AlignLeft size={16} /> Descrição
          </button>
          <button
            onClick={() => { setMode('SEARCH'); setInput(''); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'SEARCH' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Search size={16} /> Buscar
          </button>
          <button
            onClick={() => { setMode('BARCODE'); setInput(''); setResult(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'BARCODE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <ScanBarcode size={16} /> Scan
          </button>
        </div>
        
        <div className="relative min-h-[200px]">
          {mode === 'TEXT' && (
            <>
              <p className="text-gray-500 text-sm mb-4">
                Descreva sua refeição em linguagem natural (ex: "2 ovos mexidos e café").
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-xl p-4 pr-12 h-40 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                placeholder="O que você comeu hoje?"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </>
          )}

          {mode === 'SEARCH' && (
            <>
              <p className="text-gray-500 text-sm mb-4">
                Busque um alimento específico na nossa base de dados (ex: "Abacate", "Arroz Branco").
              </p>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-xl p-4 pr-12 h-14 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Digite o nome do alimento..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </>
          )}

          {mode === 'BARCODE' && (
            <div className="flex flex-col items-center justify-center h-full bg-black rounded-xl overflow-hidden relative">
               <div id="reader" className="w-full h-full text-white"></div>
               <p className="text-white/70 text-sm absolute bottom-4 z-10">Aponte a câmera para o código</p>
            </div>
          )}

          {mode !== 'BARCODE' && (
            <button
              onClick={handleAction}
              disabled={loading || !input.trim()}
              className="absolute bottom-3 right-3 bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (mode === 'SEARCH' ? <Search size={20} /> : <Send size={20} />)}
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between animate-fade-in">
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={20} /> 
                {mode === 'SEARCH' || mode === 'BARCODE' ? 'Ficha do Alimento' : 'Análise da Refeição'}
              </h3>
              {resultDescription && (
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-full font-medium max-w-[150px] truncate">
                  {resultDescription}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-orange-50 p-3 rounded-xl">
                <p className="text-xs text-orange-600 font-semibold uppercase">Calorias</p>
                <p className="text-2xl font-bold text-orange-800">{result.calories} <span className="text-sm font-normal">kcal</span></p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl">
                <p className="text-xs text-blue-600 font-semibold uppercase">Proteínas</p>
                <p className="text-2xl font-bold text-blue-800">{result.protein}g</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl">
                <p className="text-xs text-yellow-600 font-semibold uppercase">Carboidratos</p>
                <p className="text-2xl font-bold text-yellow-800">{result.carbs}g</p>
              </div>
              <div className="bg-rose-50 p-3 rounded-xl">
                <p className="text-xs text-rose-600 font-semibold uppercase">Gorduras</p>
                <p className="text-2xl font-bold text-rose-800">{result.fat}g</p>
              </div>
            </div>

            {/* BENEFITS & ADVICE SECTION */}
            <div className="space-y-4 mb-6">
                {result.benefits && result.benefits.length > 0 && (
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                        <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2 text-sm">
                            <Leaf size={16}/> Benefícios Nutricionais
                        </h4>
                        <ul className="text-sm text-emerald-900 space-y-1">
                            {result.benefits.map((benefit, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0"></span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {result.usageAdvice && result.usageAdvice.length > 0 && (
                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                        <h4 className="font-bold text-indigo-800 flex items-center gap-2 mb-2 text-sm">
                            <Clock size={16}/> Como Ingerir
                        </h4>
                        <ul className="text-sm text-indigo-900 space-y-1">
                            {result.usageAdvice.map((advice, i) => (
                                <li key={i} className="flex gap-2 items-start">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0"></span>
                                    {advice}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {result.micronutrients && result.micronutrients.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Micronutrientes Principais</p>
                <div className="flex flex-wrap gap-2">
                  {result.micronutrients.map((micro, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs border border-gray-200">
                      {micro}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-200"
          >
            <PlusCircle size={20} />
            Adicionar ao Diário
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodAnalyzer;