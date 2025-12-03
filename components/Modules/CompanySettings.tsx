import React, { useState } from 'react';
import { CompanySettings as CompanySettingsType } from '../../types';
import { Building2, Save, MapPin, Phone, Mail, Globe, Hash, Upload, Image as ImageIcon, X } from 'lucide-react';

interface CompanySettingsProps {
  data: CompanySettingsType;
  onSave: (settings: CompanySettingsType) => void;
}

export const CompanySettings: React.FC<CompanySettingsProps> = ({ data, onSave }) => {
  const [formData, setFormData] = useState<CompanySettingsType>({ ...data });

  const handleChange = (field: keyof CompanySettingsType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
      setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="h-full bg-slate-50 p-6 flex flex-col gap-6 animate-in fade-in duration-200 overflow-auto">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Paramètres de la Société
          </h2>
          <p className="text-slate-500 mt-1">Gérez les informations légales qui apparaîtront sur vos documents (factures, devis...).</p>
        </div>
        <button 
          onClick={handleSubmit}
          className="bg-indigo-600 text-white px-6 py-2 rounded-md shadow-sm hover:bg-indigo-700 flex items-center gap-2 transition-colors font-medium"
        >
          <Save className="w-4 h-4" /> Enregistrer
        </button>
      </div>

      <form className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={handleSubmit}>
        
        {/* IDENTITÉ */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Identité</h3>
          
          {/* Logo Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Logo de l'entreprise</label>
            <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 border border-slate-300 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden group">
                    {formData.logoUrl ? (
                        <>
                            <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            <button 
                                type="button"
                                onClick={removeLogo}
                                className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                title="Supprimer le logo"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </>
                    ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                </div>
                <div className="flex flex-col gap-2 pt-1">
                    <label className="cursor-pointer bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded text-sm hover:bg-slate-50 transition flex items-center gap-2 shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>Télécharger un logo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                    <p className="text-xs text-slate-500 max-w-[200px]">
                        Format recommandé : PNG ou JPG, fond transparent. Max 2Mo.
                    </p>
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Raison Sociale</label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Hash className="w-3 h-3 text-slate-400" /> SIRET
                </label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                  value={formData.siret}
                  onChange={e => handleChange('siret', e.target.value)}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Hash className="w-3 h-3 text-slate-400" /> TVA Intra.
                </label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                  value={formData.vatNumber}
                  onChange={e => handleChange('vatNumber', e.target.value)}
                />
             </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Devise principale</label>
             <select 
                className="w-full border border-slate-300 rounded p-2.5 bg-white text-black"
                value={formData.currency}
                onChange={e => handleChange('currency', e.target.value)}
             >
                 <option value="TND">Dinar Tunisien (TND)</option>
                 <option value="EUR">Euro (€)</option>
                 <option value="USD">Dollar ($)</option>
             </select>
          </div>
        </div>

        {/* COORDONNÉES */}
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Coordonnées</h3>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Adresse
            </label>
            <input 
              type="text" 
              className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none mb-2 bg-white text-black"
              placeholder="Rue, Voie..."
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
                <input 
                type="text" 
                className="col-span-1 w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                placeholder="Code Postal"
                value={formData.zip}
                onChange={e => handleChange('zip', e.target.value)}
                />
                <input 
                type="text" 
                className="col-span-2 w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                placeholder="Ville"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                />
            </div>
            <input 
                type="text" 
                className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none mt-2 bg-white text-black"
                placeholder="Pays"
                value={formData.country}
                onChange={e => handleChange('country', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" /> Téléphone
                </label>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" /> Email
                </label>
                <input 
                  type="email" 
                  className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" /> Site Web
            </label>
            <input 
                type="text" 
                className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                placeholder="https://..."
                value={formData.website}
                onChange={e => handleChange('website', e.target.value)}
            />
          </div>
        </div>
      </form>
    </div>
  );
};