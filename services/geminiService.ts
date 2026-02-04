
import { GoogleGenAI, Type } from "@google/genai";
import { MacroNutrients, MealPlan, Patient, WorkoutSession, Exercise, Recipe } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-flash-preview";

export const analyzeFoodText = async (description: string): Promise<MacroNutrients> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Analise o seguinte alimento ou refeição e forneça uma estimativa nutricional aproximada, benefícios e dicas de consumo. Texto: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            micronutrients: { type: Type.ARRAY, items: { type: Type.STRING } },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 principais benefícios nutricionais" },
            usageAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dicas de como ingerir ou melhores horários" }
          },
          required: ["calories", "protein", "carbs", "fat", "benefits", "usageAdvice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as MacroNutrients;
  } catch (error) {
    console.error("Error analyzing food:", error);
    return { calories: 0, protein: 0, carbs: 0, fat: 0, micronutrients: [] };
  }
};

export const searchFoodDatabase = async (query: string): Promise<MacroNutrients> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Forneça informações nutricionais detalhadas, benefícios e formas de consumo para uma porção padrão de: "${query}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            micronutrients: { type: Type.ARRAY, items: { type: Type.STRING } },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 a 4 benefícios para a saúde" },
            usageAdvice: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Melhores formas de preparo ou horários de consumo" }
          },
          required: ["calories", "protein", "carbs", "fat", "benefits", "usageAdvice"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as MacroNutrients;
  } catch (error) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, micronutrients: [] };
  }
};

export const analyzeRecipe = async (ingredients: string, portions: number): Promise<Omit<Recipe, 'id'>> => {
    try {
        const prompt = `Analise esta receita. Ingredientes: "${ingredients}".
        A receita rende ${portions} porções.
        Calcule os valores nutricionais POR PORÇÃO.
        Liste os principais micronutrientes (vitaminas e minerais) presentes.
        Sugira um nome curto para a receita se não fornecido.
        Retorne imageKeyword em inglês para buscar imagem.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        caloriesPerPortion: { type: Type.NUMBER },
                        macrosPerPortion: {
                            type: Type.OBJECT,
                            properties: {
                                p: { type: Type.NUMBER },
                                c: { type: Type.NUMBER },
                                f: { type: Type.NUMBER }
                            }
                        },
                        micronutrients: { type: Type.ARRAY, items: { type: Type.STRING } },
                        imageKeyword: { type: Type.STRING },
                        ingredients: { type: Type.STRING }, // Just return cleaned up list
                    },
                    required: ["name", "caloriesPerPortion", "macrosPerPortion", "micronutrients", "imageKeyword"]
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response");
        const data = JSON.parse(text);
        
        return {
            name: data.name,
            ingredients: ingredients,
            portions: portions,
            caloriesPerPortion: data.caloriesPerPortion,
            macrosPerPortion: data.macrosPerPortion,
            micronutrients: data.micronutrients,
            imageKeyword: data.imageKeyword
        };

    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const generateMealPlan = async (patient: Patient, selectedMeals: string[] = [], calorieLimit?: number): Promise<MealPlan> => {
  try {
    const prefs = patient.preferences || { dietType: 'Balanceada', favoriteFoods: [], dislikedFoods: [] };
    
    // Default to all if none selected
    const mealsToGenerate = selectedMeals.length > 0 ? selectedMeals : ['breakfast', 'lunch', 'snack', 'dinner', 'preWorkout', 'postWorkout'];

    let limitInstruction = "";
    if (calorieLimit && calorieLimit > 0) {
        limitInstruction = `IMPORTANTE: O plano deve ter um teto máximo de ${calorieLimit} calorias totais. Ajuste as porções para não ultrapassar este valor.`;
    }

    const prompt = `Crie um plano alimentar completo de 1 dia para:
    Paciente: ${patient.name}, ${patient.age} anos, ${patient.weight}kg, Objetivo: ${patient.goal}.
    Tipo de Dieta: ${prefs.dietType}.
    Alimentos Preferidos: ${prefs.favoriteFoods.join(', ')}.
    Evitar: ${prefs.dislikedFoods.join(', ')} e alergias: ${patient.allergies}.
    
    ${limitInstruction}

    GERAR APENAS AS SEGUINTES REFEIÇÕES (Deixe as outras vazias ou zeradas): ${mealsToGenerate.join(', ')}.

    Para cada refeição selecionada, forneça 2 opções de pratos/alimentos com porções específicas.
    Gere também uma Lista de Compras consolidada baseada nos itens sugeridos.
    Calcule calorias e macros estimados por refeição.
    
    IMPORTANTE: No final, calcule o TOTAL do dia (Calorias, Proteína, Carbo, Gordura) somando todas as refeições geradas e liste detalhadamente os principais Micronutrientes (Vitaminas e Minerais) fornecidos por este plano.`;

    const mealSectionSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2 opções diferentes de refeição com quantidades" },
        calories: { type: Type.NUMBER },
        macros: {
            type: Type.OBJECT,
            properties: {
                p: {type: Type.NUMBER, description: "Proteina g"},
                c: {type: Type.NUMBER, description: "Carbo g"},
                f: {type: Type.NUMBER, description: "Gordura g"},
            }
        }
      }
    };

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            breakfast: mealSectionSchema,
            lunch: mealSectionSchema,
            snack: mealSectionSchema,
            dinner: mealSectionSchema,
            preWorkout: mealSectionSchema,
            postWorkout: mealSectionSchema,
            totalCalories: { type: Type.NUMBER },
            totalMacros: { 
                type: Type.OBJECT, 
                properties: {
                    p: {type: Type.NUMBER},
                    c: {type: Type.NUMBER},
                    f: {type: Type.NUMBER}
                }
            },
            micronutrients: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de vitaminas e minerais predominantes no plano" },
            shoppingList: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lista de compras completa" },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["breakfast", "lunch", "snack", "dinner", "preWorkout", "postWorkout", "totalCalories", "totalMacros", "micronutrients", "shoppingList", "tips"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as MealPlan;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw error;
  }
};

export const getHealthTips = async (category: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: `Forneça 5 dicas curtas e práticas de saúde e nutrição sobre o tema: "${category}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        const text = response.text;
        return text ? JSON.parse(text).tips : [];
    } catch (e) {
        return ["Beba água regularmente.", "Consuma frutas e vegetais.", "Evite alimentos ultraprocessados."];
    }
}

export const generateWorkoutPlan = async (type: string, intensity: string): Promise<Omit<WorkoutSession, 'id' | 'patientId' | 'date' | 'completed'>> => {
    try {
        const prompt = `Crie uma rotina de treino detalhada.
        Tipo: ${type}
        Intensidade: ${intensity}
        Retorne uma lista de exercícios.
        Para CADA exercício, forneça:
        1. Nome
        2. Sets (séries)
        3. Reps (repetições)
        4. imageKeyword (termo em INGLÊS para buscar foto)
        5. instructions (lista de 2 a 3 passos curtos de como executar)
        6. tips (lista de 2 dicas breves de execução correta)
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        exercises: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    sets: { type: Type.NUMBER },
                                    reps: { type: Type.STRING },
                                    imageKeyword: { type: Type.STRING },
                                    notes: { type: Type.STRING },
                                    instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["name", "sets", "reps", "imageKeyword", "instructions", "tips"]
                            }
                        }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response");
        const data = JSON.parse(text);
        
        return {
            type: type as any,
            intensity: intensity as any,
            exercises: data.exercises
        };

    } catch (e) {
        console.error(e);
        // Fallback
        return {
            type: type as any,
            intensity: intensity as any,
            exercises: [
                { name: "Polichinelos", sets: 3, reps: "30 seg", imageKeyword: "jumping jacks", instructions: ["Pule abrindo pernas e braços", "Volte à posição inicial"], tips: ["Mantenha o abdômen contraído"] },
                { name: "Agachamento Livre", sets: 3, reps: "15", imageKeyword: "squat", instructions: ["Pés na largura dos ombros", "Desça como se fosse sentar"], tips: ["Não deixe o joelho passar da ponta do pé"] },
            ]
        };
    }
}

export const generateReplacementExercise = async (originalExerciseName: string, workoutType: string, intensity: string): Promise<Exercise> => {
    try {
        const prompt = `Sugira UM exercício alternativo para substituir "${originalExerciseName}" em um treino de "${workoutType}" com intensidade "${intensity}".
        Retorne os detalhes completos (nome, sets, reps, imageKeyword, instructions, tips).`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        imageKeyword: { type: Type.STRING },
                        instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tips: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["name", "sets", "reps", "imageKeyword", "instructions", "tips"]
                }
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text) as Exercise;
    } catch (e) {
        return { name: "Exercício Alternativo", sets: 3, reps: "12", imageKeyword: "fitness", instructions: ["Consulte seu instrutor"], tips: ["Mantenha a postura"] };
    }
}