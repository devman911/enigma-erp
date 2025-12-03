

import React from 'react';
import { Partner, EntityType } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Plus, User, Truck } from 'lucide-react';

interface PartnerListProps {
  partners: Partner[];
  type: EntityType;
  onCreate: () => void;
  onEdit: (partner: Partner) => void;
  onDelete: (id: string) => void;
  currency: string;
}

export const PartnerList: React.FC<PartnerListProps> = ({ partners, type, onCreate, onEdit, onDelete, currency }) => {
  const filteredPartners = partners.filter(p => p.type === type);
  const isClient = type === EntityType.CLIENT;
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            {isClient ? <User className="w-6 h-6 text-indigo-600" /> : <Truck className="w-6 h-6 text-amber-600" />}
            <h2 className="text-xl font-bold text-slate-800">{isClient ? 'Gestion des Clients' : 'Gestion des Fournisseurs'}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Double-cliquez pour modifier une fiche.</p>
        </div>
        <button 
          onClick={onCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> {isClient ? 'Nouveau Client' : 'Nouveau Fournisseur'}
        </button>
      </div>

      <DataTable<Partner>
        title={isClient ? "Liste des Clients" : "Liste des Fournisseurs"}
        data={filteredPartners}
        onRowDoubleClick={onEdit}
        columns={[
          { key: 'name', header: 'Nom / Raison Sociale' },
          { key: 'email', header: 'Email' },
          { key: 'phone', header: 'Téléphone' },
          { key: 'city', header: 'Ville' },
          { key: 'taxId', header: 'Matricule Fiscal' },
          { key: 'initialBalance', header: 'Solde Initial', render: (p) => <span className="font-medium text-slate-700">{(p.initialBalance || 0).toFixed(2)} {symbol}</span> },
        ]}
      />
    </div>
  );
};