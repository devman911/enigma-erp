
import React, { useState } from 'react';
import { InventorySession, Product, InventoryItem, Status } from '../../types';
import { Save, X, ClipboardCheck, Search, AlertTriangle, CheckCircle } from 'lucide-react';

interface InventorySessionEditorProps {
  initialData?: InventorySession;
  products: Product[]; // Required to snapshot current stock
  onSave: (session: InventorySession) => void;
  onCancel: () => void;
}

export const InventorySessionEditor: React.FC<InventorySessionEditorProps> = ({ initialData, products, onSave, onCancel }) => {
  const [formData, setFormData] = useState<InventorySession>(() => {
    if (initialData) return initialData;
    
    // If new, snapshot all products
    const items: InventoryItem[] = products.map(p => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        expectedStock: p.stock,
        countedStock: p.stock, // Default to expected
        difference: 0
    }));

    return {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString().split('T')[0],
        reference: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        status: Status.DRAFT,
        note: '',
        items
    };
  });

  const [searchTerm, setSearchTerm] = useState('');
  
  const isValidated = formData.status === Status.VALIDATED;

  const handleItemChange = (productId: string, counted: number) => {
      if (isValidated) return;
      
      setFormData(prev => ({
          ...prev,
          items: prev.items.map(item => {
              if (item.productId === productId) {
                  return {
                      ...item,
                      countedStock: counted,
                      difference: counted - item.expectedStock
                  };
              }
              return item;
          })
      }));
  };

  const handleSave = (validate: boolean) => {
      if (validate) {
          if (!confirm("Attention : Valider l'inventaire mettra à jour le stock de tous les produits listés. Cette action est irréversible. Continuer ?")) {
              return;
          }
      }
      onSave({ ...formData, status: validate ? Status.VALIDATED : Status.DRAFT });
  };

  const filteredItems = formData.items.filter(i => 
      i.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white h-full flex flex-col p-6 overflow-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
               {isValidated ? `Inventaire Validé : ${formData.reference}` : 'Saisie d\'Inventaire'}
            </h2>
          </div>
          <p className="text-sm text-slate-500 ml-12">
             {isValidated 
                ? "Cet inventaire est clôturé. Les stocks ont été mis à jour." 
                : "Saisissez les quantités réelles constatées. Valider mettra à jour le stock."}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" /> Fermer
          </button>
          
          {!isValidated && (
            <>
                <button 
                    onClick={() => handleSave(false)} 
                    className="px-4 py-2 border border-indigo-200 text-indigo-700 rounded hover:bg-indigo-50 flex items-center gap-2 transition-colors"
                >
                    <Save className="w-4 h-4" /> Sauvegarder Brouillon
                </button>
                <button 
                    onClick={() => handleSave(true)} 
                    className="px-4 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                >
                    <CheckCircle className="w-4 h-4" /> Valider & Mettre à jour Stock
                </button>
            </>
          )}
        </div>
      </div>

      {/* Form Details */}
      <div className="bg-slate-50 p-4 rounded border border-slate-200 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
           <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Référence</label>
               <input 
                   type="text" 
                   className="w-full border border-slate-300 rounded p-2 bg-white text-black font-medium"
                   value={formData.reference}
                   onChange={e => setFormData({...formData, reference: e.target.value})}
                   readOnly={isValidated}
               />
           </div>
           <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
               <input 
                   type="date" 
                   className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                   value={formData.date}
                   onChange={e => setFormData({...formData, date: e.target.value})}
                   readOnly={isValidated}
               />
           </div>
           <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Note / Commentaire</label>
               <input 
                   type="text" 
                   className="w-full border border-slate-300 rounded p-2 bg-white text-black"
                   value={formData.note}
                   onChange={e => setFormData({...formData, note: e.target.value})}
                   readOnly={isValidated}
                   placeholder="Ex: Inventaire annuel"
               />
           </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
              placeholder="Filtrer par nom ou SKU..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500 ml-auto">
              Total articles : <strong>{filteredItems.length}</strong>
          </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto border border-slate-200 rounded">
          <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 sticky top-0 z-10">
                  <tr>
                      <th className="p-3 font-bold text-slate-600 border-b">Article</th>
                      <th className="p-3 font-bold text-slate-600 border-b">SKU</th>
                      <th className="p-3 font-bold text-slate-600 border-b text-right bg-slate-200/50">Stock Théorique</th>
                      <th className="p-3 font-bold text-slate-600 border-b text-right w-40 bg-white border-x border-slate-200">Stock Réel (Compté)</th>
                      <th className="p-3 font-bold text-slate-600 border-b text-right">Ecart</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                      <tr key={item.productId} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-800">{item.productName}</td>
                          <td className="p-3 font-mono text-xs text-slate-500">{item.sku}</td>
                          <td className="p-3 text-right bg-slate-50 text-slate-500">{item.expectedStock}</td>
                          <td className="p-3 text-right bg-white border-x border-slate-200 p-0">
                              <input 
                                  type="number" 
                                  className={`w-full h-full text-right p-3 outline-none focus:ring-2 focus:ring-indigo-500 font-bold bg-transparent text-black ${item.difference !== 0 ? 'bg-amber-50' : ''}`}
                                  value={item.countedStock}
                                  onChange={e => handleItemChange(item.productId, parseInt(e.target.value) || 0)}
                                  readOnly={isValidated}
                              />
                          </td>
                          <td className="p-3 text-right">
                              <span className={`font-bold ${item.difference === 0 ? 'text-slate-300' : item.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {item.difference > 0 ? '+' : ''}{item.difference}
                              </span>
                              {item.difference !== 0 && (
                                  <AlertTriangle className={`w-4 h-4 inline-block ml-2 ${item.difference > 0 ? 'text-green-400' : 'text-red-400'}`} />
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

    </div>
  );
};
