import React, { useState } from 'react';
import { User, Role } from '../../types';
import { Save, X, User as UserIcon, Shield, Lock, Mail } from 'lucide-react';

interface UserEditorProps {
  initialData?: User;
  onSave: (user: User) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

export const UserEditor: React.FC<UserEditorProps> = ({ initialData, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState<User>(initialData || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    email: '',
    role: Role.SALES,
    active: true
  });

  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Le nom et l'email sont obligatoires.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="bg-white h-full flex flex-col p-6 overflow-auto animate-in fade-in duration-200">
      <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <UserIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {initialData ? `Modifier : ${initialData.name}` : 'Nouvel Utilisateur'}
            </h2>
          </div>
          <p className="text-sm text-slate-500 ml-12">
            Définissez les informations de profil et les permissions d'accès.
          </p>
        </div>
        <div className="flex gap-3">
          {initialData && (
             <button onClick={() => onDelete(formData.id)} className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50">
               Supprimer
             </button>
          )}
          <button onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 flex items-center gap-2">
            <X className="w-4 h-4" /> Annuler
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 flex items-center gap-2">
            <Save className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
           <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b pb-2">
             <UserIcon className="w-4 h-4 text-slate-500" /> Informations Personnelles
           </h3>
           
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
             <input 
               type="text" 
               className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
               value={formData.name}
               onChange={e => handleChange('name', e.target.value)}
               autoFocus
             />
           </div>

           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Mail className="w-3 h-3 text-slate-400" /> Email (Identifiant)
             </label>
             <input 
               type="email" 
               className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
               value={formData.email}
               onChange={e => handleChange('email', e.target.value)}
             />
           </div>
           
           {!initialData && (
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Lock className="w-3 h-3 text-slate-400" /> Mot de passe
                </label>
                <input 
                type="password" 
                className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                placeholder="••••••••"
                />
             </div>
           )}
        </div>

        <div className="bg-white p-6 rounded-lg border border-indigo-200 ring-1 ring-indigo-50 space-y-4">
            <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2 border-b border-indigo-100 pb-2">
             <Shield className="w-4 h-4 text-indigo-500" /> Permissions & Accès
           </h3>
           
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Rôle</label>
             <select 
               className="w-full border border-slate-300 rounded p-2.5 bg-white text-black focus:ring-2 focus:ring-indigo-500 outline-none"
               value={formData.role}
               onChange={e => handleChange('role', e.target.value)}
             >
               {Object.values(Role).map(role => (
                 <option key={role} value={role}>{role}</option>
               ))}
             </select>
             <p className="text-xs text-slate-500 mt-2">
               <b>Administrateur:</b> Accès total. <br/>
               <b>Commercial:</b> Ventes & Clients uniquement. <br/>
               <b>Responsable Stock:</b> Inventaire & Achats.
             </p>
           </div>

           <div className="flex items-center gap-2 mt-4">
              <input 
                type="checkbox" 
                id="active"
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 bg-white"
                checked={formData.active}
                onChange={e => handleChange('active', e.target.checked)}
              />
              <label htmlFor="active" className="text-sm font-medium text-slate-700 cursor-pointer">
                Compte Actif
              </label>
           </div>
        </div>

      </form>
    </div>
  );
};