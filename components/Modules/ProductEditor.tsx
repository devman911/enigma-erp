import React, { useState, useEffect } from 'react';
import { Product, ProductFamily, ProductCategory, ProductSubCategory, TaxRate } from '../../types';
import { Save, X, Package, Barcode, AlertTriangle, Tag, DollarSign, Layers, Percent } from 'lucide-react';

interface ProductEditorProps {
  initialData?: Product;
  families: ProductFamily[];
  categories: ProductCategory[];
  subCategories: ProductSubCategory[];
  taxRates: TaxRate[];
  onSave: (product: Product) => void;
  onCancel: () => void;
  currency: string;
}

export const ProductEditor: React.FC<ProductEditorProps> = ({ 
  initialData, 
  families,
  categories,
  subCategories,
  taxRates,
  onSave, 
  onCancel,
  currency
}) => {
  const [formData, setFormData] = useState<Product>(initialData || {
    id: Math.random().toString(36).substr(2, 9),
    sku: '',
    name: '',
    categoryLabel: '',
    familyId: '',
    categoryId: '',
    subCategoryId: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    taxRate: 20 // Default VAT if list is empty
  });

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  // Filter lists based on selection
  const filteredCategories = categories.filter(c => c.familyId === formData.familyId);
  const filteredSubCategories = subCategories.filter(s => s.categoryId === formData.categoryId);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, familyId: val, categoryId: '', subCategoryId: '' }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, categoryId: val, subCategoryId: '' }));
  };

  // --- Pricing Logic ---
  
  const handlePriceHTChange = (val: number) => {
    setFormData(prev => ({ ...prev, price: val }));
  };

  // Update Price HT based on Price TTC input
  const handlePriceTTCChange = (val: number) => {
    const rate = formData.taxRate || 0;
    const ht = val / (1 + rate / 100);
    setFormData(prev => ({ ...prev, price: parseFloat(ht.toFixed(2)) }));
  };

  const handleCostHTChange = (val: number) => {
    setFormData(prev => ({ ...prev, cost: val }));
  };

  // Update Cost HT based on Cost TTC input
  const handleCostTTCChange = (val: number) => {
    const rate = formData.taxRate || 0;
    const ht = val / (1 + rate / 100);
    setFormData(prev => ({ ...prev, cost: parseFloat(ht.toFixed(2)) }));
  };

  const getPriceTTC = () => {
    return (formData.price * (1 + (formData.taxRate || 0) / 100)).toFixed(2);
  };

  const getCostTTC = () => {
    return (formData.cost * (1 + (formData.taxRate || 0) / 100)).toFixed(2);
  };

  // --- End Pricing Logic ---

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) {
      alert("Le nom et la référence (SKU) sont obligatoires.");
      return;
    }

    // Generate Label automatically based on hierarchy
    let label = 'Général';
    if (formData.categoryId) {
       const cat = categories.find(c => c.id === formData.categoryId);
       const sub = subCategories.find(s => s.id === formData.subCategoryId);
       label = cat ? cat.name : '';
       if (sub) label += ` > ${sub.name}`;
    } else if (formData.familyId) {
        const fam = families.find(f => f.id === formData.familyId);
        label = fam ? fam.name : 'Général';
    } else if (formData.categoryLabel && formData.categoryLabel !== 'Général') {
        label = formData.categoryLabel;
    }

    onSave({ ...formData, categoryLabel: label });
  };

  return (
    <div className="bg-white h-full flex flex-col p-6 overflow-auto animate-in fade-in duration-200">
      {/* En-tête */}
      <div className="flex justify-between items-start mb-8 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {initialData ? `Modifier : ${initialData.name}` : 'Nouveau Produit'}
            </h2>
          </div>
          <p className="text-sm text-slate-500 ml-12">
            Configurez les détails du produit, sa classification et ses niveaux de stock.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" /> Annuler
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" /> Enregistrer le produit
          </button>
        </div>
      </div>

      {/* Formulaire Grid */}
      <form className="max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        
        {/* Colonne Gauche : Infos Générales & Classification */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-500" /> Informations & Classification
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom du produit <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                className="w-full border border-slate-300 rounded-md p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white text-black"
                placeholder="Ex: Chaise de Bureau Ergonomique"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Référence (SKU) <span className="text-red-500">*</span></label>
              <div className="relative">
                <Barcode className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-md p-2.5 pl-9 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                  placeholder="PROD-001"
                  value={formData.sku}
                  onChange={e => handleChange('sku', e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 bg-slate-50 rounded border border-slate-200 mt-4">
               <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">Hiérarchie</span>
               
               <div className="grid grid-cols-2 gap-4">
                  {/* FAMILLE */}
                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Famille</label>
                      <select 
                        className="w-full border border-slate-300 rounded p-2 text-sm bg-white text-black"
                        value={formData.familyId || ''}
                        onChange={handleFamilyChange}
                      >
                        <option value="">-- Sélectionner --</option>
                        {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                  </div>

                  {/* CATEGORIE */}
                  <div>
                      <label className="block text-xs text-slate-500 mb-1">Catégorie</label>
                      <select 
                        className="w-full border border-slate-300 rounded p-2 text-sm disabled:opacity-50 bg-white text-black"
                        value={formData.categoryId || ''}
                        onChange={handleCategoryChange}
                        disabled={!formData.familyId}
                      >
                        <option value="">-- Sélectionner --</option>
                        {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                  </div>
               </div>

               {/* SOUS CATEGORIE */}
               <div>
                  <label className="block text-xs text-slate-500 mb-1">Sous-Catégorie</label>
                  <select 
                    className="w-full border border-slate-300 rounded p-2 text-sm disabled:opacity-50 bg-white text-black"
                    value={formData.subCategoryId || ''}
                    onChange={(e) => handleChange('subCategoryId', e.target.value)}
                    disabled={!formData.categoryId}
                  >
                     <option value="">-- Sélectionner Sous-Catégorie --</option>
                     {filteredSubCategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Actuel</label>
              <input 
                type="number" 
                className="w-full border border-slate-300 rounded-md p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                value={formData.stock}
                onChange={e => handleChange('stock', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alerte Stock Min.</label>
              <div className="relative">
                <AlertTriangle className="w-4 h-4 absolute left-3 top-3 text-amber-500" />
                <input 
                  type="number" 
                  className="w-full border border-slate-300 rounded-md p-2.5 pl-9 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                  value={formData.minStock}
                  onChange={e => handleChange('minStock', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Colonne Droite : Tarification, TVA & Coûts */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-500" /> Tarification & Taxes
          </h3>
          
          {/* TVA Selector */}
          <div className="w-1/2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Taux de TVA</label>
            <div className="relative">
              <Percent className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <select
                className="w-full border border-slate-300 rounded-md p-2.5 pl-9 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                value={formData.taxRate}
                onChange={e => handleChange('taxRate', parseFloat(e.target.value))}
              >
                {taxRates.map(t => (
                  <option key={t.id} value={t.rate}>{t.name} ({t.rate}%)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded border border-slate-200 space-y-6">
            
            {/* Section Vente */}
            <div>
              <h4 className="text-xs font-bold text-indigo-600 uppercase mb-3">Prix de Vente</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Montant HT</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">{symbol}</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full border border-slate-300 rounded p-2 pl-9 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                      value={formData.price}
                      onChange={e => handlePriceHTChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Montant TTC</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-800 font-bold">{symbol}</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full border border-indigo-300 rounded p-2 pl-9 focus:ring-2 focus:ring-indigo-500 outline-none font-bold bg-white text-black"
                      value={getPriceTTC()}
                      onChange={e => handlePriceTTCChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200"></div>

            {/* Section Achat */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Coût d'Achat</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Coût HT</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">{symbol}</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full border border-slate-300 rounded p-2 pl-9 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                      value={formData.cost}
                      onChange={e => handleCostHTChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Coût TTC (Indicatif)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500">{symbol}</span>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full border border-slate-300 rounded p-2 pl-9 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                      value={getCostTTC()}
                      onChange={e => handleCostTTCChange(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="flex gap-4 items-center p-4 bg-emerald-50 text-emerald-800 rounded-md text-sm border border-emerald-100">
            <div className="font-bold">Marge brute :</div>
            <div>
              {formData.price > 0 
                ? `${((formData.price - formData.cost) / formData.price * 100).toFixed(1)} %` 
                : '0 %'}
            </div>
            <div className="text-emerald-300">|</div>
            <div className="font-bold">Profit unitaire :</div>
            <div>{(formData.price - formData.cost).toFixed(2)} {symbol} HT</div>
          </div>

        </div>
      </form>
    </div>
  );
};