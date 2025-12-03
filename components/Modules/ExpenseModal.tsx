
import React, { useState } from 'react';
import { Expense, PaymentMethod } from '../../types';
import { X, Save, TrendingDown } from 'lucide-react';

interface ExpenseModalProps {
  currencySymbol: string;
  onSave: (expense: Expense) => void;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ currencySymbol, onSave, onClose }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('Autre');
  const [description, setDescription] = useState('');
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [reference, setReference] = useState('');

  const categories = ['Loyer', 'Electricité', 'Eau', 'Internet', 'Transport', 'Salaires', 'Fournitures', 'Repas', 'Marketing', 'Autre'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
        alert("Le montant doit être supérieur à 0.");
        return;
    }
    
    const newExpense: Expense = {
        id: Math.random().toString(36).substr(2, 9),
        date,
        amount,
        category,
        description,
        method,
        reference
    };

    onSave(newExpense);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-red-800 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                Nouvelle Dépense
            </h3>
            <button onClick={onClose} className="text-red-400 hover:text-red-600">
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                    type="date" 
                    className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                <select 
                    className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description / Libellé</label>
                <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                    placeholder="Ex: Facture Internet Octobre"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Montant ({currencySymbol})</label>
                <input 
                    type="number" 
                    step="0.01"
                    className="w-full border border-red-300 rounded p-2 font-bold text-lg bg-white text-black focus:ring-2 focus:ring-red-500 outline-none"
                    value={amount}
                    onChange={e => setAmount(parseFloat(e.target.value))}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mode de paiement</label>
                <select 
                    className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                    value={method}
                    onChange={e => setMethod(e.target.value as PaymentMethod)}
                >
                    {Object.values(PaymentMethod).map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Référence (Optionnel)</label>
                <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                    placeholder="N° Chèque, Virement..."
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                />
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-slate-700 hover:bg-slate-50">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Enregistrer
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};
