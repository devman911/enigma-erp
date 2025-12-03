
import React, { useState } from 'react';
import { Expense } from '../../types';
import { DataTable } from '../UI/DataTable';
import { TrendingDown, Plus, Trash, Filter, Calendar } from 'lucide-react';
import { ExpenseModal } from './ExpenseModal';

interface ExpenseListProps {
  expenses: Expense[];
  currency: string;
  onAdd: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, currency, onAdd, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter
  const filteredExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      return d >= start && d <= end;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPeriod = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
      
      {showModal && (
        <ExpenseModal 
            currencySymbol={symbol}
            onSave={(e) => { onAdd(e); setShowModal(false); }}
            onClose={() => setShowModal(false)}
        />
      )}

      <div className="flex justify-between items-center bg-white p-4 rounded border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-slate-800">Gestion des Dépenses</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Frais généraux, charges et sorties diverses.</p>
        </div>
        
        <div className="flex items-center gap-4">
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
             onClick={() => setShowModal(true)}
             className="bg-red-600 text-white px-4 py-2 rounded shadow-sm hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
           >
             <Plus className="w-4 h-4" /> Nouvelle Dépense
           </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded border border-slate-200 flex justify-end">
          <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">Total Dépenses (Période)</p>
              <p className="text-2xl font-bold text-red-600">-{totalPeriod.toFixed(2)} {symbol}</p>
          </div>
      </div>

      <DataTable
        title="Journal des Dépenses"
        data={filteredExpenses}
        columns={[
          { key: 'date', header: 'Date' },
          { key: 'category', header: 'Catégorie', render: (e) => <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold uppercase">{e.category}</span> },
          { key: 'description', header: 'Description' },
          { key: 'method', header: 'Mode' },
          { key: 'amount', header: 'Montant', render: (e: any) => (
             <span className="font-bold text-red-600">
               -{e.amount.toFixed(2)} {symbol}
             </span>
          )},
          { key: 'reference', header: 'Réf.' },
          { key: 'id', header: 'Action', render: (e) => (
             <button onClick={() => onDelete(e.id)} className="text-slate-400 hover:text-red-600 transition-colors" title="Supprimer">
                 <Trash className="w-4 h-4" />
             </button>
          )}
        ]}
      />
    </div>
  );
};
