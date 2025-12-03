
import React, { useState, useEffect } from 'react';
import { AppState, PaymentMethod, PaymentStatus, DocType, Status } from '../../types';
import { getBusinessInsights } from '../../services/geminiService';
import { Activity, DollarSign, Package, AlertCircle, Sparkles, RefreshCw, Clock, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  data: AppState;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInsight = async () => {
    setLoading(true);
    const text = await getBusinessInsights(data);
    setInsight(text);
    setLoading(false);
  };

  const totalSales = data.documents.filter(d => d.type === DocType.INVOICE).reduce((acc, c) => acc + c.totalTTC, 0);
  const totalStockVal = data.products.reduce((acc, c) => acc + (c.cost * c.stock), 0);
  const lowStock = data.products.filter(p => p.stock <= p.minStock).length;

  const currency = data.company.currency;
  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  // Chart Data preparation
  const salesByMonth = [
    { name: 'Août', total: 1200 },
    { name: 'Sep', total: 1900 },
    { name: 'Oct', total: totalSales }, // simplistic usage of real total for demo
  ];

  // --- Financial Alerts Data ---
  
  // 1. Pending Checks (Sorted by Due Date)
  const pendingChecks = data.payments
    .filter(p => p.method === PaymentMethod.CHECK && p.status === PaymentStatus.PENDING)
    .sort((a, b) => new Date(a.dueDate || a.date).getTime() - new Date(b.dueDate || b.date).getTime())
    .slice(0, 5); // Show top 5

  // 2. Unpaid Invoices (Sorted by Date - Oldest first)
  const unpaidInvoices = data.documents
    .filter(d => d.type === DocType.INVOICE && (d.status === Status.UNPAID || d.status === Status.VALIDATED)) // Assuming Validated might imply unpaid if not explicitly Paid
    .filter(d => d.status !== Status.PAID && d.status !== Status.CANCELLED) 
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const getPartnerName = (id: string) => {
      const p = data.partners.find(pt => pt.id === id);
      return p ? p.name : 'Inconnu';
  };

  return (
    <div className="p-6 bg-slate-50 h-full overflow-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-slate-800">Tableau de bord</h1>
           <p className="text-slate-500">Aperçu de la performance de votre entreprise.</p>
        </div>
        <button 
            onClick={fetchInsight}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyse en cours...' : "Demander à l'IA"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Chiffre d'Affaires</p>
            <p className="text-xl font-bold">{totalSales.toFixed(2)} {symbol}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Valeur du Stock</p>
            <p className="text-xl font-bold">{totalStockVal.toFixed(2)} {symbol}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Alerte Stock Faible</p>
            <p className="text-xl font-bold">{lowStock} Articles</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Docs Actifs</p>
            <p className="text-xl font-bold">{data.documents.length}</p>
          </div>
        </div>
      </div>

      {/* Financial Alerts Section */}
      <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
         <AlertTriangle className="w-5 h-5 text-amber-500" /> Alertes Financières
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Unpaid Invoices */}
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" /> Factures Impayées (Top 5)
                  </h4>
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">{unpaidInvoices.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                  {unpaidInvoices.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">Toutes les factures sont réglées.</div>
                  ) : (
                      unpaidInvoices.map(doc => (
                          <div key={doc.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-sm">
                              <div>
                                  <div className="font-medium text-slate-800">{doc.partnerName}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" /> {doc.date} • <span className="font-mono">{doc.reference}</span>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="font-bold text-red-600">{doc.totalTTC.toFixed(2)} {symbol}</div>
                                  <div className="text-xs text-slate-400">Non payé</div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>

          {/* Pending Checks */}
          <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" /> Chèques en attente (Top 5)
                  </h4>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-bold">{pendingChecks.length}</span>
              </div>
              <div className="divide-y divide-slate-100">
                  {pendingChecks.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-sm">Aucun chèque en attente.</div>
                  ) : (
                      pendingChecks.map(pay => (
                          <div key={pay.id} className="p-3 flex items-center justify-between hover:bg-slate-50 text-sm">
                              <div>
                                  <div className="font-medium text-slate-800">{getPartnerName(pay.partnerId)}</div>
                                  <div className="text-xs text-slate-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" /> Échéance: 
                                      <span className={`font-bold ${new Date(pay.dueDate || '') < new Date() ? 'text-red-600' : 'text-slate-600'}`}>
                                          {pay.dueDate}
                                      </span>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="font-bold text-slate-800">{pay.amount.toFixed(2)} {symbol}</div>
                                  <div className="text-xs text-amber-600 bg-amber-50 px-1 rounded inline-block">En attente</div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      {/* Main Content Area: Charts + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-700 mb-4">Tendances des Ventes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value} ${symbol}`} />
                <Bar dataKey="total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="bg-white p-6 rounded border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" /> Analyses IA
          </h3>
          <div className="flex-1 bg-slate-50 rounded p-4 text-sm text-slate-700 leading-relaxed overflow-auto">
            {insight ? (
              <div dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ) : (
              <div className="text-center text-slate-400 mt-10">
                <p>Cliquez sur "Demander à l'IA" pour générer une analyse complète de votre situation.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
