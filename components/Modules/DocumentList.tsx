
import React, { useState } from 'react';
import { Document, DocType, Status } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Plus, Calendar } from 'lucide-react';

interface DocumentListProps {
  documents: Document[];
  docType: DocType;
  title: string;
  partnerLabel: string; // 'Client' or 'Fournisseur'
  onCreate: () => void;
  onEdit: (doc: Document) => void;
  currency: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  docType, 
  title, 
  partnerLabel, 
  onCreate, 
  onEdit, 
  currency 
}) => {
  // Default to first day of current month
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  const filteredDocs = documents.filter(d => {
    if (d.type !== docType) return false;
    const docDate = new Date(d.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);
    
    return docDate >= start && docDate <= end;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderStatusBadge = (status: Status) => {
    let classes = 'bg-slate-200 text-slate-600';
    if (status === Status.PAID) classes = 'bg-green-100 text-green-700';
    if (status === Status.VALIDATED) classes = 'bg-blue-100 text-blue-700';
    if (status === Status.UNPAID) classes = 'bg-red-100 text-red-700';
    if (status === Status.CANCELLED) classes = 'bg-gray-100 text-gray-400 line-through';

    return <span className={`px-2 py-1 rounded text-xs font-bold ${classes}`}>{status}</span>;
  };

  return (
    <div className="p-4 bg-slate-100 h-full flex flex-col gap-4">
      {/* Header & Toolbar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-4 rounded border border-slate-200 shadow-sm">
        <div>
           <h2 className="text-xl font-bold text-slate-800">{title}</h2>
           <p className="text-xs text-slate-500 mt-1">Gérez vos documents sur la période sélectionnée.</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
           {/* Date Filters */}
           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500 ml-1" />
              <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Du :</span>
                  <input 
                    type="date" 
                    className="border border-slate-300 rounded p-1 text-sm bg-white text-black focus:outline-none focus:border-indigo-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Au :</span>
                  <input 
                    type="date" 
                    className="border border-slate-300 rounded p-1 text-sm bg-white text-black focus:outline-none focus:border-indigo-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
              </div>
           </div>

           <button 
             onClick={onCreate} 
             className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium"
           >
             <Plus className="w-4 h-4" /> Créer
           </button>
        </div>
      </div>

      {/* Table */}
      <DataTable<Document>
        title={title}
        data={filteredDocs} 
        columns={[
          { key: 'reference', header: 'Numéro' },
          { key: 'partnerName', header: partnerLabel },
          { key: 'date', header: 'Date' },
          { key: 'totalTTC', header: 'Total TTC', render: (d) => <span className="font-medium">{d.totalTTC.toFixed(2)} {symbol}</span> },
          { key: 'status', header: 'Statut', render: (d) => renderStatusBadge(d.status) }
        ]}
        onRowClick={onEdit}
      />
    </div>
  );
};
