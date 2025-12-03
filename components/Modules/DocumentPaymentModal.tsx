

import React, { useState, useEffect } from 'react';
import { PaymentMethod, Payment, Document, PaymentStatus } from '../../types';
import { X, Save, CheckCircle, CreditCard, CalendarClock } from 'lucide-react';

interface DocumentPaymentModalProps {
  document: Document; // Changed from Partial<Document> to Document as we need ID and Total
  alreadyPaid: number;
  currencySymbol: string;
  onAddPayment: (payment: Payment) => void;
  onClose: () => void;
}

export const DocumentPaymentModal: React.FC<DocumentPaymentModalProps> = ({ document, alreadyPaid, currencySymbol, onAddPayment, onClose }) => {
  const remaining = Math.max(0, document.totalTTC - alreadyPaid);
  
  const [amount, setAmount] = useState<number>(remaining);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  // Reset amount if remaining changes (though normally component mounts once)
  useEffect(() => {
    setAmount(remaining);
  }, [remaining]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
        alert("Le montant doit être supérieur à 0.");
        return;
    }
    
    // Validation Chèque
    if (method === PaymentMethod.CHECK && !dueDate) {
        alert("La date d'échéance est obligatoire pour les chèques.");
        return;
    }

    const newPayment: Payment = {
        id: Math.random().toString(36).substr(2, 9),
        partnerId: document.partnerId,
        documentId: document.id,
        date,
        amount,
        method,
        reference,
        note: note || `Règlement pour ${document.reference}`,
        dueDate: method === PaymentMethod.CHECK ? dueDate : undefined,
        status: method === PaymentMethod.CHECK ? PaymentStatus.PENDING : PaymentStatus.CLEARED
    };

    onAddPayment(newPayment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
            <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Enregistrer un paiement
                </h3>
                <p className="text-xs text-indigo-100 opacity-90">Document : {document.reference}</p>
            </div>
            <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors">
                <X className="w-6 h-6" />
            </button>
        </div>
        
        <div className="p-6">
            {/* Summary Card */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-slate-50 p-3 rounded border border-slate-200 text-center">
                    <span className="text-xs text-slate-500 uppercase font-bold">Total TTC</span>
                    <div className="text-lg font-bold text-slate-800">{document.totalTTC.toFixed(2)} {currencySymbol}</div>
                </div>
                <div className="flex-1 bg-emerald-50 p-3 rounded border border-emerald-100 text-center">
                    <span className="text-xs text-emerald-600 uppercase font-bold">Déjà Réglé</span>
                    <div className="text-lg font-bold text-emerald-700">{alreadyPaid.toFixed(2)} {currencySymbol}</div>
                </div>
                <div className="flex-1 bg-red-50 p-3 rounded border border-red-100 text-center">
                    <span className="text-xs text-red-600 uppercase font-bold">Reste à Payer</span>
                    <div className="text-lg font-bold text-red-700">{remaining.toFixed(2)} {currencySymbol}</div>
                </div>
            </div>

            {remaining <= 0 ? (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800">Ce document est entièrement réglé !</h4>
                    <p className="text-slate-500 mt-2">Aucun paiement supplémentaire n'est requis.</p>
                    <button onClick={onClose} className="mt-6 px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-medium">
                        Fermer
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                            <input 
                                type="date" 
                                className="w-full border border-slate-300 rounded p-2.5 bg-white text-black text-sm"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Montant ({currencySymbol})</label>
                            <input 
                                type="number" 
                                step="0.01"
                                max={remaining} // Optional: allow overpayment? usually not.
                                className="w-full border border-indigo-300 rounded p-2.5 font-bold text-lg bg-white text-black focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={amount}
                                onChange={e => setAmount(parseFloat(e.target.value))}
                                autoFocus
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mode de règlement</label>
                        <div className="grid grid-cols-2 gap-2">
                             {Object.values(PaymentMethod).map(m => (
                                 <label key={m} className={`border rounded p-2 flex items-center gap-2 cursor-pointer transition-colors ${method === m ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50 border-slate-200'}`}>
                                     <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value={m} 
                                        checked={method === m} 
                                        onChange={() => setMethod(m as PaymentMethod)}
                                        className="text-indigo-600"
                                     />
                                     <span className="text-sm font-medium">{m}</span>
                                 </label>
                             ))}
                        </div>
                    </div>

                    {/* ECHEANCE CHEQUE */}
                    {method === PaymentMethod.CHECK && (
                        <div className="bg-amber-50 p-3 rounded border border-amber-200 animate-in fade-in">
                            <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                                <CalendarClock className="w-4 h-4" /> Date d'échéance (Obligatoire)
                            </label>
                            <input 
                                type="date" 
                                className="w-full border border-amber-300 rounded p-2 bg-white text-black text-sm"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Référence (Chèque/Virement)</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded p-2 bg-white text-black text-sm"
                                placeholder="N° Pièce..."
                                value={reference}
                                onChange={e => setReference(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Note interne</label>
                            <input 
                                type="text" 
                                className="w-full border border-slate-300 rounded p-2 bg-white text-black text-sm"
                                placeholder="Commentaire..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 mt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 border rounded text-slate-600 hover:bg-slate-50 font-medium text-sm">Annuler</button>
                        <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 shadow-sm flex items-center gap-2 font-medium text-sm">
                            <Save className="w-4 h-4" /> Valider le paiement
                        </button>
                    </div>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};