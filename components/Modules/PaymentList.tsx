
import React, { useState } from 'react';
import { Payment, Partner, EntityType, PaymentNature } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Wallet, Trash, Plus, ArrowUpRight, ArrowDownLeft, RotateCcw } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

interface PaymentListProps {
  payments: Payment[];
  partners: Partner[];
  currency: string;
  type?: EntityType;
  nature?: PaymentNature; // New prop for filtering
  onAdd: (payment: Payment) => void;
  onDelete: (id: string) => void;
}

export const PaymentList: React.FC<PaymentListProps> = ({ payments, partners, currency, type, nature, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  // Filter enriched payments
  const enrichedPayments = payments
    .map(p => {
      const partner = partners.find(pt => pt.id === p.partnerId);
      const isClient = partner?.type === EntityType.CLIENT;
      const pNature = p.nature || PaymentNature.PAYMENT;

      // Determine Flow (IN or OUT)
      // Client + Payment = IN
      // Client + Refund = OUT
      // Supplier + Payment = OUT
      // Supplier + Refund = IN
      let isIncoming = false;
      if (isClient) {
          isIncoming = pNature === PaymentNature.PAYMENT;
      } else {
          isIncoming = pNature === PaymentNature.REFUND;
      }

      return {
        ...p,
        nature: pNature,
        partnerName: partner ? partner.name : 'Tiers Inconnu',
        partnerType: partner ? partner.type : 'N/A',
        isIncoming
      };
    })
    .filter(p => !type || p.partnerType === type) // Filter by type if provided
    .filter(p => !nature || p.nature === nature); // Filter by nature if provided

  // Sort by date descending
  enrichedPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter partners for the modal dropdown (if context is restricted)
  const availablePartners = type ? partners.filter(p => p.type === type) : partners;

  const getTitle = () => {
      const isRefund = nature === PaymentNature.REFUND;
      if (type === EntityType.CLIENT) return isRefund ? "Remboursements Clients" : "Encaissements Clients";
      if (type === EntityType.SUPPLIER) return isRefund ? "Remboursements Fournisseurs" : "Décaissements Fournisseurs";
      return "Journal des Mouvements Global";
  }

  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
      
      {showModal && (
        <PaymentModal 
            partners={availablePartners}
            currencySymbol={symbol}
            onSave={(p) => { onAdd(p); setShowModal(false); }}
            onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            {nature === PaymentNature.REFUND ? (
                <RotateCcw className="w-6 h-6 text-purple-600" />
            ) : (
                <Wallet className={`w-6 h-6 ${type === EntityType.SUPPLIER ? 'text-amber-600' : 'text-emerald-600'}`} />
            )}
            <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Historique des {type === EntityType.CLIENT ? 'mouvements clients' : type === EntityType.SUPPLIER ? 'mouvements fournisseurs' : 'transactions'}.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Nouveau Mouvement
        </button>
      </div>

      <DataTable
        title={getTitle()}
        data={enrichedPayments}
        columns={[
          { key: 'date', header: 'Date' },
          { key: 'partnerName', header: 'Tiers' },
          { key: 'type', header: 'Type', render: (p: any) => (
             <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                 p.nature === PaymentNature.REFUND ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-slate-50 text-slate-600 border-slate-200'
             }`}>
                 {p.nature === PaymentNature.REFUND ? 'Remboursement' : 'Règlement'}
             </span>
          )},
          { key: 'amount', header: 'Montant', render: (p: any) => (
             <div className={`font-bold flex items-center justify-end gap-1 ${p.isIncoming ? 'text-emerald-600' : 'text-amber-600'}`}>
               {p.isIncoming ? <ArrowDownLeft className="w-3 h-3"/> : <ArrowUpRight className="w-3 h-3"/>}
               {p.isIncoming ? '+' : '-'} {p.amount.toFixed(2)} {symbol}
             </div>
          )},
          { key: 'method', header: 'Mode' },
          { key: 'reference', header: 'Référence' },
          { key: 'note', header: 'Note' },
          { key: 'id', header: 'Action', render: (p) => (
             <button onClick={() => onDelete(p.id)} className="text-slate-400 hover:text-red-600 transition-colors" title="Supprimer">
                 <Trash className="w-4 h-4" />
             </button>
          )}
        ]}
      />
    </div>
  );
};
