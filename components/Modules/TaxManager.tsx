import React, { useState } from 'react';
import { TaxRate } from '../../types';
import { Plus, Trash, Percent } from 'lucide-react';

interface TaxManagerProps {
  taxRates: TaxRate[];
  onAdd: (name: string, rate: number) => void;
  onDelete: (id: string) => void;
}

export const TaxManager: React.FC<TaxManagerProps> = ({ taxRates, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [rate, setRate] = useState<string>('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && rate) {
      onAdd(name, parseFloat(rate));
      setName('');
      setRate('');
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-50 gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Percent className="w-6 h-6 text-indigo-600" />
          Gestion de la TVA
        </h2>
        <p className="text-slate-500">Configurez les taux de TVA applicables à vos produits.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* List of Taxes */}
        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b font-semibold text-slate-700">Taux Actuels</div>
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-right">Taux (%)</th>
                <th className="p-3 text-center w-12">Action</th>
              </tr>
            </thead>
            <tbody>
              {taxRates.map(t => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3">{t.name}</td>
                  <td className="p-3 text-right font-medium">{t.rate} %</td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {taxRates.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-400">Aucun taux configuré.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Form */}
        <div className="bg-white rounded shadow-sm border border-slate-200 h-fit">
          <div className="p-4 bg-slate-50 border-b font-semibold text-slate-700">Ajouter un Taux</div>
          <form onSubmit={handleAdd} className="p-4 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom du Taux</label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                placeholder="Ex: TVA Luxe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pourcentage (%)</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                placeholder="20"
                value={rate}
                onChange={e => setRate(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit"
              className="mt-2 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Ajouter
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};