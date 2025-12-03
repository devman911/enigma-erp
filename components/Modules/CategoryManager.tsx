

import React, { useState } from 'react';
import { ProductFamily, ProductCategory, ProductSubCategory } from '../../types';
import { Plus, Folder, ChevronRight, Layers, Tag, Edit2 } from 'lucide-react';

interface CategoryManagerProps {
  families: ProductFamily[];
  categories: ProductCategory[];
  subCategories: ProductSubCategory[];
  onAddFamily: (name: string) => void;
  onUpdateFamily: (id: string, name: string) => void;
  onAddCategory: (familyId: string, name: string) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onAddSubCategory: (categoryId: string, name: string) => void;
  onUpdateSubCategory: (id: string, name: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  families,
  categories,
  subCategories,
  onAddFamily,
  onUpdateFamily,
  onAddCategory,
  onUpdateCategory,
  onAddSubCategory,
  onUpdateSubCategory
}) => {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [newFamilyName, setNewFamilyName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubName, setNewSubName] = useState('');

  // Filtering
  const filteredCategories = categories.filter(c => c.familyId === selectedFamilyId);
  const filteredSubCategories = subCategories.filter(s => s.categoryId === selectedCategoryId);

  // Handlers
  const handleCreateFamily = () => {
    if (newFamilyName.trim()) {
      onAddFamily(newFamilyName);
      setNewFamilyName('');
    }
  };

  const handleEditFamily = (e: React.MouseEvent, id: string, currentName: string) => {
      e.stopPropagation();
      const newName = prompt("Modifier le nom de la famille", currentName);
      if (newName && newName.trim() !== "") {
          onUpdateFamily(id, newName);
      }
  };

  const handleCreateCategory = () => {
    if (selectedFamilyId && newCategoryName.trim()) {
      onAddCategory(selectedFamilyId, newCategoryName);
      setNewCategoryName('');
    }
  };

  const handleEditCategory = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    const newName = prompt("Modifier le nom de la catégorie", currentName);
    if (newName && newName.trim() !== "") {
        onUpdateCategory(id, newName);
    }
  };

  const handleCreateSubCategory = () => {
    if (selectedCategoryId && newSubName.trim()) {
      onAddSubCategory(selectedCategoryId, newSubName);
      setNewSubName('');
    }
  };

  const handleEditSubCategory = (e: React.MouseEvent, id: string, currentName: string) => {
    e.stopPropagation();
    const newName = prompt("Modifier le nom de la sous-catégorie", currentName);
    if (newName && newName.trim() !== "") {
        onUpdateSubCategory(id, newName);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
      <div className="flex items-center gap-2 mb-2">
        <Layers className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-xl font-bold text-slate-800">Structure du Catalogue</h2>
          <p className="text-xs text-slate-500">Gérez les Familles, Catégories et Sous-catégories.</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0">
        
        {/* COLONNE 1: FAMILLES */}
        <div className="bg-white border border-slate-200 rounded-md flex flex-col shadow-sm">
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
            <span>Familles</span>
            <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full">{families.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {families.map(fam => (
              <div 
                key={fam.id}
                onClick={() => { setSelectedFamilyId(fam.id); setSelectedCategoryId(null); }}
                className={`p-2 rounded cursor-pointer flex justify-between items-center text-sm group ${
                  selectedFamilyId === fam.id ? 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-100' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                   <Folder className="w-4 h-4" />
                   {fam.name}
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => handleEditFamily(e, fam.id, fam.name)}
                        className="p-1 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Modifier"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    {selectedFamilyId === fam.id && <ChevronRight className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nouvelle Famille" 
                className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500 bg-white text-black"
                value={newFamilyName}
                onChange={e => setNewFamilyName(e.target.value)}
              />
              <button 
                onClick={handleCreateFamily}
                disabled={!newFamilyName.trim()}
                className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE 2: CATEGORIES */}
        <div className={`bg-white border border-slate-200 rounded-md flex flex-col shadow-sm transition-opacity ${!selectedFamilyId ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
            <span>Catégories</span>
            <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full">{filteredCategories.length}</span>
          </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {selectedFamilyId && filteredCategories.length === 0 && (
               <div className="text-center text-xs text-slate-400 mt-10">Aucune catégorie dans cette famille.</div>
             )}
            {filteredCategories.map(cat => (
              <div 
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`p-2 rounded cursor-pointer flex justify-between items-center text-sm group ${
                  selectedCategoryId === cat.id ? 'bg-indigo-50 text-indigo-700 font-medium border border-indigo-100' : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                 <div className="flex items-center gap-2">
                   <Tag className="w-4 h-4" />
                   {cat.name}
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={(e) => handleEditCategory(e, cat.id, cat.name)}
                        className="p-1 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Modifier"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                    {selectedCategoryId === cat.id && <ChevronRight className="w-4 h-4" />}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nouvelle Catégorie" 
                className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500 bg-white text-black"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
              />
              <button 
                onClick={handleCreateCategory}
                disabled={!newCategoryName.trim()}
                className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* COLONNE 3: SOUS-CATEGORIES */}
        <div className={`bg-white border border-slate-200 rounded-md flex flex-col shadow-sm transition-opacity ${!selectedCategoryId ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between items-center">
            <span>Sous-Catégories</span>
            <span className="bg-slate-200 text-xs px-2 py-0.5 rounded-full">{filteredSubCategories.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {selectedCategoryId && filteredSubCategories.length === 0 && (
               <div className="text-center text-xs text-slate-400 mt-10">Aucune sous-catégorie.</div>
             )}
            {filteredSubCategories.map(sub => (
              <div 
                key={sub.id}
                className="p-2 rounded text-sm hover:bg-slate-50 text-slate-600 flex justify-between items-center border border-transparent hover:border-slate-100 group"
              >
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                    {sub.name}
                </div>
                <button 
                    onClick={(e) => handleEditSubCategory(e, sub.id, sub.name)}
                    className="p-1 text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Modifier"
                >
                    <Edit2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 bg-slate-50">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Nouvelle Sous-Cat." 
                className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500 bg-white text-black"
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
              />
              <button 
                onClick={handleCreateSubCategory}
                disabled={!newSubName.trim()}
                className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};