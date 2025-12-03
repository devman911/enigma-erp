
import React, { useState, useMemo } from 'react';
import { Partner, EntityType } from '../../types';
import { X, Search, User, Truck, Phone, MapPin } from 'lucide-react';

interface PartnerSelectionModalProps {
  partners: Partner[];
  type?: EntityType; // Optional filter (CLIENT only or SUPPLIER only)
  onSelect: (partner: Partner) => void;
  onClose: () => void;
}

export const PartnerSelectionModal: React.FC<PartnerSelectionModalProps> = ({ 
  partners, 
  type, 
  onSelect, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPartners = useMemo(() => {
    return partners.filter(p => {
      // Filter by type if specified
      if (type && p.type !== type) return false;

      // Filter by search term
      const term = searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) || 
        p.email.toLowerCase().includes(term) ||
        p.phone.includes(term) ||
        (p.taxId && p.taxId.toLowerCase().includes(term))
      );
    });
  }, [partners, type, searchTerm]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110] backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-600" />
              Sélectionner un {type === EntityType.CLIENT ? 'Client' : type === EntityType.SUPPLIER ? 'Fournisseur' : 'Tiers'}
            </h3>
            <p className="text-xs text-slate-500">
                Double-cliquez sur une ligne pour sélectionner.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
              placeholder="Rechercher par nom, téléphone, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4">
          <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 font-semibold text-slate-600">Nom / Raison Sociale</th>
                  <th className="p-3 font-semibold text-slate-600">Type</th>
                  <th className="p-3 font-semibold text-slate-600">Contact</th>
                  <th className="p-3 font-semibold text-slate-600">Ville</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPartners.map(partner => (
                  <tr 
                    key={partner.id} 
                    className="hover:bg-indigo-50 transition-colors cursor-pointer group"
                    onClick={() => onSelect(partner)}
                  >
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{partner.name}</div>
                      {partner.taxId && <div className="text-xs text-slate-500">MF: {partner.taxId}</div>}
                    </td>
                    <td className="p-3">
                        <span className={`flex items-center gap-1 text-xs font-bold uppercase px-2 py-1 rounded w-fit ${partner.type === EntityType.CLIENT ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                            {partner.type === EntityType.CLIENT ? <User className="w-3 h-3"/> : <Truck className="w-3 h-3"/>}
                            {partner.type === EntityType.CLIENT ? 'Client' : 'Fourn.'}
                        </span>
                    </td>
                    <td className="p-3 text-slate-600">
                        <div className="flex items-center gap-1 text-xs mb-1">
                            <Phone className="w-3 h-3 text-slate-400" /> {partner.phone}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[150px]">{partner.email}</div>
                    </td>
                    <td className="p-3 text-slate-600 text-xs">
                        {partner.city}
                    </td>
                    <td className="p-3 text-right">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onSelect(partner); }}
                            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700"
                        >
                            Choisir
                        </button>
                    </td>
                  </tr>
                ))}
                {filteredPartners.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">Aucun partenaire trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
          >
            Annuler
          </button>
        </div>

      </div>
    </div>
  );
};
