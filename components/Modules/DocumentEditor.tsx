
import React, { useState, useRef, useEffect } from 'react';
import { Document, Product, Partner, LineItem, Status, DocType, CompanySettings, EntityType, Payment } from '../../types';
import { Plus, Trash, Save, Printer, ScanBarcode, Search, CheckCircle, AlertOctagon, XCircle, FileInput, ArrowRight, Wallet, AlertTriangle, Undo2, List, User, Truck } from 'lucide-react';
import { PrintTemplate } from '../UI/PrintTemplate';
import { DocumentPaymentModal } from './DocumentPaymentModal';
import { ProductSelectionModal } from './ProductSelectionModal';
import { PartnerSelectionModal } from './PartnerSelectionModal';

interface DocumentEditorProps {
  initialData?: Partial<Document>;
  docType: DocType;
  partners: Partner[];
  products: Product[];
  payments?: Payment[]; // New prop for history
  onSave: (doc: Document) => void;
  onAddPayment?: (payment: Payment) => void; // New prop handler
  onConvert?: (source: Document, targetType: DocType) => void;
  onCancel: () => void;
  currency: string;
  company: CompanySettings;
}

// --- Helper Functions ---
const calculateLineItem = (item: LineItem): LineItem => {
  const rawTotal = item.quantity * item.unitPrice;
  const discountAmount = rawTotal * (item.discount / 100);
  const totalHT = rawTotal - discountAmount;
  const taxAmount = totalHT * (item.taxRate / 100);
  const totalTTC = totalHT + taxAmount;
  return { ...item, totalHT, totalTTC };
};

const calculateDocTotals = (items: LineItem[]) => {
  const totalHT = items.reduce((sum, item) => sum + item.totalHT, 0);
  const totalTTC = items.reduce((sum, item) => sum + item.totalTTC, 0);
  const tax = totalTTC - totalHT;
  return { totalHT, tax, totalTTC };
};

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ initialData, docType, partners, products, payments = [], onSave, onAddPayment, onConvert, onCancel, currency, company }) => {
  
  const [doc, setDoc] = useState<Partial<Document>>(() => {
    const baseDoc = {
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
      reference: initialData?.reference || 'NOUVEAU',
      date: initialData?.date || new Date().toISOString().split('T')[0],
      partnerId: initialData?.partnerId || '',
      status: initialData?.status || Status.DRAFT,
      items: initialData?.items || [],
      type: docType
    };
    const calculatedItems = baseDoc.items.map(calculateLineItem);
    const totals = calculateDocTotals(calculatedItems);
    return { ...baseDoc, items: calculatedItems, ...totals };
  });

  const [editTtcState, setEditTtcState] = useState<{ index: number, value: string } | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // Payment Modal state
  const [showProductModal, setShowProductModal] = useState(false); // Product Catalog Modal state
  const [showPartnerModal, setShowPartnerModal] = useState(false); // Partner Selection Modal state

  const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : 'TND';

  // Calculate Already Paid
  const alreadyPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = (doc.totalTTC || 0) - alreadyPaid;
  const progressPercent = doc.totalTTC ? Math.min(100, (alreadyPaid / doc.totalTTC) * 100) : 0;

  // Determine if this document type supports payments directly
  // Now includes CREDIT NOTES
  const isPayableDoc = docType === DocType.INVOICE || docType === DocType.PURCHASE || docType === DocType.DELIVERY_NOTE || docType === DocType.CREDIT_NOTE || docType === DocType.PURCHASE_CREDIT_NOTE;

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(target.tagName);
      // Disable global listener if any modal is open
      if (e.key === 'Enter' && !isInteractive && !showPaymentModal && !showProductModal && !showPartnerModal) { 
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showPaymentModal, showProductModal, showPartnerModal]);

  const isPurchase = docType === DocType.PURCHASE || docType === DocType.ORDER || docType === DocType.PURCHASE_CREDIT_NOTE;
  
  // Used for display name
  const selectedPartner = partners.find(p => p.id === doc.partnerId);

  const getDocTitle = (type: DocType) => {
    switch (type) {
      case DocType.INVOICE: return 'Facture Client';
      case DocType.QUOTE: return 'Devis Client';
      case DocType.DELIVERY_NOTE: return 'Bon de Livraison';
      case DocType.CREDIT_NOTE: return 'Avoir Client';
      case DocType.ORDER: return 'Bon de Commande';
      case DocType.PURCHASE: return "Facture Fournisseur";
      case DocType.PURCHASE_CREDIT_NOTE: return "Avoir Fournisseur";
      default: return 'Document';
    }
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 20, 
      discount: 0,
      totalHT: 0,
      totalTTC: 0
    };
    setDoc(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const handleBulkAddProducts = (selectedItems: { product: Product; quantity: number }[]) => {
    const newItems = selectedItems.map(({ product, quantity }) => {
      const newItem: LineItem = {
        id: Math.random().toString(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        unitPrice: isPurchase ? product.cost : product.price,
        taxRate: product.taxRate || 20,
        discount: 0,
        totalHT: 0,
        totalTTC: 0
      };
      return calculateLineItem(newItem);
    });

    const combinedItems = [...(doc.items || []), ...newItems];
    const totals = calculateDocTotals(combinedItems);
    setDoc(prev => ({ ...prev, items: combinedItems, ...totals }));
  };

  const addProductByBarcode = (sku: string) => {
    const product = products.find(p => p.sku.toLowerCase() === sku.trim().toLowerCase());
    if (product) {
      const newItem: LineItem = {
        id: Math.random().toString(),
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: isPurchase ? product.cost : product.price,
        taxRate: product.taxRate || 20,
        discount: 0,
        totalHT: 0,
        totalTTC: 0
      };
      const calculatedItem = calculateLineItem(newItem);
      const newItems = [...(doc.items || []), calculatedItem];
      const totals = calculateDocTotals(newItems);
      setDoc(prev => ({ ...prev, items: newItems, ...totals }));
      setBarcodeInput('');
    } else {
      alert("Produit non trouvé.");
      setBarcodeInput(''); 
    }
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (barcodeInput.trim()) addProductByBarcode(barcodeInput);
    }
  };

  const handleRowInputKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
      barcodeInputRef.current?.focus();
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    let newItems = [...(doc.items || [])];
    let item = { ...newItems[index] };
    if (field === 'productId') {
      const prod = products.find(p => p.id === value);
      if (prod) {
        item.productId = prod.id;
        item.productName = prod.name;
        item.unitPrice = isPurchase ? prod.cost : prod.price;
        item.taxRate = prod.taxRate || 20;
      }
    } else {
      item = { ...item, [field]: value };
    }
    const calculatedItem = calculateLineItem(item);
    newItems[index] = calculatedItem;
    const totals = calculateDocTotals(newItems);
    setDoc(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const updateItemTTC = (index: number, ttcValue: number) => {
    if (isNaN(ttcValue)) return;
    let newItems = [...(doc.items || [])];
    let item = { ...newItems[index] };
    const taxMult = 1 + (item.taxRate / 100);
    item.unitPrice = ttcValue / taxMult;
    const calculatedItem = calculateLineItem(item);
    newItems[index] = calculatedItem;
    const totals = calculateDocTotals(newItems);
    setDoc(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const handleTtcFocus = (item: LineItem, index: number) => {
    const val = (item.unitPrice * (1 + item.taxRate/100)).toFixed(2);
    setEditTtcState({ index, value: val });
  };

  const handleTtcChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    setEditTtcState({ index, value: e.target.value });
  };

  const handleTtcBlur = (index: number) => {
    if (editTtcState && editTtcState.index === index) {
      updateItemTTC(index, parseFloat(editTtcState.value));
      setEditTtcState(null);
    }
  };

  const getTtcDisplayValue = (item: LineItem, index: number) => {
    if (editTtcState && editTtcState.index === index) return editTtcState.value;
    return (item.unitPrice * (1 + item.taxRate / 100)).toFixed(2);
  };

  const removeItem = (index: number) => {
    const newItems = doc.items?.filter((_, i) => i !== index) || [];
    const totals = calculateDocTotals(newItems);
    setDoc(prev => ({ ...prev, items: newItems, ...totals }));
  };

  const handleSave = () => {
    if (!doc.partnerId || !doc.items?.length) {
      alert("Veuillez sélectionner un partenaire et au moins un article.");
      return;
    }
    const partner = partners.find(p => p.id === doc.partnerId);
    onSave({ ...doc, partnerName: partner?.name || 'Inconnu' } as Document);

    // AUTO OPEN PAYMENT MODAL FOR PAYABLE DOCS IF NOT PAID
    if (isPayableDoc && doc.status !== Status.PAID && onAddPayment) {
        setShowPaymentModal(true);
    } else {
        alert("Document enregistré !");
    }
  };

  const changeStatus = (newStatus: Status) => {
    setDoc(prev => ({ ...prev, status: newStatus }));
  };

  const handleConversionAction = (targetType: DocType) => {
      if (onConvert) {
          const partner = partners.find(p => p.id === doc.partnerId);
          onConvert({ ...doc, partnerName: partner?.name || 'Inconnu' } as Document, targetType);
      }
  };

  return (
    <>
      {/* Payment Modal */}
      {showPaymentModal && onAddPayment && (
          <DocumentPaymentModal 
              document={doc as Document}
              alreadyPaid={alreadyPaid}
              currencySymbol={symbol}
              onAddPayment={onAddPayment}
              onClose={() => setShowPaymentModal(false)}
          />
      )}

      {/* Product Catalog Modal */}
      {showProductModal && (
        <ProductSelectionModal 
          products={products}
          currencySymbol={symbol}
          isPurchase={isPurchase}
          onSelect={handleBulkAddProducts}
          onClose={() => setShowProductModal(false)}
        />
      )}

      {/* Partner Selection Modal */}
      {showPartnerModal && (
        <PartnerSelectionModal 
            partners={partners}
            type={isPurchase ? EntityType.SUPPLIER : EntityType.CLIENT}
            onSelect={(p) => {
                setDoc({ ...doc, partnerId: p.id });
                setShowPartnerModal(false);
            }}
            onClose={() => setShowPartnerModal(false)}
        />
      )}

      {/* Print Template */}
      <PrintTemplate document={doc} company={company} partner={selectedPartner} />

      {/* Editor Interface */}
      <div className="bg-white h-full flex flex-col p-6 overflow-auto print:hidden">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-slate-800">{getDocTitle(docType)} {doc.reference}</h2>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                doc.status === Status.PAID ? 'bg-green-100 text-green-700' : 
                doc.status === Status.UNPAID ? 'bg-red-100 text-red-700' :
                doc.status === Status.VALIDATED ? 'bg-blue-100 text-blue-700' :
                'bg-slate-200 text-slate-600'
              }`}>
                {doc.status}
              </span>
            </div>

            {/* Payment Progress Bar */}
            {isPayableDoc && (
                 <div className="w-full max-w-md mt-3">
                     <div className="flex justify-between text-xs font-bold mb-1">
                         <span className={remaining > 0 ? "text-red-600" : "text-green-600"}>
                            {remaining > 0 ? `Reste à payer : ${remaining.toFixed(2)} ${symbol}` : 'Réglé'}
                         </span>
                         <span className="text-slate-500">Total : {(doc.totalTTC || 0).toFixed(2)} {symbol}</span>
                     </div>
                     <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                         <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                     </div>
                 </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
               {/* PAYMENT BUTTON FOR ALL PAYABLE DOCS */}
               {isPayableDoc && onAddPayment && (
                   <button 
                      onClick={() => setShowPaymentModal(true)} 
                      className="px-3 py-2 text-xs font-bold bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-1 shadow-sm"
                   >
                       <Wallet className="w-4 h-4" /> Saisir Règlement
                   </button>
               )}

               {/* Conversion Buttons */}
               {docType === DocType.QUOTE && (
                   <>
                    <button onClick={() => handleConversionAction(DocType.INVOICE)} className="px-3 py-2 text-xs font-bold bg-amber-50 text-amber-700 rounded border border-amber-200 hover:bg-amber-100 flex items-center gap-1">
                        <FileInput className="w-3 h-3" /> Vers Facture
                    </button>
                    <button onClick={() => handleConversionAction(DocType.DELIVERY_NOTE)} className="px-3 py-2 text-xs font-bold bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3" /> Vers BL
                    </button>
                   </>
               )}
               {docType === DocType.DELIVERY_NOTE && (
                    <button onClick={() => handleConversionAction(DocType.INVOICE)} className="px-3 py-2 text-xs font-bold bg-amber-50 text-amber-700 rounded border border-amber-200 hover:bg-amber-100 flex items-center gap-1">
                        <FileInput className="w-3 h-3" /> Vers Facture
                    </button>
               )}
               {docType === DocType.INVOICE && (
                   <button onClick={() => handleConversionAction(DocType.CREDIT_NOTE)} className="px-3 py-2 text-xs font-bold bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 flex items-center gap-1">
                       <Undo2 className="w-3 h-3" /> Créer Avoir
                   </button>
               )}
               {docType === DocType.PURCHASE && (
                   <button onClick={() => handleConversionAction(DocType.PURCHASE_CREDIT_NOTE)} className="px-3 py-2 text-xs font-bold bg-red-50 text-red-700 rounded border border-red-200 hover:bg-red-100 flex items-center gap-1">
                       <Undo2 className="w-3 h-3" /> Créer Avoir
                   </button>
               )}

              <button onClick={onCancel} className="px-4 py-2 text-slate-600 border rounded hover:bg-slate-50 text-sm">Annuler</button>
              <button onClick={() => window.print()} className="px-4 py-2 text-slate-600 border rounded hover:bg-slate-50 flex items-center gap-2 text-sm">
                <Printer className="w-4 h-4"/> Imprimer
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm">
                <Save className="w-4 h-4"/> Enregistrer
              </button>
            </div>
            
             <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400 uppercase font-bold">Statut:</span>
                <select 
                  className="text-xs border border-slate-300 rounded p-1 bg-white text-black outline-none"
                  value={doc.status}
                  onChange={(e) => changeStatus(e.target.value as Status)}
                >
                  {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-3 gap-6 mb-8 bg-slate-50 p-4 rounded border border-slate-200">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              {isPurchase ? <Truck className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {isPurchase ? 'Fournisseur' : 'Client'}
            </label>
            <div className="flex gap-2">
                <input 
                    type="text"
                    className="flex-1 border border-slate-300 rounded p-2 bg-white text-black font-medium cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder={`Cliquez pour sélectionner un ${isPurchase ? 'fournisseur' : 'client'}...`}
                    value={selectedPartner ? selectedPartner.name : ''}
                    readOnly
                    onClick={() => setShowPartnerModal(true)}
                />
                <button 
                    onClick={() => setShowPartnerModal(true)}
                    className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition-colors"
                    title="Rechercher"
                >
                    <Search className="w-4 h-4" />
                </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
            <input 
              type="date" 
              className="border p-2 rounded bg-white text-black"
              value={doc.date}
              onChange={e => setDoc({...doc, date: e.target.value})}
            />
          </div>
          
          {docType === DocType.QUOTE && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Conditions</label>
            <select className="border p-2 rounded bg-white text-black">
              <option>Paiement immédiat</option>
              <option>15 Jours</option>
              <option>30 Jours</option>
            </select>
          </div>
          )}
        </div>

        {/* Scanner & Toolbar */}
        <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-4 bg-indigo-50 p-3 rounded border border-indigo-100 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <ScanBarcode className="w-5 h-5 text-indigo-600" />
                <input 
                  ref={barcodeInputRef}
                  type="text" 
                  className="flex-1 bg-white border border-indigo-200 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-black"
                  placeholder="Scanner code-barres (SKU) et appuyez sur Entrée..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleBarcodeKeyDown}
                  autoFocus
                />
              </div>
            </div>
            
            {/* Catalog Button */}
            <button 
                onClick={() => setShowProductModal(true)}
                className="bg-indigo-600 text-white px-4 py-3 rounded hover:bg-indigo-700 flex items-center gap-2 shadow-sm whitespace-nowrap"
            >
                <List className="w-4 h-4" /> Catalogue
            </button>
        </div>

        {/* Line Items */}
        <div className="flex-1 overflow-x-auto">
          <table className="w-full mb-4 min-w-[1000px]">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="text-left p-2 text-xs font-bold text-slate-600 uppercase w-64">Produit</th>
                <th className="text-right p-2 text-xs font-bold text-slate-600 uppercase w-16">Qté</th>
                <th className="text-right p-2 text-xs font-bold text-slate-600 uppercase w-24">Prix HT</th>
                <th className="text-right p-2 text-xs font-bold text-slate-600 uppercase w-16">TVA %</th>
                <th className="text-right p-2 text-xs font-bold text-slate-600 uppercase w-16">Remise %</th>
                <th className="text-right p-2 text-xs font-bold text-slate-600 uppercase w-24">P.U. TTC</th>
                <th className="text-right p-2 text-xs font-bold text-slate-600 uppercase w-24">Total TTC</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {doc.items?.map((item, idx) => (
                <tr key={item.id} className="border-b last:border-0 group hover:bg-slate-50">
                  <td className="p-2">
                    <select 
                      className="w-full p-1 bg-white text-black border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500"
                      value={item.productId}
                      onChange={e => updateItem(idx, 'productId', e.target.value)}
                      onKeyDown={handleRowInputKeyDown}
                    >
                      <option value="">-- Article --</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      className="w-full text-right p-1 bg-white text-black border border-slate-200 rounded"
                      value={item.quantity}
                      onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                      onKeyDown={handleRowInputKeyDown}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full text-right p-1 bg-white text-black border border-slate-200 rounded"
                      value={item.unitPrice}
                      onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))}
                      onKeyDown={handleRowInputKeyDown}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      className="w-full text-right p-1 bg-white text-black border border-slate-200 rounded"
                      value={item.taxRate}
                      onChange={e => updateItem(idx, 'taxRate', Number(e.target.value))}
                      onKeyDown={handleRowInputKeyDown}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      className="w-full text-right p-1 bg-white text-black border border-slate-200 rounded"
                      value={item.discount}
                      onChange={e => updateItem(idx, 'discount', Number(e.target.value))}
                      onKeyDown={handleRowInputKeyDown}
                    />
                  </td>
                  <td className="p-2">
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full text-right p-1 bg-white text-black border border-slate-200 rounded font-bold text-indigo-700"
                      value={getTtcDisplayValue(item, idx)}
                      onFocus={() => handleTtcFocus(item, idx)}
                      onChange={(e) => handleTtcChange(e, idx)}
                      onBlur={() => handleTtcBlur(idx)}
                      onKeyDown={handleRowInputKeyDown}
                    />
                  </td>
                  <td className="p-2 text-right font-medium text-slate-800">
                    {item.totalTTC.toFixed(2)} {symbol}
                  </td>
                  <td className="p-2 text-center">
                    <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItem} className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">
            <Plus className="w-4 h-4"/> Ajouter une ligne manuelle
          </button>
        </div>

        {/* Totals */}
        <div className="flex justify-end mt-8">
          <div className="w-72 bg-slate-50 p-4 rounded border border-slate-200 shadow-sm">
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 text-sm">Total HT</span>
              <span className="font-medium text-slate-800">{(doc.totalHT || 0).toFixed(2)} {symbol}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-200">
              <span className="text-slate-600 text-sm">Total TVA</span>
              <span className="font-medium text-slate-800">{(doc.tax || 0).toFixed(2)} {symbol}</span>
            </div>
            <div className="flex justify-between pt-2 text-lg font-bold text-indigo-700">
              <span>Net à payer TTC</span>
              <span>{(doc.totalTTC || 0).toFixed(2)} {symbol}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
