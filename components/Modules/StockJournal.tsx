
import React, { useState, useMemo } from 'react';
import { Document, Product, DocType, Status } from '../../types';
import { DataTable } from '../UI/DataTable';
import { ArrowRight, ArrowLeft, Package, Calendar } from 'lucide-react';

interface StockJournalProps {
  documents: Document[];
  products: Product[];
  currency: string;
}

export const StockJournal: React.FC<StockJournalProps> = ({ documents, products, currency }) => {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  const movements = useMemo(() => {
    const moves: any[] = [];
    
    documents.forEach(doc => {
        // Only process validated/active documents that affect stock
        if (doc.status === Status.DRAFT || doc.status === Status.CANCELLED) return;

        // Determine Direction
        let direction: 'IN' | 'OUT' | 'NONE' = 'NONE';
        
        // ENTRÉES
        if (doc.type === DocType.PURCHASE) direction = 'IN'; // Achat
        if (doc.type === DocType.CREDIT_NOTE) direction = 'IN'; // Retour Client

        // SORTIES
        if (doc.type === DocType.DELIVERY_NOTE) direction = 'OUT'; // Vente (BL)
        if (doc.type === DocType.PURCHASE_CREDIT_NOTE) direction = 'OUT'; // Retour Fournisseur
        
        // Note: We exclude INVOICE to avoid double counting if BLs are used. 
        // If your workflow uses direct Invoices without BLs, you might enable this, 
        // but typically BL is the stock mover.

        if (direction === 'NONE') return;

        doc.items.forEach(item => {
            moves.push({
                id: `${doc.id}_${item.id}`,
                date: doc.date,
                docRef: doc.reference,
                docType: doc.type,
                productName: item.productName,
                quantity: item.quantity,
                direction: direction,
                partner: doc.partnerName
            });
        });
    });

    // Filter by Date
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    return moves
        .filter(m => {
            const d = new Date(m.date);
            return d >= start && d <= end;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [documents, startDate, endDate]);

  return (
    <div className="h-full flex flex-col p-4 bg-slate-100 gap-4">
       <div className="flex justify-between items-center bg-white p-4 rounded border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Journal des Stocks</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">Historique des mouvements (Entrées / Sorties) basé sur les documents validés.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded border border-slate-200">
              <Calendar className="w-4 h-4 text-slate-500 ml-1" />
              <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Du :</span>
                  <input 
                    type="date" 
                    className="border border-slate-300 rounded p-1 text-sm bg-white text-black focus:outline-none focus:border-indigo-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
              </div>
              <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Au :</span>
                  <input 
                    type="date" 
                    className="border border-slate-300 rounded p-1 text-sm bg-white text-black focus:outline-none focus:border-indigo-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
              </div>
        </div>
      </div>

      <DataTable
        title="Mouvements de Stock"
        data={movements}
        columns={[
            { key: 'date', header: 'Date' },
            { key: 'docRef', header: 'Document', render: (m) => (
                <div>
                    <div className="font-bold text-slate-700">{m.docRef}</div>
                    <div className="text-[10px] text-slate-500">{m.partner}</div>
                </div>
            )},
            { key: 'productName', header: 'Article' },
            { key: 'direction', header: 'Type', render: (m) => (
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded uppercase w-fit ${m.direction === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {m.direction === 'IN' ? <ArrowRight className="w-3 h-3"/> : <ArrowLeft className="w-3 h-3"/>}
                    {m.direction === 'IN' ? 'Entrée' : 'Sortie'}
                </span>
            )},
            { key: 'quantity', header: 'Quantité', render: (m) => (
                <span className={`font-bold ${m.direction === 'IN' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {m.direction === 'IN' ? '+' : '-'}{m.quantity}
                </span>
            )}
        ]}
      />
    </div>
  );
};
