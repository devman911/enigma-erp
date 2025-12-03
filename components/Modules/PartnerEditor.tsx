

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Partner, EntityType, Document, DocType, Status, Payment } from '../../types';
import { Save, X, User, MapPin, Phone, Mail, FileText, Wallet, TrendingUp, AlertCircle, PlusCircle, History, Trash, Printer, Calendar, Filter } from 'lucide-react';
import { DataTable } from '../UI/DataTable';
import { PaymentModal } from './PaymentModal';

interface PartnerEditorProps {
  initialData?: Partner;
  defaultType: EntityType;
  initialTab?: string; // 'DETAILS' | 'HISTORY' | 'STATEMENT'
  startDate?: string; // Filter passed from parent
  endDate?: string;   // Filter passed from parent
  documents: Document[]; // Added to show history
  payments: Payment[]; // Added for payments
  onSave: (partner: Partner) => void;
  onAddPayment: (payment: Payment) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onDeletePayment: (id: string) => void; // Added for deleting payment
  currency: string;
}

export const PartnerEditor: React.FC<PartnerEditorProps> = ({ initialData, defaultType, initialTab, startDate: initialStartDate, endDate: initialEndDate, documents, payments, onSave, onAddPayment, onCancel, onDelete, onDeletePayment, currency }) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'HISTORY' | 'STATEMENT'>('DETAILS');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  useEffect(() => {
    if (initialTab && (initialTab === 'DETAILS' || initialTab === 'HISTORY' || initialTab === 'STATEMENT')) {
        setActiveTab(initialTab);
    }
  }, [initialTab]);
  
  // Date filters for Statement - Initialize with props if available
  const [startDate, setStartDate] = useState(initialStartDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialEndDate || new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState<Partner>(initialData || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    email: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
    country: 'Tunisie',
    type: defaultType,
    taxId: '',
    initialBalance: 0
  });

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  const handleChange = (field: keyof Partner, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("Le nom est obligatoire.");
      return;
    }
    onSave(formData);
  };

  const handleDelete = () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette fiche ?")) {
      onDelete(formData.id);
    }
  };

  const handleDeletePay = (payId: string) => {
      if (confirm("Supprimer ce règlement ?")) {
          onDeletePayment(payId);
      }
  }

  const handlePrintStatement = () => {
    window.print();
  };

  const isClient = formData.type === EntityType.CLIENT;

  // --- KPI Calculations ---
  const partnerDocs = useMemo(() => {
    if (!initialData) return [];
    return documents.filter(d => d.partnerId === initialData.id);
  }, [documents, initialData]);

  const partnerPayments = useMemo(() => {
    if (!initialData) return [];
    return payments.filter(p => p.partnerId === initialData.id);
  }, [payments, initialData]);

  const stats = useMemo(() => {
    // Calcul Facturé (Factures + Achats)
    const totalInvoiced = partnerDocs
        .filter(d => (d.type === DocType.INVOICE || d.type === DocType.PURCHASE) && d.status !== Status.CANCELLED && d.status !== Status.DRAFT)
        .reduce((sum, d) => sum + d.totalTTC, 0);

    // Calcul Avoirs (Crédits)
    const totalCreditNotes = partnerDocs
        .filter(d => (d.type === DocType.CREDIT_NOTE || d.type === DocType.PURCHASE_CREDIT_NOTE) && d.status !== Status.CANCELLED && d.status !== Status.DRAFT)
        .reduce((sum, d) => sum + d.totalTTC, 0);
    
    const totalPaid = partnerPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Solde = (Initial + Facturé) - (Réglé + Avoirs)
    const totalBalance = (formData.initialBalance || 0) + totalInvoiced - (totalPaid + totalCreditNotes);

    return { totalInvoiced, totalBalance, totalPaid, totalCreditNotes };
  }, [partnerDocs, partnerPayments, formData.initialBalance]);

  // --- Statement (Fiche Tiers) Logic ---
  const statementData = useMemo(() => {
    if (!initialData) return { transactions: [], previousBalance: 0, totalDebit: 0, totalCredit: 0, finalBalance: 0 };

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59); // Include full end day

    // 1. Calculate Previous Balance (Report à nouveau)
    // Filter docs BEFORE start date
    // Invoices = Debit
    const prevInvoiced = partnerDocs.filter(d => 
        (d.type === DocType.INVOICE || d.type === DocType.PURCHASE) && 
        d.status !== Status.CANCELLED && d.status !== Status.DRAFT &&
        new Date(d.date) < start
    ).reduce((sum, d) => sum + d.totalTTC, 0);

    // Credit Notes = Credit
    const prevCredits = partnerDocs.filter(d => 
        (d.type === DocType.CREDIT_NOTE || d.type === DocType.PURCHASE_CREDIT_NOTE) && 
        d.status !== Status.CANCELLED && d.status !== Status.DRAFT &&
        new Date(d.date) < start
    ).reduce((sum, d) => sum + d.totalTTC, 0);

    // Payments = Credit
    const prevPaid = partnerPayments.filter(p => new Date(p.date) < start).reduce((sum, p) => sum + p.amount, 0);
    
    const previousBalance = (formData.initialBalance || 0) + prevInvoiced - (prevPaid + prevCredits);

    // 2. Get Period Transactions
    const periodInvoices = partnerDocs.filter(d => 
        (d.type === DocType.INVOICE || d.type === DocType.PURCHASE) && 
        d.status !== Status.CANCELLED && d.status !== Status.DRAFT &&
        new Date(d.date) >= start && new Date(d.date) <= end
    ).map(d => ({
        id: d.id,
        date: d.date,
        ref: d.reference,
        label: d.type === DocType.INVOICE ? 'Facture' : 'Facture Achat',
        debit: d.totalTTC, // Invoiced Amount
        credit: 0
    }));

    const periodCreditNotes = partnerDocs.filter(d => 
        (d.type === DocType.CREDIT_NOTE || d.type === DocType.PURCHASE_CREDIT_NOTE) && 
        d.status !== Status.CANCELLED && d.status !== Status.DRAFT &&
        new Date(d.date) >= start && new Date(d.date) <= end
    ).map(d => ({
        id: d.id,
        date: d.date,
        ref: d.reference,
        label: d.type === DocType.CREDIT_NOTE ? 'Avoir' : 'Avoir Achat',
        debit: 0,
        credit: d.totalTTC // Credit Note Amount
    }));

    const periodPayments = partnerPayments.filter(p => 
        new Date(p.date) >= start && new Date(p.date) <= end
    ).map(p => ({
        id: p.id,
        date: p.date,
        ref: p.reference || '-',
        label: `Règlement (${p.method})`,
        debit: 0,
        credit: p.amount // Paid Amount
    }));

    // Merge and Sort by Date
    const transactions = [...periodInvoices, ...periodCreditNotes, ...periodPayments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate Running Balance
    let runningBalance = previousBalance;
    const finalTransactions = transactions.map(t => {
        runningBalance = runningBalance + t.debit - t.credit;
        return { ...t, balance: runningBalance };
    });

    const totalDebit = finalTransactions.reduce((sum, t) => sum + t.debit, 0);
    const totalCredit = finalTransactions.reduce((sum, t) => sum + t.credit, 0);

    return { 
        transactions: finalTransactions, 
        previousBalance, 
        totalDebit, 
        totalCredit, 
        finalBalance: runningBalance 
    };

  }, [partnerDocs, partnerPayments, startDate, endDate, formData.initialBalance, initialData]);


  return (
    <>
    {/* PRINT TEMPLATE FOR STATEMENT (Only visible on print) */}
    <div className="hidden print:block p-8 bg-white text-black font-sans">
        <div className="text-center mb-8 border-b pb-4">
            <h1 className="text-2xl font-bold uppercase mb-2">Relevé de Compte {isClient ? 'Client' : 'Fournisseur'}</h1>
            <h2 className="text-xl">{formData.name}</h2>
            <p className="text-sm text-slate-500 mt-1">{formData.address} - {formData.city}</p>
        </div>
        
        <div className="flex justify-between mb-6 text-sm">
            <div>
                <p><strong>Période du :</strong> {startDate}</p>
                <p><strong>Au :</strong> {endDate}</p>
            </div>
            <div className="text-right">
                <p><strong>Date d'édition :</strong> {new Date().toLocaleDateString()}</p>
            </div>
        </div>

        <table className="w-full text-sm border-collapse mb-8">
            <thead>
                <tr className="border-b-2 border-slate-800">
                    <th className="py-2 text-left">Date</th>
                    <th className="py-2 text-left">Libellé</th>
                    <th className="py-2 text-left">Référence</th>
                    <th className="py-2 text-right">Débit (Facturé)</th>
                    <th className="py-2 text-right">Crédit (Réglé/Avoir)</th>
                    <th className="py-2 text-right">Solde</th>
                </tr>
            </thead>
            <tbody>
                {/* Report à nouveau Row */}
                <tr className="border-b border-slate-200 bg-slate-50 font-medium">
                    <td className="py-2" colSpan={3}>REPORT À NOUVEAU (Solde initial)</td>
                    <td className="py-2 text-right"> - </td>
                    <td className="py-2 text-right"> - </td>
                    <td className="py-2 text-right">{statementData.previousBalance.toFixed(2)} {symbol}</td>
                </tr>
                {/* Transactions */}
                {statementData.transactions.map((t, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2">{t.date}</td>
                        <td className="py-2">{t.label}</td>
                        <td className="py-2">{t.ref}</td>
                        <td className="py-2 text-right">{t.debit > 0 ? t.debit.toFixed(2) : '-'}</td>
                        <td className="py-2 text-right">{t.credit > 0 ? t.credit.toFixed(2) : '-'}</td>
                        <td className="py-2 text-right font-medium">{t.balance.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr className="border-t-2 border-slate-800 font-bold">
                    <td colSpan={3} className="py-3 text-right">TOTAUX PÉRIODE</td>
                    <td className="py-3 text-right">{statementData.totalDebit.toFixed(2)} {symbol}</td>
                    <td className="py-3 text-right">{statementData.totalCredit.toFixed(2)} {symbol}</td>
                    <td className="py-3 text-right bg-slate-100">{statementData.finalBalance.toFixed(2)} {symbol}</td>
                </tr>
            </tfoot>
        </table>
        <div className="text-center text-xs text-slate-500 mt-10">
            Document généré par Nexus ERP.
        </div>
    </div>

    {/* NORMAL SCREEN VIEW */}
    <div className="bg-white h-full flex flex-col p-6 overflow-auto animate-in fade-in duration-200 print:hidden">
      
      {showPaymentModal && initialData && (
        <PaymentModal 
            partnerName={initialData.name}
            partnerId={initialData.id}
            currencySymbol={symbol}
            onSave={onAddPayment}
            onClose={() => setShowPaymentModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-6 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-lg ${isClient ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
              {isClient ? <User className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
            </div>
            <div>
                 <h2 className="text-2xl font-bold text-slate-800">
                {initialData ? formData.name : `Nouveau ${isClient ? 'Client' : 'Fournisseur'}`}
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${isClient ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                    {isClient ? 'Client' : 'Fournisseur'}
                </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {initialData && (
             <button 
             onClick={handleDelete} 
             className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition-colors"
           >
             Supprimer
           </button>
          )}
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
            <Save className="w-4 h-4" /> Enregistrer
          </button>
        </div>
      </div>

      {/* KPI Cards (Only if editing existing) */}
      {initialData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Facturé</p>
                    <p className="text-lg font-bold text-slate-800">{stats.totalInvoiced.toFixed(2)} {symbol}</p>
                </div>
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                    <Wallet className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Total Réglé</p>
                    <p className="text-lg font-bold text-slate-800">{stats.totalPaid.toFixed(2)} {symbol}</p>
                </div>
            </div>
            <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                    <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Solde Dû</p>
                    <p className="text-lg font-bold text-slate-800">{stats.totalBalance.toFixed(2)} {symbol}</p>
                </div>
            </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('DETAILS')}
            className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'DETAILS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Informations Générales
          </button>
          {initialData && (
            <>
                <button 
                    onClick={() => setActiveTab('HISTORY')}
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'HISTORY' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Historique & Documents
                </button>
                <button 
                    onClick={() => setActiveTab('STATEMENT')}
                    className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'STATEMENT' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Relevé de Compte
                </button>
            </>
          )}
      </div>

      {/* TAB CONTENT: DETAILS */}
      {activeTab === 'DETAILS' && (
      <form onSubmit={handleSubmit} className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-2 duration-300">
        
        {/* Colonne Gauche */}
        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
             <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
               <User className="w-4 h-4" /> Identité
             </h3>
             
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom / Raison Sociale <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type de Tiers</label>
                  <select 
                    className="w-full border border-slate-300 rounded p-2.5 bg-white text-black"
                    value={formData.type}
                    onChange={e => handleChange('type', e.target.value as any)}
                  >
                    <option value={EntityType.CLIENT}>Client</option>
                    <option value={EntityType.SUPPLIER}>Fournisseur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-400" /> Matricule Fiscal / Identifiant
                  </label>
                  <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                    value={formData.taxId || ''}
                    onChange={e => handleChange('taxId', e.target.value)}
                  />
                </div>
             </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
             <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
               <MapPin className="w-4 h-4" /> Adresse
             </h3>
             <div className="space-y-4">
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                  placeholder="Adresse (Rue, Avenue...)"
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                />
                <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                      placeholder="Code Postal"
                      value={formData.zip}
                      onChange={e => handleChange('zip', e.target.value)}
                    />
                    <input 
                      type="text" 
                      className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                      placeholder="Ville"
                      value={formData.city}
                      onChange={e => handleChange('city', e.target.value)}
                    />
                </div>
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-black"
                  placeholder="Pays"
                  value={formData.country}
                  onChange={e => handleChange('country', e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* Colonne Droite */}
        <div className="space-y-6">
           <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
             <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
               <Phone className="w-4 h-4" /> Contact
             </h3>
             <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
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
           </div>

           {/* Comptabilité / Solde */}
           <div className="bg-white p-6 rounded-lg border border-indigo-200 shadow-sm ring-1 ring-indigo-50">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-indigo-600" /> Comptabilité
                </h3>
                {initialData && (
                    <button 
                        type="button"
                        onClick={() => setShowPaymentModal(true)}
                        className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 flex items-center gap-1"
                    >
                        <PlusCircle className="w-3 h-3" /> Nouveau Règlement
                    </button>
                )}
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Solde de départ</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full border border-slate-300 rounded p-2.5 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-black bg-white"
                    placeholder="0.00"
                    value={formData.initialBalance || 0}
                    onChange={e => handleChange('initialBalance', parseFloat(e.target.value))}
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 font-medium">{symbol}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Le montant initial dû {isClient ? 'par le client' : 'au fournisseur'} au démarrage de l'ERP.
                </p>
             </div>

             {/* Dynamic Current Balance Display */}
             <div className="mt-4 pt-4 border-t border-indigo-100">
                <label className="block text-sm font-medium text-indigo-900 mb-1">Solde Actuel (En cours)</label>
                <div className={`text-2xl font-bold ${stats.totalBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {stats.totalBalance.toFixed(2)} {symbol}
                </div>
                <p className="text-xs text-indigo-400 mt-1">
                  Calculé : (Solde de départ + Facturé) - (Réglé + Avoirs).
                </p>
             </div>
             
             {/* Mini Payment History List - KEPT as a Recent Summary */}
             {initialData && partnerPayments.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-indigo-100">
                     <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                        <History className="w-3 h-3" /> Derniers Règlements
                     </h4>
                     <div className="max-h-32 overflow-y-auto text-sm space-y-1">
                         {partnerPayments.slice().reverse().slice(0, 5).map(p => (
                             <div key={p.id} className="flex justify-between items-center text-slate-700 p-1 hover:bg-slate-50 rounded group">
                                 <span>{p.date} ({p.method})</span>
                                 <span className="font-bold text-emerald-600">-{p.amount.toFixed(2)} {symbol}</span>
                             </div>
                         ))}
                     </div>
                 </div>
             )}

           </div>
        </div>

      </form>
      )}

      {/* TAB CONTENT: HISTORY */}
      {activeTab === 'HISTORY' && (
         <div className="animate-in slide-in-from-bottom-2 duration-300 space-y-8">
             <DataTable<Document>
                 title={`Documents liés à ${formData.name}`}
                 data={partnerDocs}
                 columns={[
                     { key: 'reference', header: 'Référence' },
                     { key: 'date', header: 'Date' },
                     { key: 'type', header: 'Type', render: (d) => <span className="text-xs uppercase font-bold text-slate-500">
                        {d.type === DocType.DELIVERY_NOTE ? 'BL' : 
                         d.type === DocType.QUOTE ? 'Devis' : 
                         d.type === DocType.ORDER ? 'Commande' : 
                         d.type === DocType.CREDIT_NOTE ? 'Avoir' :
                         d.type === DocType.PURCHASE_CREDIT_NOTE ? 'Avoir Achat' :
                         'Facture'}
                     </span> },
                     { key: 'totalTTC', header: 'Total', render: (d) => <span className="font-bold">{d.totalTTC.toFixed(2)} {symbol}</span> },
                     { key: 'status', header: 'Statut', render: (d) => (
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            d.status === Status.PAID ? 'bg-green-100 text-green-700' : 
                            d.status === Status.UNPAID ? 'bg-red-100 text-red-700' :
                            d.status === Status.VALIDATED ? 'bg-blue-100 text-blue-700' :
                            d.status === Status.CANCELLED ? 'bg-red-100 text-red-700' :
                            'bg-slate-200 text-slate-600'
                        }`}>
                            {d.status}
                        </span>
                     )},
                 ]}
             />
             
             <DataTable<Payment>
                 title="Historique des Règlements"
                 data={partnerPayments.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                 columns={[
                     { key: 'date', header: 'Date' },
                     { key: 'amount', header: 'Montant', render: (p) => <span className="font-bold text-emerald-600">{p.amount.toFixed(2)} {symbol}</span> },
                     { key: 'method', header: 'Mode' },
                     { key: 'reference', header: 'Référence' },
                     { key: 'id', header: 'Action', render: (p) => (
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeletePay(p.id); }} 
                            className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors"
                            title="Supprimer ce règlement"
                        >
                            <Trash className="w-4 h-4" />
                        </button>
                     )},
                 ]}
             />
         </div>
      )}

      {/* TAB CONTENT: STATEMENT (FICHE) */}
      {activeTab === 'STATEMENT' && (
          <div className="animate-in slide-in-from-bottom-2 duration-300 flex flex-col h-full gap-4">
             {/* Toolbar */}
             <div className="flex items-center justify-between bg-slate-50 p-4 rounded border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-700">Période du :</span>
                        <input 
                            type="date" 
                            className="border border-slate-300 rounded p-1.5 text-sm bg-white text-black"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">Au :</span>
                        <input 
                            type="date" 
                            className="border border-slate-300 rounded p-1.5 text-sm bg-white text-black"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                <button 
                    onClick={handlePrintStatement}
                    className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                >
                    <Printer className="w-4 h-4" /> Imprimer la Fiche
                </button>
             </div>

             {/* Preview Table */}
             <div className="flex-1 overflow-auto border border-slate-200 rounded">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100 sticky top-0">
                         <tr>
                             <th className="p-3 font-bold text-slate-600 border-b">Date</th>
                             <th className="p-3 font-bold text-slate-600 border-b">Libellé</th>
                             <th className="p-3 font-bold text-slate-600 border-b">Réf</th>
                             <th className="p-3 font-bold text-slate-600 border-b text-right text-emerald-700">Débit (Facturé)</th>
                             <th className="p-3 font-bold text-slate-600 border-b text-right text-amber-700">Crédit (Réglé/Avoir)</th>
                             <th className="p-3 font-bold text-slate-600 border-b text-right">Solde</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {/* Report Row */}
                         <tr className="bg-slate-50 font-medium text-slate-500">
                             <td className="p-3" colSpan={3}>REPORT À NOUVEAU (Solde initial au {startDate})</td>
                             <td className="p-3 text-right">-</td>
                             <td className="p-3 text-right">-</td>
                             <td className="p-3 text-right font-bold text-slate-800">{statementData.previousBalance.toFixed(2)} {symbol}</td>
                         </tr>
                         
                         {statementData.transactions.length === 0 && (
                             <tr>
                                 <td colSpan={6} className="p-8 text-center text-slate-400">Aucun mouvement sur cette période.</td>
                             </tr>
                         )}

                         {statementData.transactions.map((t, idx) => (
                             <tr key={idx} className="hover:bg-slate-50">
                                 <td className="p-3">{t.date}</td>
                                 <td className="p-3">{t.label}</td>
                                 <td className="p-3 font-mono text-xs">{t.ref}</td>
                                 <td className="p-3 text-right">{t.debit > 0 ? t.debit.toFixed(2) : '-'}</td>
                                 <td className="p-3 text-right">{t.credit > 0 ? t.credit.toFixed(2) : '-'}</td>
                                 <td className={`p-3 text-right font-medium ${t.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                     {t.balance.toFixed(2)} {symbol}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                     <tfoot className="bg-slate-50 font-bold sticky bottom-0 border-t border-slate-300">
                         <tr>
                             <td colSpan={3} className="p-3 text-right uppercase">Totaux Période</td>
                             <td className="p-3 text-right text-emerald-700">{statementData.totalDebit.toFixed(2)} {symbol}</td>
                             <td className="p-3 text-right text-amber-700">{statementData.totalCredit.toFixed(2)} {symbol}</td>
                             <td className="p-3 text-right bg-indigo-50 text-indigo-900 border-l border-indigo-200">
                                 {statementData.finalBalance.toFixed(2)} {symbol}
                             </td>
                         </tr>
                     </tfoot>
                 </table>
             </div>
          </div>
      )}
    </div>
    </>
  );
};