import { GoogleGenAI } from "@google/genai";
import { AppState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (state: AppState) => {
  try {
    // Prepare a summary of data to send to Gemini (avoid sending massive raw data)
    const salesTotal = state.documents
      .filter(d => d.type === 'INVOICE')
      .reduce((acc, curr) => acc + curr.totalTTC, 0);
    
    const lowStockItems = state.products.filter(p => p.stock <= p.minStock);
    
    const summary = {
      totalSales: salesTotal,
      productsCount: state.products.length,
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map(p => p.name),
      recentInvoices: state.documents.filter(d => d.type === 'INVOICE').slice(-5)
    };

    const prompt = `
      Tu es un Analyste Commercial Senior expert pour un système ERP.
      Voici un aperçu des données actuelles de l'entreprise :
      ${JSON.stringify(summary, null, 2)}

      Merci de fournir un résumé exécutif concis en FRANÇAIS avec des puces :
      1. Évaluation de la santé financière.
      2. Avertissements urgents sur les stocks (le cas échéant).
      3. Une recommandation stratégique pour l'équipe commerciale.
      
      Reste professionnel et en dessous de 150 mots.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "L'analyse IA est actuellement indisponible. Veuillez vérifier la configuration de la clé API.";
  }
};