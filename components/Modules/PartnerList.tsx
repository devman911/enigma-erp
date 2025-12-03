

import React, { useState } from 'react';
import { Partner, EntityType, Document, Payment, DocType, Status } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Plus, User, Truck, Users, Calendar } from 'lucide-react';

interface PartnerListProps {
  partners: Partner[];
  documents: Document[];
  payments: Payment[];
  type?: EntityType; // Optional now
  showPeriodFilter?: boolean; // New prop to show date pickers
  onCreate: () => void;
  onEdit: (partner: Partner, context?: { startDate: string, endDate: string }) => void;
  onDelete: (id: string) => void;
  currency: string;
}

export const PartnerList: React.FC<PartnerListProps> = ({ partners, documents, payments, type, showPeriodFilter, onCreate, onEdit, onDelete, currency }) => {
  const isClient = type === EntityType.CLIENT;
  const isSupplier = type === EntityType.SUPPLIER;
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  // Default dates for the filter (current month)
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Enrich partners with calculated balance
  const enrichedPartners = partners
    .filter(p => !type || p.type === type)
    .map(partner => {
        // Filter docs and payments for this partner
        const partnerDocs = documents.filter(d => d.partnerId === partner.id);
        const partnerPayments = payments.filter(p => p.partnerId === partner.id);

        // Calculate Invoiced Amount (Debits)
        const totalInvoiced = partnerDocs
            .filter(d => (d.type === DocType.INVOICE || d.type === DocType.PURCHASE) && d.status !== Status.CANCELLED && d.status !== Status.DRAFT)
            .reduce((sum, d) => sum + d.totalTTC, 0);

        // Calculate Credits (Credit Notes)
        const totalCredits = partnerDocs
            .filter(d => (d.type === DocType.CREDIT_NOTE || d.type === DocType.PURCHASE_CREDIT_NOTE) && d.status !== Status.CANCELLED && d.status !== Status.DRAFT)
            .reduce((sum, d) => sum + d.totalTTC, 0);
        
        // Calculate Payments
        const totalPaid = partnerPayments.reduce((sum, p) => sum + p.amount, 0);
        
        // Final Balance calculation
        const currentBalance = (partner.initialBalance || 0) + totalInvoiced - (totalPaid + totalCredits);

        return { ...partner, currentBalance };
    });

  const getTitle = () => {
      if (showPeriodFilter) {
          if (isClient) return "Sélection Relevés Clients";
          if (isSupplier) return "Sélection Relevés Fournisseurs";
      }
      if (isClient) return "Gestion des Clients";
      if (isSupplier) return "Gestion des Fournisseurs";
      return "Tous les Partenaires";
  }

  const handleRowClick = (partner: Partner) => {
      onEdit(partner, showPeriodFilter ? { startDate, endDate } : undefined);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
      <div className="flex justify-between items-center bg-white p-4 rounded border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            {isClient ? <User className="w-6 h-6 text-indigo-600" /> : isSupplier ? <Truck className="w-6 h-6 text-amber-600" /> : <Users className="w-6 h-6 text-slate-600" />}
            <h2 className="text-xl font-bold text-slate-800">{getTitle()}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
              {showPeriodFilter ? "Sélectionnez une période puis double-cliquez sur un partenaire pour voir son relevé." : "Double-cliquez pour voir le détail et l'historique."}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            {showPeriodFilter && (
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Période du :</span>
                        <input 
                            type="date" 
                            className="border border-slate-300 rounded p-1 text-sm bg-white text-black focus:outline-none focus:border-indigo-500"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Au :</span>
                        <input 
                            type="date" 
                            className="border border-slate-300 rounded p-1 text-sm bg-white text-black focus:outline-none focus:border-indigo-500"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {type && !showPeriodFilter && (
                <button 
                onClick={onCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                >
                <Plus className="w-4 h-4" /> {isClient ? 'Nouveau Client' : 'Nouveau Fournisseur'}
                </button>
            )}
        </div>
      </div>

      <DataTable<Partner & { currentBalance: number }>
        title={getTitle()}
        data={enrichedPartners}
        onRowDoubleClick={handleRowClick}
        columns={[
          { key: 'name', header: 'Nom / Raison Sociale' },
          { key: 'type', header: 'Type', render: (p) => <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${p.type === EntityType.CLIENT ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>{p.type === EntityType.CLIENT ? 'Client' : 'Fournisseur'}</span>},
          { key: 'phone', header: 'Téléphone' },
          { key: 'city', header: 'Ville' },
          { key: 'taxId', header: 'M. Fiscal' },
          { key: 'currentBalance', header: 'Solde Actuel', render: (p) => (
             <span className={`font-bold px-2 py-1 rounded ${p.currentBalance > 0.01 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                 {p.currentBalance.toFixed(2)} {symbol}
             </span>
          )},
        ]}
      />
    </div>
  );
};