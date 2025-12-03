
import React from 'react';
import { Document, CompanySettings, DocType, Partner } from '../../types';

interface PrintTemplateProps {
  document: Partial<Document>;
  company: CompanySettings;
  partner?: Partner;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ document, company, partner }) => {
  if (!document) return null;

  const symbol = company.currency === 'EUR' ? '€' : company.currency === 'USD' ? '$' : 'TND';

  const getDocTitle = (type?: DocType) => {
    switch (type) {
      case DocType.INVOICE: return 'FACTURE';
      case DocType.QUOTE: return 'DEVIS';
      case DocType.DELIVERY_NOTE: return 'BON DE LIVRAISON';
      case DocType.ORDER: return 'BON DE COMMANDE';
      default: return 'DOCUMENT';
    }
  };

  return (
    <div className="hidden print:block print:w-full bg-white p-8 text-slate-900 leading-normal">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="w-1/2">
          {company.logoUrl && <img src={company.logoUrl} alt="Logo" className="h-16 mb-4 object-contain" />}
          <h1 className="text-xl font-bold uppercase tracking-wide">{company.name}</h1>
          <div className="text-sm text-slate-600 mt-2 space-y-1">
            <p>{company.address}</p>
            <p>{company.zip} {company.city}</p>
            <p>{company.country}</p>
            <p>Tél: {company.phone}</p>
            <p>Email: {company.email}</p>
            <p>SIRET: {company.siret}</p>
          </div>
        </div>
        <div className="w-1/2 text-right">
          <h2 className="text-3xl font-bold text-slate-800 uppercase mb-2">
            {getDocTitle(document.type)}
          </h2>
          <p className="text-lg font-medium text-slate-600">N° {document.reference}</p>
          <p className="text-sm text-slate-500 mt-1">Date : {document.date}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-12 border border-slate-200 rounded p-6 bg-slate-50/50">
        <p className="text-xs font-bold text-slate-500 uppercase mb-2">Destinataire</p>
        <h3 className="text-lg font-bold text-slate-900">{partner?.name || document.partnerName || 'Client Inconnu'}</h3>
        <div className="text-sm text-slate-600 mt-1">
            <p>{partner?.address || 'Adresse non renseignée'}</p>
            <p>{partner?.phone}</p>
            <p>{partner?.email}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 text-sm">
        <thead className="border-b-2 border-slate-800">
          <tr>
            <th className="py-2 text-left font-bold uppercase w-1/2">Désignation</th>
            <th className="py-2 text-right font-bold uppercase">Qté</th>
            <th className="py-2 text-right font-bold uppercase">P.U. HT</th>
            <th className="py-2 text-right font-bold uppercase">Rem. %</th>
            <th className="py-2 text-right font-bold uppercase">TVA %</th>
            <th className="py-2 text-right font-bold uppercase">Total HT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {document.items?.map((item, idx) => (
            <tr key={idx}>
              <td className="py-3 text-left">
                <div className="font-medium text-slate-800">{item.productName}</div>
                {/* <div className="text-xs text-slate-500">Réf: ...</div> */}
              </td>
              <td className="py-3 text-right">{item.quantity}</td>
              <td className="py-3 text-right">{item.unitPrice?.toFixed(2)} {symbol}</td>
              <td className="py-3 text-right">{item.discount > 0 ? item.discount + '%' : '-'}</td>
              <td className="py-3 text-right">{item.taxRate}%</td>
              <td className="py-3 text-right font-medium">{item.totalHT?.toFixed(2)} {symbol}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Totals */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-600">Total HT</span>
            <span className="font-bold text-slate-800">{(document.totalHT || 0).toFixed(2)} {symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-600">Total TVA</span>
            <span className="font-bold text-slate-800">{(document.tax || 0).toFixed(2)} {symbol}</span>
          </div>
          <div className="border-t-2 border-slate-800 pt-2 flex justify-between text-base">
            <span className="font-bold text-slate-900 uppercase">Net à payer</span>
            <span className="font-bold text-slate-900">{(document.totalTTC || 0).toFixed(2)} {symbol}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      <div className="mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>Merci de votre confiance.</p>
        <p className="mt-1">{company.name} - {company.address} - {company.siret}</p>
        <p>TVA Intracommunautaire : {company.vatNumber}</p>
      </div>
    </div>
  );
};
