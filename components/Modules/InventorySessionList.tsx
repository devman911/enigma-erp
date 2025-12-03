
import React from 'react';
import { InventorySession, Status } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Plus, ClipboardCheck } from 'lucide-react';

interface InventorySessionListProps {
  sessions: InventorySession[];
  onCreate: () => void;
  onEdit: (session: InventorySession) => void;
}

export const InventorySessionList: React.FC<InventorySessionListProps> = ({ sessions, onCreate, onEdit }) => {
  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
      <div className="flex justify-between items-center bg-white p-4 rounded border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Inventaires Physiques</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Gérez les sessions de comptage et ajustez vos stocks.</p>
        </div>
        
        <button 
          onClick={onCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nouvel Inventaire
        </button>
      </div>

      <DataTable<InventorySession>
        title="Historique des Inventaires"
        data={sessions}
        onRowDoubleClick={onEdit}
        columns={[
          { key: 'reference', header: 'Référence' },
          { key: 'date', header: 'Date' },
          { key: 'note', header: 'Note' },
          { key: 'status', header: 'Statut', render: (s) => (
             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${s.status === Status.VALIDATED ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
               {s.status}
             </span>
          )},
          { key: 'items', header: 'Articles', render: (s) => s.items.length + ' articles' }
        ]}
      />
    </div>
  );
};
