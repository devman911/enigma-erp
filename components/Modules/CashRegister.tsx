
import React, { useState, useMemo } from 'react';
import { CashSession, Payment, PaymentMethod, EntityType } from '../../types';
import { DataTable } from '../UI/DataTable';
import { Archive, Lock, PlayCircle, AlertTriangle, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

interface CashRegisterProps {
  currentSession?: CashSession;
  payments: Payment[];
  sessionsHistory: CashSession[];
  currency: string;
  onOpenSession: (openingBalance: number) => void;
  onCloseSession: (sessionId: string, actualBalance: number) => void;
}

export const CashRegister: React.FC<CashRegisterProps> = ({ 
  currentSession, 
  payments, 
  sessionsHistory,
  currency, 
  onOpenSession, 
  onCloseSession 
}) => {
  const [openingAmount, setOpeningAmount] = useState<number>(0);
  const [closingAmount, setClosingAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'HISTORY'>('CURRENT');
  
  // Date filters for History
  const [historyStartDate, setHistoryStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [historyEndDate, setHistoryEndDate] = useState(new Date().toISOString().split('T')[0]);

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  // --- Logic for Active Session ---
  const currentMovements = useMemo(() => {
    if (!currentSession) return [];
    
    // Filter payments: 
    // 1. Must be CASH
    // 2. Must be created AFTER the session opened
    const sessionStart = new Date(currentSession.openedAt).getTime();
    
    return payments.filter(p => {
      const paymentTime = new Date(p.date + 'T00:00:00').getTime(); // Assuming payment.date is YYYY-MM-DD. Ideally payment should have full timestamp. 
      // For this mock, we assume payments added today belong to today's session if opened today.
      // In a real app, strict timestamp comparison is needed.
      return p.method === PaymentMethod.CASH && paymentTime >= sessionStart;
    }).map(p => ({
        ...p,
        type: p.partnerId ? 'TIERS' : 'AUTRE', // Simplified
        direction: (sessionsHistory.length > 0) ? 'IN' : 'IN' // We need to know if it's client or supplier
    }));
  }, [currentSession, payments]);

  
  const movementsWithDir = useMemo(() => {
     if (!currentSession) return [];
     const start = new Date(currentSession.openedAt);
     
     return payments.filter(p => {
         const d = new Date(p.date);
         // Compare dates loosely for this demo (same day or after)
         return p.method === PaymentMethod.CASH && d >= new Date(start.toISOString().split('T')[0]);
     });
  }, [currentSession, payments]);
  

  const theoreticalBalance = currentSession 
    ? currentSession.openingBalance + currentSession.totalIn - currentSession.totalOut 
    : 0;
  
  const difference = closingAmount - theoreticalBalance;

  // --- Logic for History Filter ---
  const filteredHistory = useMemo(() => {
      const start = new Date(historyStartDate);
      const end = new Date(historyEndDate);
      end.setHours(23, 59, 59, 999);

      return sessionsHistory
        .filter(s => s.status === 'CLOSED')
        .filter(s => {
            const date = new Date(s.openedAt);
            return date >= start && date <= end;
        })
        .sort((a,b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
  }, [sessionsHistory, historyStartDate, historyEndDate]);


  const handleOpen = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenSession(openingAmount);
  };

  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirm("Confirmer la clôture de la caisse ? Cette action est irréversible.")) {
        onCloseSession(currentSession!.id, closingAmount);
        setClosingAmount(0);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-slate-50 overflow-auto">
      
      {/* Header Tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
        <button 
            onClick={() => setActiveTab('CURRENT')}
            className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'CURRENT' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Caisse en cours
        </button>
        <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'HISTORY' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
            Historique des Clôtures
        </button>
      </div>

      {activeTab === 'CURRENT' && (
          <div className="max-w-5xl mx-auto w-full">
            {!currentSession ? (
                // --- OPEN SESSION FORM ---
                <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 max-w-md mx-auto mt-10 text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">La caisse est fermée</h2>
                    <p className="text-slate-500 mb-6">Veuillez saisir le fond de caisse pour commencer la journée.</p>
                    
                    <form onSubmit={handleOpen} className="text-left">
                        <label className="block text-sm font-bold text-slate-700 mb-1">Fond de caisse (Montant d'ouverture)</label>
                        <div className="relative mb-6">
                            <input 
                                type="number" 
                                step="0.01"
                                className="w-full border border-slate-300 rounded p-3 pl-4 font-bold text-lg bg-white text-black focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={openingAmount}
                                onChange={e => setOpeningAmount(parseFloat(e.target.value))}
                                autoFocus
                            />
                            <span className="absolute right-4 top-3 text-slate-400 font-bold">{symbol}</span>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
                            <PlayCircle className="w-5 h-5" /> Ouvrir la Caisse
                        </button>
                    </form>
                </div>
            ) : (
                // --- ACTIVE SESSION DASHBOARD ---
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                         <div>
                             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                 <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                 Caisse Ouverte
                             </h2>
                             <p className="text-slate-500">Ouverte le {new Date(currentSession.openedAt).toLocaleString()}</p>
                         </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase">Fond de Caisse</p>
                            <p className="text-xl font-bold text-slate-700">{currentSession.openingBalance.toFixed(2)} {symbol}</p>
                        </div>
                        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1">
                                <TrendingUp className="w-3 h-3"/> Encaissements (Espèces)
                            </p>
                            <p className="text-xl font-bold text-emerald-700">+{currentSession.totalIn.toFixed(2)} {symbol}</p>
                        </div>
                        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm">
                            <p className="text-xs font-bold text-amber-600 uppercase flex items-center gap-1">
                                <TrendingDown className="w-3 h-3"/> Décaissements (Espèces)
                            </p>
                            <p className="text-xl font-bold text-amber-700">-{currentSession.totalOut.toFixed(2)} {symbol}</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded border border-indigo-200 shadow-sm">
                            <p className="text-xs font-bold text-indigo-700 uppercase">Solde Théorique</p>
                            <p className="text-2xl font-bold text-indigo-900">{theoreticalBalance.toFixed(2)} {symbol}</p>
                        </div>
                    </div>

                    {/* Closing Section */}
                    <div className="bg-white rounded border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-slate-500" /> Clôture de Caisse
                        </h3>
                        <form onSubmit={handleClose} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Montant Réel Compté (Espèces)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full border border-slate-300 rounded p-2.5 bg-white text-black font-bold text-lg"
                                    value={closingAmount}
                                    onChange={e => setClosingAmount(parseFloat(e.target.value))}
                                    required
                                />
                             </div>
                             <div className="pb-3">
                                 <div className={`text-sm font-medium ${difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                                     Ecart de caisse : <span className="font-bold">{difference > 0 ? '+' : ''}{difference.toFixed(2)} {symbol}</span>
                                 </div>
                                 {difference !== 0 && (
                                     <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                         <AlertTriangle className="w-3 h-3" /> Vérifiez votre comptage.
                                     </div>
                                 )}
                             </div>
                             <button type="submit" className="bg-slate-800 text-white py-3 rounded hover:bg-slate-900 font-bold">
                                 Valider la Clôture
                             </button>
                        </form>
                    </div>

                    {/* Movements List (Simplified for UI) */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-600 uppercase mb-2">Mouvements Récents (Espèces)</h3>
                        <div className="bg-white border border-slate-200 rounded overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="text-left p-3">Date</th>
                                        <th className="text-left p-3">Référence</th>
                                        <th className="text-right p-3">Montant</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movementsWithDir.length === 0 && (
                                        <tr><td colSpan={3} className="p-4 text-center text-slate-400">Aucun mouvement en espèces.</td></tr>
                                    )}
                                    {movementsWithDir.map(m => (
                                        <tr key={m.id} className="border-b last:border-0 hover:bg-slate-50">
                                            <td className="p-3">{m.date}</td>
                                            <td className="p-3">{m.reference || '-'}</td>
                                            <td className="p-3 text-right font-medium">{m.amount.toFixed(2)} {symbol}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
          </div>
      )}

      {activeTab === 'HISTORY' && (
          <div className="h-full flex flex-col gap-4">
              <div className="flex items-center gap-4 bg-white p-3 rounded border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Du :</span>
                    <input 
                        type="date" 
                        className="border border-slate-300 rounded p-1.5 text-sm bg-white text-black"
                        value={historyStartDate}
                        onChange={(e) => setHistoryStartDate(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">Au :</span>
                    <input 
                        type="date" 
                        className="border border-slate-300 rounded p-1.5 text-sm bg-white text-black"
                        value={historyEndDate}
                        onChange={(e) => setHistoryEndDate(e.target.value)}
                    />
                  </div>
              </div>

              <DataTable<CashSession>
                title="Historique des Sessions"
                data={filteredHistory}
                columns={[
                    { key: 'openedAt', header: 'Ouverture', render: (s) => new Date(s.openedAt).toLocaleDateString() + ' ' + new Date(s.openedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
                    { key: 'closedAt', header: 'Fermeture', render: (s) => s.closedAt ? new Date(s.closedAt).toLocaleDateString() + ' ' + new Date(s.closedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-' },
                    { key: 'openingBalance', header: 'Fond Initial', render: (s) => `${s.openingBalance.toFixed(2)} ${symbol}` },
                    { key: 'totalIn', header: 'Total Entrées', render: (s) => <span className="text-emerald-600">+{s.totalIn.toFixed(2)} {symbol}</span> },
                    { key: 'totalOut', header: 'Total Sorties', render: (s) => <span className="text-amber-600">-{s.totalOut.toFixed(2)} {symbol}</span> },
                    { key: 'closingBalance', header: 'Solde Théorique', render: (s) => <span className="font-bold">{(s.closingBalance||0).toFixed(2)} {symbol}</span> },
                    { key: 'actualBalance', header: 'Solde Réel', render: (s) => `${(s.actualBalance||0).toFixed(2)} {symbol}` },
                    { key: 'difference', header: 'Ecart', render: (s) => (
                        <span className={`font-bold ${(s.difference||0) === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(s.difference||0) > 0 ? '+' : ''}{(s.difference||0).toFixed(2)} {symbol}
                        </span>
                    )},
                ]}
              />
          </div>
      )}

    </div>
  );
};
