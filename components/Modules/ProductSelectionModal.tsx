
import React, { useState, useMemo } from 'react';
import { Product } from '../../types';
import { X, Search, CheckCircle, Package, ShoppingCart } from 'lucide-react';

interface ProductSelectionModalProps {
  products: Product[];
  currencySymbol: string;
  isPurchase: boolean;
  onSelect: (selectedItems: { product: Product; quantity: number }[]) => void;
  onClose: () => void;
}

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ 
  products, 
  currencySymbol, 
  isPurchase,
  onSelect, 
  onClose 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Map of ProductID -> Quantity
  const [selections, setSelections] = useState<{ [key: string]: number }>({});

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryLabel?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleToggle = (productId: string) => {
    setSelections(prev => {
      const copy = { ...prev };
      if (copy[productId]) {
        delete copy[productId];
      } else {
        copy[productId] = 1;
      }
      return copy;
    });
  };

  const handleQuantityChange = (productId: string, val: string) => {
    const qty = parseInt(val);
    setSelections(prev => {
      const copy = { ...prev };
      if (!qty || qty <= 0) {
        delete copy[productId];
      } else {
        copy[productId] = qty;
      }
      return copy;
    });
  };

  const handleSubmit = () => {
    const result = Object.entries(selections).map(([id, quantity]) => {
      const product = products.find(p => p.id === id);
      return product ? { product, quantity } : null;
    }).filter(Boolean) as { product: Product; quantity: number }[];

    if (result.length > 0) {
      onSelect(result);
    }
    onClose();
  };

  const selectedCount = Object.keys(selections).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Catalogue Produits
            </h3>
            <p className="text-xs text-slate-500">
                {isPurchase ? "Sélectionnez les articles à commander/acheter." : "Sélectionnez les articles à vendre."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
              placeholder="Rechercher par nom, référence, catégorie..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-2 rounded">
            {selectedCount} article(s) sélectionné(s)
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto bg-slate-50 p-4">
          <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="p-3 w-12 text-center"></th>
                  <th className="p-3 font-semibold text-slate-600">Produit</th>
                  <th className="p-3 font-semibold text-slate-600">Réf</th>
                  
                  {/* Dynamic Columns based on Context */}
                  <th className="p-3 text-right font-semibold text-slate-600">
                      {isPurchase ? 'Achat HT' : 'Vente HT'}
                  </th>
                  <th className="p-3 text-right font-semibold text-slate-600">TVA</th>
                  <th className="p-3 text-right font-semibold text-slate-600">
                      {isPurchase ? 'Achat TTC' : 'P.U. TTC'}
                  </th>

                  <th className="p-3 text-right font-semibold text-slate-600">Stock</th>
                  <th className="p-3 text-right font-semibold text-slate-600 w-32">Quantité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(product => {
                  const isSelected = !!selections[product.id];
                  const priceHT = isPurchase ? product.cost : product.price;
                  const tax = product.taxRate || 20;
                  const priceTTC = priceHT * (1 + tax / 100);

                  return (
                    <tr 
                      key={product.id} 
                      className={`hover:bg-indigo-50 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/50' : ''}`}
                      onClick={() => handleToggle(product.id)}
                    >
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggle(product.id)}
                          className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-slate-800">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.categoryLabel}</div>
                      </td>
                      <td className="p-3 font-mono text-xs text-slate-600">{product.sku}</td>
                      
                      <td className="p-3 text-right font-medium text-slate-700">
                        {priceHT.toFixed(2)} {currencySymbol}
                      </td>
                      <td className="p-3 text-right text-slate-500">
                        {tax}%
                      </td>
                      <td className="p-3 text-right font-bold text-slate-800">
                        {priceTTC.toFixed(2)} {currencySymbol}
                      </td>

                      <td className="p-3 text-right">
                         <span className={`${product.stock <= product.minStock ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                           {product.stock}
                         </span>
                      </td>
                      <td className="p-3" onClick={e => e.stopPropagation()}>
                        <input 
                          type="number" 
                          min="1"
                          className={`w-full text-right border rounded p-1.5 outline-none focus:ring-2 focus:ring-indigo-500 text-black ${isSelected ? 'bg-white border-indigo-300 font-bold' : 'bg-slate-50 border-slate-200'}`}
                          value={selections[product.id] || ''}
                          placeholder={isSelected ? '1' : '-'}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">Aucun produit trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-lg">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit}
            disabled={selectedCount === 0}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            Ajouter {selectedCount > 0 ? `${selectedCount} articles` : ''}
          </button>
        </div>

      </div>
    </div>
  );
};
