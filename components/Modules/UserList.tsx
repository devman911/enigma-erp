
import React from 'react';
import { User } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Plus, Users, Shield } from 'lucide-react';

interface UserListProps {
  users: User[];
  onCreate: () => void;
  onEdit: (user: User) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, onCreate, onEdit }) => {
  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Gestion des Utilisateurs</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Gérez les accès et les permissions de vos collaborateurs.</p>
        </div>
        <button 
          onClick={onCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nouvel Utilisateur
        </button>
      </div>

      <DataTable<User>
        title="Équipe"
        data={users}
        onRowDoubleClick={onEdit}
        columns={[
          { key: 'name', header: 'Nom' },
          { key: 'email', header: 'Email' },
          { key: 'role', header: 'Rôle', render: (u) => (
             <span className="flex items-center gap-1 text-slate-700">
               <Shield className="w-3 h-3 text-slate-400" /> {u.role}
             </span>
          )},
          { key: 'active', header: 'Statut', render: (u) => (
             <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${u.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
               {u.active ? 'Actif' : 'Inactif'}
             </span>
          )},
        ]}
      />
    </div>
  );
};
