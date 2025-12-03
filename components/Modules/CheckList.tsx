

import React, { useState } from 'react';
import { Payment, Partner, PaymentMethod, PaymentStatus, EntityType } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Wallet, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CheckListProps {
  payments: Payment[];
  partners: Partner[];
  currency: string;
  onUpdateStatus: (paymentId: string, status: PaymentStatus) => void;
}

export const CheckList: React.FC<CheckListProps> = ({ payments, partners, currency, onUpdateStatus }) => {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  // Filter only Checks
  const checkPayments = payments
    .filter(p => p.method === PaymentMethod.CHECK)
    .map(p => {
      const partner = partners.find(pt => pt.id === p.partnerId);
      return {
        ...p,
        partnerName: partner ? partner.name : 'Tiers Inconnu',
        partnerType: partner ? partner.type : 'N/A'
      };
    })
    .sort((a, b) => new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime());

  const handleStatusChange = (paymentId: string, status: PaymentStatus) => {
      if (confirm(`Voulez-vous vraiment passer ce chèque au statut : ${status} ?`)) {
          onUpdateStatus(paymentId, status);
      }
  };

  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Gestion des Chèques</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Suivi des échéances et validation des encaissements/décaissements par chèque.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-bold">En attente</span>
              <div className="text-lg font-bold text-amber-600">
                  {checkPayments.filter(p => p.status === PaymentStatus.PENDING).length} Chèques
              </div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-bold">Total à encaisser</span>
              <div className="text-lg font-bold text-slate-800">
                  {checkPayments.filter(p => p.status === PaymentStatus.PENDING && p.partnerType === EntityType.CLIENT)
                    .reduce((sum, p) => sum + p.amount, 0).toFixed(2)} {symbol}
              </div>
          </div>
          <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-bold">Total à décaisser</span>
              <div className="text-lg font-bold text-slate-800">
                   {checkPayments.filter(p => p.status === PaymentStatus.PENDING && p.partnerType === EntityType.SUPPLIER)
                    .reduce((sum, p) => sum + p.amount, 0).toFixed(2)} {symbol}
              </div>
          </div>
      </div>

      <DataTable
        title="Liste des Chèques"
        data={checkPayments}
        columns={[
          { key: 'dueDate', header: 'Échéance', render: (p) => (
             <span className={`font-bold ${new Date(p.dueDate || '') < new Date() && p.status === PaymentStatus.PENDING ? 'text-red-600' : 'text-slate-800'}`}>
                 {p.dueDate}
             </span>
          )},
          { key: 'date', header: 'Date Émission' },
          { key: 'partnerName', header: 'Tiers' },
          { key: 'amount', header: 'Montant', render: (p: any) => (
             <span className={`font-bold ${p.partnerType === 'CLIENT' ? 'text-emerald-600' : 'text-amber-600'}`}>
               {p.partnerType === 'CLIENT' ? 'Reçu' : 'Émis'} {p.amount.toFixed(2)} {symbol}
             </span>
          )},
          { key: 'reference', header: 'N° Chèque' },
          { key: 'status', header: 'Statut', render: (p: any) => (
             <span className={`px-2 py-1 rounded text-xs font-bold uppercase inline-flex items-center gap-1 ${
                 p.status === PaymentStatus.CLEARED ? 'bg-green-100 text-green-700' :
                 p.status === PaymentStatus.REJECTED ? 'bg-red-100 text-red-700' :
                 'bg-amber-100 text-amber-700'
             }`}>
                {p.status === PaymentStatus.PENDING && <Clock className="w-3 h-3"/>}
                {p.status === PaymentStatus.CLEARED && <CheckCircle className="w-3 h-3"/>}
                {p.status === PaymentStatus.REJECTED && <XCircle className="w-3 h-3"/>}
                {p.status || PaymentStatus.PENDING}
             </span>
          )},
          { key: 'id', header: 'Actions', render: (p: any) => (
             <div className="flex items-center gap-1">
                 {p.status === PaymentStatus.PENDING && (
                     <>
                        <button 
                            onClick={() => handleStatusChange(p.id, PaymentStatus.CLEARED)}
                            className="bg-green-600 text-white p-1.5 rounded hover:bg-green-700 text-xs flex items-center gap-1"
                            title="Valider / Encaisser"
                        >
                            <CheckCircle className="w-3 h-3" />
                        </button>
                        <button 
                            onClick={() => handleStatusChange(p.id, PaymentStatus.REJECTED)}
                            className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700 text-xs flex items-center gap-1"
                            title="Rejeter / Impayé"
                        >
                            <XCircle className="w-3 h-3" />
                        </button>
                     </>
                 )}
                 {p.status !== PaymentStatus.PENDING && (
                     <button 
                        onClick={() => handleStatusChange(p.id, PaymentStatus.PENDING)}
                        className="text-slate-400 hover:text-indigo-600 p-1"
                        title="Remettre en attente"
                     >
                        <Clock className="w-4 h-4" />
                     </button>
                 )}
             </div>
          )}
        ]}
      />
    </div>
  );
};