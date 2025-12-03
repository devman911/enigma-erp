
import React, { useState } from 'react';
import { Payment, Partner, EntityType } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Wallet, Trash, Plus } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

interface PaymentListProps {
  payments: Payment[];
  partners: Partner[];
  currency: string;
  type?: EntityType;
  onAdd: (payment: Payment) => void;
  onDelete: (id: string) => void;
}

export const PaymentList: React.FC<PaymentListProps> = ({ payments, partners, currency, type, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  // Filter enriched payments
  const enrichedPayments = payments
    .map(p => {
      const partner = partners.find(pt => pt.id === p.partnerId);
      return {
        ...p,
        partnerName: partner ? partner.name : 'Tiers Inconnu',
        partnerType: partner ? partner.type : 'N/A'
      };
    })
    .filter(p => !type || p.partnerType === type); // Filter by type if provided

  // Sort by date descending
  enrichedPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter partners for the modal dropdown (if context is restricted)
  const availablePartners = type ? partners.filter(p => p.type === type) : partners;

  const getTitle = () => {
      if (type === EntityType.CLIENT) return "Journal des Règlements Clients";
      if (type === EntityType.SUPPLIER) return "Journal des Règlements Fournisseurs";
      return "Journal des Règlements Global";
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
            <Wallet className={`w-6 h-6 ${type === EntityType.SUPPLIER ? 'text-amber-600' : 'text-emerald-600'}`} />
            <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Historique des {type === EntityType.CLIENT ? 'encaissements' : type === EntityType.SUPPLIER ? 'décaissements' : 'mouvements'}.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Nouveau Règlement
        </button>
      </div>

      <DataTable
        title={getTitle()}
        data={enrichedPayments}
        columns={[
          { key: 'date', header: 'Date' },
          { key: 'partnerName', header: 'Tiers' },
          { key: 'amount', header: 'Montant', render: (p: any) => (
             <span className={`font-bold ${p.partnerType === 'CLIENT' ? 'text-emerald-600' : 'text-amber-600'}`}>
               {p.partnerType === 'CLIENT' ? '+' : '-'} {p.amount.toFixed(2)} {symbol}
             </span>
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
