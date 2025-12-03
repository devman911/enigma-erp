
import React, { useState } from 'react';
import { User, CompanySettings } from '../../types';
import { Lock, User as UserIcon, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  company: CompanySettings;
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, company, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Veuillez saisir votre identifiant ou email.');
      return;
    }

    // Simulation d'authentification
    setIsLoading(true);
    setTimeout(() => {
      // Find user by email or name (case insensitive)
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() || 
        u.name.toLowerCase() === email.toLowerCase()
      );

      if (user) {
        if (user.active) {
            onLogin(user);
        } else {
            setError("Ce compte a été désactivé.");
            setIsLoading(false);
        }
      } else {
        setError("Utilisateur introuvable.");
        setIsLoading(false);
      }
    }, 800); // Petit délai pour l'effet réaliste
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col items-center justify-center p-4">
        
        {/* Company Header */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
             {company.logoUrl ? (
                 <img src={company.logoUrl} alt="Logo" className="h-20 w-auto mx-auto mb-4 drop-shadow-lg object-contain" />
             ) : (
                 <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                     <span className="text-2xl font-bold text-white">{company.name.charAt(0)}</span>
                 </div>
             )}
             <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{company.name}</h1>
        </div>

        {/* Login Box */}
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-500 border border-white/10">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">Connexion</h3>
            <p className="text-sm text-slate-500">Accédez à votre espace de travail sécurisé.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Identifiant</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-lg p-3 pl-10 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black placeholder:text-slate-400"
                  placeholder="Email ou Nom d'utilisateur"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                <input 
                  type="password" 
                  className="w-full border border-slate-300 rounded-lg p-3 pl-10 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-black placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-1 border border-red-100">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" /> 
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-bold text-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/30"
            >
              {isLoading ? (
                <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Connexion...
                </>
              ) : (
                <>
                    Se connecter <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                  Comptes démo disponibles : <br/>
                  <span className="font-mono bg-slate-100 px-1 rounded mx-1">admin@enigma.com</span>
                  <span className="font-mono bg-slate-100 px-1 rounded mx-1">sarah@enigma.com</span>
              </p>
          </div>
        </div>
        
        <div className="mt-8 text-slate-400 text-xs text-center opacity-60">
            &copy; {new Date().getFullYear()} Enigma ERP System. Tous droits réservés.
        </div>
    </div>
  );
};
