import React from 'react';
import { Product } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Plus, AlertTriangle } from 'lucide-react';

interface InventoryProps {
  products: Product[];
  onCreate: () => void;
  onEdit: (p: Product) => void;
  currency: string;
}

export const Inventory: React.FC<InventoryProps> = ({ products, onCreate, onEdit, currency }) => {
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Gestion des Stocks</h2>
          <p className="text-xs text-slate-500 mt-1">Double-cliquez sur une ligne pour modifier un produit.</p>
        </div>
        <button 
          onClick={onCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Créer un produit
        </button>
      </div>

      <DataTable<Product>
        title="Produits"
        data={products}
        onRowDoubleClick={onEdit}
        columns={[
          { key: 'sku', header: 'Réf' },
          { key: 'name', header: 'Nom' },
          { key: 'categoryLabel', header: 'Catégorie' },
          { key: 'stock', header: 'Stock', render: (p) => (
            <span className={`font-bold ${p.stock <= p.minStock ? 'text-red-600 flex items-center gap-1' : 'text-slate-700'}`}>
              {p.stock <= p.minStock && <AlertTriangle className="w-3 h-3" />}
              {p.stock}
            </span>
          )},
          { key: 'price', header: 'Vente HT', render: (p) => `${p.price.toFixed(2)} ${symbol}` },
          { key: 'taxRate', header: 'TVA', render: (p) => `${p.taxRate || 20}%` },
          { key: 'priceTTC', header: 'Vente TTC', render: (p) => `${(p.price * (1 + (p.taxRate || 20)/100)).toFixed(2)} ${symbol}` },
          { key: 'costTTC', header: 'Achat TTC', render: (p) => `${(p.cost * (1 + (p.taxRate || 20)/100)).toFixed(2)} ${symbol}` },
        ]}
      />
    </div>
  );
};