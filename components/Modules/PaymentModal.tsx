

import React, { useState, useEffect } from 'react';
import { PaymentMethod, Payment, Partner, PaymentStatus } from '../../types';
import { X, Save, DollarSign, CalendarClock } from 'lucide-react';

interface PaymentModalProps {
  partnerName?: string;
  partnerId?: string;
  partners?: Partner[]; // List of available partners for selection
  currencySymbol: string;
  onSave: (payment: Payment) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ partnerName, partnerId, partners, currencySymbol, onSave, onClose }) => {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(partnerId || '');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (partnerId) setSelectedPartnerId(partnerId);
  }, [partnerId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
        alert("Le montant doit être supérieur à 0.");
        return;
    }
    if (!selectedPartnerId) {
        alert("Veuillez sélectionner un tiers.");
        return;
    }
    
    // Validation Chèque
    if (method === PaymentMethod.CHECK && !dueDate) {
        alert("La date d'échéance est obligatoire pour les chèques.");
        return;
    }

    const newPayment: Payment = {
        id: Math.random().toString(36).substr(2, 9),
        partnerId: selectedPartnerId,
        date,
        amount,
        method,
        reference,
        note,
        dueDate: method === PaymentMethod.CHECK ? dueDate : undefined,
        status: method === PaymentMethod.CHECK ? PaymentStatus.PENDING : PaymentStatus.CLEARED
    };

    onSave(newPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Nouveau Règlement
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Partner Selection Logic */}
            {partnerId && partnerName ? (
                <div className="p-3 bg-indigo-50 text-indigo-800 rounded text-sm mb-4">
                    Tiers : <strong>{partnerName}</strong>
                </div>
            ) : (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tiers (Client / Fournisseur)</label>
                    <select 
                        className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                        value={selectedPartnerId}
                        onChange={(e) => setSelectedPartnerId(e.target.value)}
                        required
                        autoFocus
                    >
                        <option value="">-- Sélectionner un tiers --</option>
                        {partners?.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date du règlement</label>
                <input 
                    type="date" 
                    className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Montant ({currencySymbol})</label>
                <input 
                    type="number" 
                    step="0.01"
                    className="w-full border border-slate-300 rounded p-2 font-bold text-lg bg-white text-black"
                    value={amount}
                    onChange={e => setAmount(parseFloat(e.target.value))}
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mode de règlement</label>
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
            
            {/* ECHEANCE CHEQUE */}
            {method === PaymentMethod.CHECK && (
                <div className="bg-amber-50 p-3 rounded border border-amber-200 animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-amber-800 mb-1 flex items-center gap-1">
                        <CalendarClock className="w-4 h-4" /> Date d'échéance (Obligatoire)
                    </label>
                    <input 
                        type="date" 
                        className="w-full border border-amber-300 rounded p-2 bg-white text-black"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        required
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Référence (N° Chèque/Virement)</label>
                <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                    placeholder="Ex: CHQ-50024"
                    value={reference}
                    onChange={e => setReference(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note (Optionnel)</label>
                <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                    placeholder="Commentaire..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-slate-700 hover:bg-slate-50">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Enregistrer
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};