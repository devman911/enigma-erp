
import React, { useReducer, useState } from 'react';
import { AppState, TabData, EntityType, Product, Document, DocType, Status, ProductFamily, ProductCategory, ProductSubCategory, TaxRate, CompanySettings as CompanySettingsType, Partner, User, Payment, PaymentStatus, CashSession, PaymentMethod, Expense, PaymentNature } from './types';
import { INITIAL_STATE } from './services/mockData';
import { Dashboard } from './components/Modules/Dashboard';
import { Inventory } from './components/Modules/Inventory';
import { DocumentEditor } from './components/Modules/DocumentEditor';
import { DocumentList } from './components/Modules/DocumentList';
import { ProductEditor } from './components/Modules/ProductEditor';
import { CategoryManager } from './components/Modules/CategoryManager';
import { TaxManager } from './components/Modules/TaxManager';
import { CompanySettings } from './components/Modules/CompanySettings';
import { PartnerList } from './components/Modules/PartnerList';
import { PartnerEditor } from './components/Modules/PartnerEditor';
import { UserList } from './components/Modules/UserList';
import { UserEditor } from './components/Modules/UserEditor';
import { PaymentList } from './components/Modules/PaymentList';
import { CheckList } from './components/Modules/CheckList';
import { CashRegister } from './components/Modules/CashRegister';
import { ExpenseList } from './components/Modules/ExpenseList';
import { DataTable } from './components/UI/DataTable';
import { Layout, LayoutGrid, ShoppingCart, Truck, Users, Settings, X, FileText, Package, FolderTree, Building2, Percent, ClipboardList, ShoppingBag, Receipt, User as UserIcon, Shield, Wallet, ArrowUpRight, ArrowDownLeft, Banknote, DollarSign, Undo2, FileBarChart, TrendingDown, RotateCcw } from 'lucide-react';

// --- Reducer for "Backend" logic ---
type Action = 
  | { type: 'ADD_TAB', payload: TabData }
  | { type: 'CLOSE_TAB', payload: string }
  | { type: 'SET_ACTIVE_TAB', payload: string }
  | { type: 'SAVE_DOC', payload: Document }
  | { type: 'SAVE_PRODUCT', payload: Product }
  | { type: 'SAVE_PARTNER', payload: Partner }
  | { type: 'DELETE_PARTNER', payload: string }
  | { type: 'ADD_FAMILY', payload: string }
  | { type: 'UPDATE_FAMILY', payload: { id: string, name: string } }
  | { type: 'ADD_CATEGORY', payload: { familyId: string, name: string } }
  | { type: 'UPDATE_CATEGORY', payload: { id: string, name: string } }
  | { type: 'ADD_SUBCATEGORY', payload: { categoryId: string, name: string } }
  | { type: 'UPDATE_SUBCATEGORY', payload: { id: string, name: string } }
  | { type: 'ADD_TAX_RATE', payload: { name: string, rate: number } }
  | { type: 'DELETE_TAX_RATE', payload: string }
  | { type: 'UPDATE_COMPANY', payload: CompanySettingsType }
  | { type: 'SAVE_USER', payload: User }
  | { type: 'DELETE_USER', payload: string }
  | { type: 'ADD_PAYMENT', payload: Payment }
  | { type: 'DELETE_PAYMENT', payload: string }
  | { type: 'UPDATE_PAYMENT_STATUS', payload: { id: string, status: PaymentStatus } }
  | { type: 'ADD_EXPENSE', payload: Expense }
  | { type: 'DELETE_EXPENSE', payload: string }
  | { type: 'OPEN_CASH_SESSION', payload: { openingBalance: number } }
  | { type: 'CLOSE_CASH_SESSION', payload: { id: string, actualBalance: number } };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_TAB':
      const existing = state.tabs.find(t => t.id === action.payload.id);
      if (existing) return { ...state, activeTabId: existing.id };
      return { ...state, tabs: [...state.tabs, action.payload], activeTabId: action.payload.id };
    
    case 'CLOSE_TAB':
      const newTabs = state.tabs.filter(t => t.id !== action.payload);
      let newActiveId = state.activeTabId;
      if (state.activeTabId === action.payload && newTabs.length > 0) {
        newActiveId = newTabs[newTabs.length - 1].id;
      }
      return { ...state, tabs: newTabs, activeTabId: newActiveId };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.payload };
    
    case 'SAVE_DOC':
      const docExists = state.documents.find(d => d.id === action.payload.id);
      const updatedDocs = docExists 
        ? state.documents.map(d => d.id === action.payload.id ? action.payload : d)
        : [...state.documents, action.payload];
      return { ...state, documents: updatedDocs };
      
    case 'SAVE_PRODUCT':
      const prodIndex = state.products.findIndex(p => p.id === action.payload.id);
      let newProducts;
      if (prodIndex >= 0) {
        newProducts = [...state.products];
        newProducts[prodIndex] = action.payload;
      } else {
        newProducts = [...state.products, action.payload];
      }
      return { ...state, products: newProducts };

    case 'SAVE_PARTNER':
      const partIndex = state.partners.findIndex(p => p.id === action.payload.id);
      let newPartners;
      if (partIndex >= 0) {
        newPartners = [...state.partners];
        newPartners[partIndex] = action.payload;
      } else {
        newPartners = [...state.partners, action.payload];
      }
      return { ...state, partners: newPartners };

    case 'DELETE_PARTNER':
      return { ...state, partners: state.partners.filter(p => p.id !== action.payload) };

    case 'ADD_FAMILY':
        const newFam: ProductFamily = { id: `fam_${Date.now()}`, name: action.payload };
        return { ...state, families: [...state.families, newFam] };

    case 'UPDATE_FAMILY':
        return { ...state, families: state.families.map(f => f.id === action.payload.id ? { ...f, name: action.payload.name } : f) };

    case 'ADD_CATEGORY':
        const newCat: ProductCategory = { id: `cat_${Date.now()}`, familyId: action.payload.familyId, name: action.payload.name };
        return { ...state, categories: [...state.categories, newCat] };

    case 'UPDATE_CATEGORY':
        return { ...state, categories: state.categories.map(c => c.id === action.payload.id ? { ...c, name: action.payload.name } : c) };

    case 'ADD_SUBCATEGORY':
        const newSub: ProductSubCategory = { id: `sub_${Date.now()}`, categoryId: action.payload.categoryId, name: action.payload.name };
        return { ...state, subCategories: [...state.subCategories, newSub] };

    case 'UPDATE_SUBCATEGORY':
        return { ...state, subCategories: state.subCategories.map(s => s.id === action.payload.id ? { ...s, name: action.payload.name } : s) };

    case 'ADD_TAX_RATE':
        const newTax: TaxRate = { id: `tax_${Date.now()}`, name: action.payload.name, rate: action.payload.rate };
        return { ...state, taxRates: [...state.taxRates, newTax] };

    case 'DELETE_TAX_RATE':
        return { ...state, taxRates: state.taxRates.filter(t => t.id !== action.payload) };
      
    case 'UPDATE_COMPANY':
        return { ...state, company: action.payload };

    case 'SAVE_USER':
        const userIndex = state.users.findIndex(u => u.id === action.payload.id);
        let newUsers;
        if (userIndex >= 0) {
          newUsers = [...state.users];
          newUsers[userIndex] = action.payload;
        } else {
          newUsers = [...state.users, action.payload];
        }
        return { ...state, users: newUsers };

    case 'DELETE_USER':
        return { ...state, users: state.users.filter(u => u.id !== action.payload) };

    case 'ADD_PAYMENT':
        // Update Session Totals if there is an active session and payment is CASH
        {
          const activeSession = state.cashSessions.find(s => s.status === 'OPEN');
          let newSessions = state.cashSessions;
          
          if (activeSession && action.payload.method === PaymentMethod.CASH) {
            const isClient = state.partners.find(p => p.id === action.payload.partnerId)?.type === EntityType.CLIENT;
            const updatedSession = { ...activeSession };
            const nature = action.payload.nature || PaymentNature.PAYMENT;

            // Logic matrix:
            // Client + Payment = IN
            // Client + Refund = OUT
            // Supplier + Payment = OUT
            // Supplier + Refund = IN

            let isMoneyIn = false;
            if (isClient) {
                isMoneyIn = nature === PaymentNature.PAYMENT;
            } else {
                isMoneyIn = nature === PaymentNature.REFUND;
            }
            
            if (isMoneyIn) updatedSession.totalIn += action.payload.amount;
            else updatedSession.totalOut += action.payload.amount;
            
            newSessions = state.cashSessions.map(s => s.id === activeSession.id ? updatedSession : s);
          }

          return { 
              ...state, 
              payments: [...state.payments, action.payload],
              cashSessions: newSessions
          };
        }

    case 'DELETE_PAYMENT':
        return { ...state, payments: state.payments.filter(p => p.id !== action.payload) };
    
    case 'UPDATE_PAYMENT_STATUS':
        return { ...state, payments: state.payments.map(p => p.id === action.payload.id ? { ...p, status: action.payload.status } : p) };
    
    case 'ADD_EXPENSE':
      // Update Session Totals if Cash
      {
        const activeSession = state.cashSessions.find(s => s.status === 'OPEN');
        let newSessions = state.cashSessions;
        if (activeSession && action.payload.method === PaymentMethod.CASH) {
           const updatedSession = { ...activeSession, totalOut: activeSession.totalOut + action.payload.amount };
           newSessions = state.cashSessions.map(s => s.id === activeSession.id ? updatedSession : s);
        }
        return {
          ...state,
          expenses: [...state.expenses, action.payload],
          cashSessions: newSessions
        };
      }

    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };

    case 'OPEN_CASH_SESSION':
        const newSession: CashSession = {
            id: `session_${Date.now()}`,
            openedAt: new Date().toISOString(),
            status: 'OPEN',
            openingBalance: action.payload.openingBalance,
            totalIn: 0,
            totalOut: 0
        };
        return { ...state, cashSessions: [...state.cashSessions, newSession] };

    case 'CLOSE_CASH_SESSION':
        const sessionToClose = state.cashSessions.find(s => s.id === action.payload.id);
        if (!sessionToClose) return state;

        const theoretical = sessionToClose.openingBalance + sessionToClose.totalIn - sessionToClose.totalOut;
        const closedSession: CashSession = {
            ...sessionToClose,
            status: 'CLOSED',
            closedAt: new Date().toISOString(),
            closingBalance: theoretical,
            actualBalance: action.payload.actualBalance,
            difference: action.payload.actualBalance - theoretical
        };
        return { ...state, cashSessions: state.cashSessions.map(s => s.id === action.payload.id ? closedSession : s) };

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const currentCurrency = state.company.currency;
  const currencySymbol = currentCurrency === 'EUR' ? '€' : currentCurrency === 'USD' ? '$' : 'TND';

  // --- Actions ---
  const openDashboard = () => dispatch({ type: 'ADD_TAB', payload: { id: 'dashboard', title: 'Tableau de bord', type: 'DASHBOARD', module: 'SALES' }});
  
  const openInventory = () => dispatch({ type: 'ADD_TAB', payload: { id: 'inventory', title: 'Gestion des Stocks', type: 'LIST', module: 'INVENTORY' }});

  const openCategories = () => dispatch({ type: 'ADD_TAB', payload: { id: 'categories', title: 'Familles & Catégories', type: 'CONFIG', module: 'INVENTORY' }});
  
  const openInvoices = () => dispatch({ type: 'ADD_TAB', payload: { id: 'invoices', title: 'Factures Client', type: 'LIST', module: 'SALES' }});
  const openQuotes = () => dispatch({ type: 'ADD_TAB', payload: { id: 'quotes', title: 'Devis', type: 'LIST', module: 'SALES' }});
  const openDeliveryNotes = () => dispatch({ type: 'ADD_TAB', payload: { id: 'delivery_notes', title: 'Ventes (BL)', type: 'LIST', module: 'SALES' }});
  const openCreditNotes = () => dispatch({ type: 'ADD_TAB', payload: { id: 'credit_notes', title: 'Avoirs Clients', type: 'LIST', module: 'SALES' }});

  // Purchases Actions
  const openPurchaseInvoices = () => dispatch({ type: 'ADD_TAB', payload: { id: 'purchase_invoices', title: 'Factures Achat', type: 'LIST', module: 'PURCHASES' }});
  const openPurchaseOrders = () => dispatch({ type: 'ADD_TAB', payload: { id: 'purchase_orders', title: 'Commandes Fourn.', type: 'LIST', module: 'PURCHASES' }});
  const openPurchaseCreditNotes = () => dispatch({ type: 'ADD_TAB', payload: { id: 'purchase_credit_notes', title: 'Avoirs Fourn.', type: 'LIST', module: 'PURCHASES' }});

  // Partners Actions
  const openClients = () => dispatch({ type: 'ADD_TAB', payload: { id: 'clients_list', title: 'Clients', type: 'LIST', module: 'PARTNERS' }});
  const openSuppliers = () => dispatch({ type: 'ADD_TAB', payload: { id: 'suppliers_list', title: 'Fournisseurs', type: 'LIST', module: 'PARTNERS' }});

  const openTaxSettings = () => dispatch({ type: 'ADD_TAB', payload: { id: 'settings_taxes', title: 'Taxes & TVA', type: 'CONFIG', module: 'SETTINGS' }});
  const openCompanySettings = () => dispatch({ type: 'ADD_TAB', payload: { id: 'settings_company', title: 'Ma Société', type: 'CONFIG', module: 'COMPANY' }});
  const openUsers = () => dispatch({ type: 'ADD_TAB', payload: { id: 'users_list', title: 'Utilisateurs', type: 'LIST', module: 'USERS' }});

  // Finance Actions
  const openClientPayments = () => dispatch({ type: 'ADD_TAB', payload: { id: 'payments_clients', title: 'Encaissements Clients', type: 'LIST', module: 'FINANCE' }});
  const openSupplierPayments = () => dispatch({ type: 'ADD_TAB', payload: { id: 'payments_suppliers', title: 'Décaissements Fourn.', type: 'LIST', module: 'FINANCE' }});
  const openClientRefunds = () => dispatch({ type: 'ADD_TAB', payload: { id: 'refunds_clients', title: 'Remboursements Clients', type: 'LIST', module: 'FINANCE' }});
  // const openSupplierRefunds = () => dispatch({ type: 'ADD_TAB', payload: { id: 'refunds_suppliers', title: 'Remboursements Fourn.', type: 'LIST', module: 'FINANCE' }}); // REMOVED

  const openChecks = () => dispatch({ type: 'ADD_TAB', payload: { id: 'checks_mgmt', title: 'Gestion des Chèques', type: 'LIST', module: 'CHECKS' }});
  const openCashRegister = () => dispatch({ type: 'ADD_TAB', payload: { id: 'cash_register', title: 'Caisse & Clôture', type: 'LIST', module: 'CASH' }});
  const openExpenses = () => dispatch({ type: 'ADD_TAB', payload: { id: 'expenses_list', title: 'Dépenses', type: 'LIST', module: 'EXPENSES' }});
  
  // New Separate Statements Actions
  const openClientStatements = () => dispatch({ type: 'ADD_TAB', payload: { id: 'statements_clients', title: 'Relevés Clients', type: 'LIST', module: 'PARTNERS' }});
  const openSupplierStatements = () => dispatch({ type: 'ADD_TAB', payload: { id: 'statements_suppliers', title: 'Relevés Fourn.', type: 'LIST', module: 'PARTNERS' }});

  // Creation Actions
  const createInvoice = () => {
    const id = `new_inv_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouvelle Facture', type: 'FORM', module: 'SALES', entityId: id }});
  };

  const createQuote = () => {
    const id = `new_quo_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouveau Devis', type: 'FORM', module: 'SALES', entityId: id }});
  };

  const createDeliveryNote = () => {
    const id = `new_bl_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouveau BL', type: 'FORM', module: 'SALES', entityId: id }});
  };

  const createCreditNote = () => {
    const id = `new_cn_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouvel Avoir', type: 'FORM', module: 'SALES', entityId: id }});
  }

  const createPurchaseInvoice = () => {
    const id = `new_pur_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouvelle Fact. Achat', type: 'FORM', module: 'PURCHASES', entityId: id }});
  };

  const createPurchaseOrder = () => {
    const id = `new_ord_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouv. Commande', type: 'FORM', module: 'PURCHASES', entityId: id }});
  };

  const createPurchaseCreditNote = () => {
    const id = `new_pcn_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouvel Avoir Fourn.', type: 'FORM', module: 'PURCHASES', entityId: id }});
  };

  const createClient = () => {
    const id = `new_cli_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouveau Client', type: 'FORM', module: 'PARTNERS', entityId: id }});
  };

  const createSupplier = () => {
    const id = `new_sup_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouveau Fournisseur', type: 'FORM', module: 'PARTNERS', entityId: id }});
  };

  const createUser = () => {
    const id = `new_user_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouvel Utilisateur', type: 'FORM', module: 'USERS', entityId: id }});
  };

  const handleEditDoc = (doc: Document) => {
    const module = (doc.type === DocType.PURCHASE || doc.type === DocType.ORDER || doc.type === DocType.PURCHASE_CREDIT_NOTE) ? 'PURCHASES' : 'SALES';
    dispatch({ type: 'ADD_TAB', payload: { id: doc.id, title: doc.reference, type: 'FORM', module: module, entityId: doc.id }});
  };

  const handleCreateProduct = () => {
    const id = `new_prod_${Date.now()}`;
    dispatch({ type: 'ADD_TAB', payload: { id, title: 'Nouveau Produit', type: 'FORM', module: 'INVENTORY', entityId: id }});
  };

  const handleEditProduct = (product: Product) => {
    dispatch({ type: 'ADD_TAB', payload: { id: product.id, title: product.name, type: 'FORM', module: 'INVENTORY', entityId: product.id }});
  };

  // Updated to accept period
  const handleEditPartner = (partner: Partner, initialTab?: string, dates?: { startDate: string, endDate: string }) => {
    dispatch({ type: 'ADD_TAB', payload: { 
        id: partner.id, 
        title: partner.name, 
        type: 'FORM', 
        module: 'PARTNERS', 
        entityId: partner.id, 
        initialTab,
        startDate: dates?.startDate,
        endDate: dates?.endDate
    }});
  };

  const handleEditUser = (user: User) => {
    dispatch({ type: 'ADD_TAB', payload: { id: user.id, title: user.name, type: 'FORM', module: 'USERS', entityId: user.id }});
  };

  const handleSaveDoc = (doc: Document) => {
    dispatch({ type: 'SAVE_DOC', payload: doc });
  };

  // Convert Document Logic (Devis -> Facture/BL, BL -> Facture, Facture -> Avoir)
  const handleConvertDoc = (sourceDoc: Document, targetType: DocType) => {
     const newId = `conv_${Date.now()}`;
     
     let title = 'Document';
     if (targetType === DocType.INVOICE) title = 'Nouvelle Facture';
     if (targetType === DocType.DELIVERY_NOTE) title = 'Nouveau BL';
     if (targetType === DocType.CREDIT_NOTE) title = 'Nouvel Avoir';
     if (targetType === DocType.PURCHASE_CREDIT_NOTE) title = 'Nouvel Avoir Fourn.';

     const newDoc: Document = {
         ...sourceDoc,
         id: newId,
         type: targetType,
         reference: 'BROUILLON', // Reset Reference
         date: new Date().toISOString().split('T')[0], // Reset Date
         status: Status.DRAFT, // Reset Status
         // For Credit Notes, we keep positive numbers in the UI typically, 
         // but the business logic (which is mock here) would treat them as negative for balance.
     };

     // Save the new drafted document
     dispatch({ type: 'SAVE_DOC', payload: newDoc });
     
     // Open it in a new tab
     dispatch({ type: 'ADD_TAB', payload: { 
         id: newId, 
         title: title, 
         type: 'FORM', 
         module: (targetType === DocType.PURCHASE_CREDIT_NOTE) ? 'PURCHASES' : 'SALES', 
         entityId: newId 
     }});
  };

  const handleSaveProduct = (product: Product) => {
    dispatch({ type: 'SAVE_PRODUCT', payload: product });
    dispatch({ type: 'CLOSE_TAB', payload: product.id }); // Close form on save
    const inventoryTab = state.tabs.find(t => t.id === 'inventory');
    if(inventoryTab) dispatch({ type: 'SET_ACTIVE_TAB', payload: 'inventory' });
  };

  const handleSavePartner = (partner: Partner) => {
    dispatch({ type: 'SAVE_PARTNER', payload: partner });
    dispatch({ type: 'CLOSE_TAB', payload: partner.id });
    // Switch to appropriate list tab if open
    if (partner.type === EntityType.CLIENT && state.tabs.some(t => t.id === 'clients_list')) {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'clients_list' });
    } else if (partner.type === EntityType.SUPPLIER && state.tabs.some(t => t.id === 'suppliers_list')) {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'suppliers_list' });
    }
  };

  const handleSaveUser = (user: User) => {
    dispatch({ type: 'SAVE_USER', payload: user });
    dispatch({ type: 'CLOSE_TAB', payload: user.id });
    if (state.tabs.some(t => t.id === 'users_list')) {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'users_list' });
    }
  };

  const handleDeletePartner = (id: string) => {
    dispatch({ type: 'DELETE_PARTNER', payload: id });
    dispatch({ type: 'CLOSE_TAB', payload: id });
    alert('Fiche supprimée.');
  };

  const handleDeleteUser = (id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
    dispatch({ type: 'CLOSE_TAB', payload: id });
    alert('Utilisateur supprimé.');
  };

  const handleSaveCompany = (company: CompanySettingsType) => {
    dispatch({ type: 'UPDATE_COMPANY', payload: company });
    alert('Paramètres de la société mis à jour.');
  };

  const handleAddPayment = (payment: Payment) => {
      dispatch({ type: 'ADD_PAYMENT', payload: payment });
      
      const doc = state.documents.find(d => d.id === payment.documentId);
      if (doc) {
          const docPayments = [...state.payments, payment].filter(p => p.documentId === doc.id);
          const totalPaid = docPayments.reduce((sum, p) => sum + p.amount, 0);
          if (totalPaid >= doc.totalTTC - 0.01) { // tolerance
              dispatch({ type: 'SAVE_DOC', payload: { ...doc, status: Status.PAID } });
          }
      }
      alert('Règlement enregistré avec succès.');
  };

  const handleDeletePayment = (id: string) => {
      if (confirm("Êtes-vous sûr de vouloir supprimer ce règlement ?")) {
          dispatch({ type: 'DELETE_PAYMENT', payload: id });
      }
  };

  const handleUpdatePaymentStatus = (id: string, status: PaymentStatus) => {
    dispatch({ type: 'UPDATE_PAYMENT_STATUS', payload: { id, status } });
  }

  const handleAddExpense = (expense: Expense) => {
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    alert('Dépense enregistrée.');
  }

  const handleDeleteExpense = (id: string) => {
    if (confirm("Supprimer cette dépense ?")) {
      dispatch({ type: 'DELETE_EXPENSE', payload: id });
    }
  }

  // Cash Register Handlers
  const handleOpenSession = (openingBalance: number) => {
      dispatch({ type: 'OPEN_CASH_SESSION', payload: { openingBalance } });
  }
  const handleCloseSession = (id: string, actualBalance: number) => {
      dispatch({ type: 'CLOSE_CASH_SESSION', payload: { id, actualBalance } });
  }

  // --- Render Active Tab Content ---
  const renderContent = () => {
    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    if (!activeTab) return null;

    if (activeTab.type === 'DASHBOARD') return <Dashboard data={state} />;
    
    // Module Inventory - List
    if (activeTab.type === 'LIST' && activeTab.module === 'INVENTORY') {
      return <Inventory 
        products={state.products} 
        onCreate={handleCreateProduct}
        onEdit={handleEditProduct}
        currency={currentCurrency}
      />;
    }

    // Module Inventory - Categories
    if (activeTab.type === 'CONFIG' && activeTab.module === 'INVENTORY') {
      return <CategoryManager 
        families={state.families}
        categories={state.categories}
        subCategories={state.subCategories}
        onAddFamily={(name) => dispatch({ type: 'ADD_FAMILY', payload: name })}
        onUpdateFamily={(id, name) => dispatch({ type: 'UPDATE_FAMILY', payload: { id, name } })}
        onAddCategory={(familyId, name) => dispatch({ type: 'ADD_CATEGORY', payload: { familyId, name } })}
        onUpdateCategory={(id, name) => dispatch({ type: 'UPDATE_CATEGORY', payload: { id, name } })}
        onAddSubCategory={(categoryId, name) => dispatch({ type: 'ADD_SUBCATEGORY', payload: { categoryId, name } })}
        onUpdateSubCategory={(id, name) => dispatch({ type: 'UPDATE_SUBCATEGORY', payload: { id, name } })}
      />;
    }

    // Module Partners - List (Clients)
    if (activeTab.type === 'LIST' && activeTab.module === 'PARTNERS' && activeTab.id === 'clients_list') {
        return <PartnerList 
          partners={state.partners}
          documents={state.documents} 
          payments={state.payments}
          type={EntityType.CLIENT}
          onCreate={createClient}
          onEdit={handleEditPartner}
          onDelete={handleDeletePartner}
          currency={currentCurrency}
        />;
    }

    // Module Partners - List (Suppliers)
    if (activeTab.type === 'LIST' && activeTab.module === 'PARTNERS' && activeTab.id === 'suppliers_list') {
        return <PartnerList 
          partners={state.partners}
          documents={state.documents}
          payments={state.payments}
          type={EntityType.SUPPLIER}
          onCreate={createSupplier}
          onEdit={handleEditPartner}
          onDelete={handleDeletePartner}
          currency={currentCurrency}
        />;
    }

    // Module Partners - List (Client Statements)
    if (activeTab.type === 'LIST' && activeTab.module === 'PARTNERS' && activeTab.id === 'statements_clients') {
        return <PartnerList 
          partners={state.partners}
          documents={state.documents}
          payments={state.payments}
          type={EntityType.CLIENT}
          showPeriodFilter={true} // Enable date filter
          onCreate={() => {}} // Disabled create in statement view
          onEdit={(partner, dates) => handleEditPartner(partner, 'STATEMENT', dates)} // Open directly on statement tab with dates
          onDelete={handleDeletePartner}
          currency={currentCurrency}
        />;
    }

    // Module Partners - List (Supplier Statements)
    if (activeTab.type === 'LIST' && activeTab.module === 'PARTNERS' && activeTab.id === 'statements_suppliers') {
        return <PartnerList 
          partners={state.partners}
          documents={state.documents}
          payments={state.payments}
          type={EntityType.SUPPLIER}
          showPeriodFilter={true} // Enable date filter
          onCreate={() => {}} // Disabled create in statement view
          onEdit={(partner, dates) => handleEditPartner(partner, 'STATEMENT', dates)} // Open directly on statement tab with dates
          onDelete={handleDeletePartner}
          currency={currentCurrency}
        />;
    }

    // Module Partners - Form (Editor)
    if (activeTab.type === 'FORM' && activeTab.module === 'PARTNERS') {
        const partnerData = state.partners.find(p => p.id === activeTab.entityId);
        // Deduce default type from ID or existing data
        const defaultType = activeTab.entityId?.startsWith('new_sup') ? EntityType.SUPPLIER : EntityType.CLIENT;

        return <PartnerEditor 
          initialData={partnerData}
          defaultType={partnerData?.type || defaultType}
          initialTab={activeTab.initialTab} // Pass the specific tab to open
          startDate={activeTab.startDate}   // Pass date filters
          endDate={activeTab.endDate}       // Pass date filters
          documents={state.documents} 
          payments={state.payments} 
          onSave={handleSavePartner}
          onAddPayment={handleAddPayment} 
          onDeletePayment={handleDeletePayment} 
          onCancel={() => dispatch({ type: 'CLOSE_TAB', payload: activeTab.id })}
          onDelete={handleDeletePartner}
          currency={currentCurrency}
        />;
    }

    // Module Users - List
    if (activeTab.type === 'LIST' && activeTab.module === 'USERS') {
        return <UserList 
          users={state.users}
          onCreate={createUser}
          onEdit={handleEditUser}
        />;
    }

    // Module Users - Form (Editor)
    if (activeTab.type === 'FORM' && activeTab.module === 'USERS') {
        const userData = state.users.find(u => u.id === activeTab.entityId);
        return <UserEditor 
          initialData={userData}
          onSave={handleSaveUser}
          onCancel={() => dispatch({ type: 'CLOSE_TAB', payload: activeTab.id })}
          onDelete={handleDeleteUser}
        />;
    }

    // Module Settings - Tax Manager
    if (activeTab.type === 'CONFIG' && activeTab.module === 'SETTINGS') {
        return <TaxManager 
          taxRates={state.taxRates}
          onAdd={(name, rate) => dispatch({ type: 'ADD_TAX_RATE', payload: { name, rate } })}
          onDelete={(id) => dispatch({ type: 'DELETE_TAX_RATE', payload: id })}
        />;
    }

    // Module Settings - Company
    if (activeTab.type === 'CONFIG' && activeTab.module === 'COMPANY') {
        return <CompanySettings 
          data={state.company}
          onSave={handleSaveCompany}
        />;
    }

    // Module Finance - Payment List
    if (activeTab.type === 'LIST' && activeTab.module === 'FINANCE') {
        let type: EntityType | undefined;
        let nature: PaymentNature | undefined;

        if (activeTab.id === 'payments_clients') { type = EntityType.CLIENT; nature = PaymentNature.PAYMENT; }
        if (activeTab.id === 'payments_suppliers') { type = EntityType.SUPPLIER; nature = PaymentNature.PAYMENT; }
        if (activeTab.id === 'refunds_clients') { type = EntityType.CLIENT; nature = PaymentNature.REFUND; }
        // REMOVED supplier refunds logic

        return <PaymentList 
            payments={state.payments} 
            partners={state.partners}
            currency={currentCurrency} 
            type={type}
            nature={nature}
            onAdd={handleAddPayment}
            onDelete={handleDeletePayment}
        />;
    }

    // Module Checks - List
    if (activeTab.type === 'LIST' && activeTab.module === 'CHECKS') {
        return <CheckList 
            payments={state.payments}
            partners={state.partners}
            currency={currentCurrency}
            onUpdateStatus={handleUpdatePaymentStatus}
        />;
    }

    // Module Expenses - List
    if (activeTab.type === 'LIST' && activeTab.module === 'EXPENSES') {
        return <ExpenseList 
          expenses={state.expenses}
          currency={currentCurrency}
          onAdd={handleAddExpense}
          onDelete={handleDeleteExpense}
        />
    }

    // Module Cash Register
    if (activeTab.type === 'LIST' && activeTab.module === 'CASH') {
        const currentSession = state.cashSessions.find(s => s.status === 'OPEN');
        return <CashRegister 
            currentSession={currentSession}
            payments={state.payments}
            sessionsHistory={state.cashSessions}
            currency={currentCurrency}
            onOpenSession={handleOpenSession}
            onCloseSession={handleCloseSession}
        />;
    }

    // Module Inventory - Form (Product Editor)
    if (activeTab.type === 'FORM' && activeTab.module === 'INVENTORY') {
      const productData = state.products.find(p => p.id === activeTab.entityId);
      return (
        <ProductEditor 
          initialData={productData}
          families={state.families}
          categories={state.categories}
          subCategories={state.subCategories}
          taxRates={state.taxRates}
          onSave={handleSaveProduct}
          onCancel={() => dispatch({ type: 'CLOSE_TAB', payload: activeTab.id })}
          currency={currentCurrency}
        />
      );
    }

    // --- REPLACED WITH GENERIC DOCUMENT LIST ---

    // Module Sales - List (Invoices)
    if (activeTab.type === 'LIST' && activeTab.module === 'SALES' && activeTab.id === 'invoices') {
      return <DocumentList 
        title="Factures Client"
        documents={state.documents}
        docType={DocType.INVOICE}
        partnerLabel="Client"
        onCreate={createInvoice}
        onEdit={handleEditDoc}
        currency={currentCurrency}
      />;
    }

    // Module Sales - List (Quotes)
    if (activeTab.type === 'LIST' && activeTab.module === 'SALES' && activeTab.id === 'quotes') {
      return <DocumentList 
        title="Devis Client"
        documents={state.documents}
        docType={DocType.QUOTE}
        partnerLabel="Client"
        onCreate={createQuote}
        onEdit={handleEditDoc}
        currency={currentCurrency}
      />;
    }

    // Module Sales - List (Delivery Notes)
    if (activeTab.type === 'LIST' && activeTab.module === 'SALES' && activeTab.id === 'delivery_notes') {
      return <DocumentList 
        title="Bons de Livraison"
        documents={state.documents}
        docType={DocType.DELIVERY_NOTE}
        partnerLabel="Client"
        onCreate={createDeliveryNote}
        onEdit={handleEditDoc}
        currency={currentCurrency}
      />;
    }

    // Module Sales - List (Credit Notes)
    if (activeTab.type === 'LIST' && activeTab.module === 'SALES' && activeTab.id === 'credit_notes') {
        return <DocumentList 
            title="Avoirs Clients"
            documents={state.documents}
            docType={DocType.CREDIT_NOTE}
            partnerLabel="Client"
            onCreate={createCreditNote}
            onEdit={handleEditDoc}
            currency={currentCurrency}
        />;
    }

    // Module Purchases - List (Invoices)
    if (activeTab.type === 'LIST' && activeTab.module === 'PURCHASES' && activeTab.id === 'purchase_invoices') {
      return <DocumentList 
            title="Factures Fournisseur"
            documents={state.documents}
            docType={DocType.PURCHASE}
            partnerLabel="Fournisseur"
            onCreate={createPurchaseInvoice}
            onEdit={handleEditDoc}
            currency={currentCurrency}
        />;
    }

    // Module Purchases - List (Orders)
    if (activeTab.type === 'LIST' && activeTab.module === 'PURCHASES' && activeTab.id === 'purchase_orders') {
        return <DocumentList 
            title="Commandes Fournisseur"
            documents={state.documents}
            docType={DocType.ORDER}
            partnerLabel="Fournisseur"
            onCreate={createPurchaseOrder}
            onEdit={handleEditDoc}
            currency={currentCurrency}
        />;
    }

    // Module Purchases - List (Credit Notes)
    if (activeTab.type === 'LIST' && activeTab.module === 'PURCHASES' && activeTab.id === 'purchase_credit_notes') {
        return <DocumentList 
            title="Avoirs Fournisseurs"
            documents={state.documents}
            docType={DocType.PURCHASE_CREDIT_NOTE}
            partnerLabel="Fournisseur"
            onCreate={createPurchaseCreditNote}
            onEdit={handleEditDoc}
            currency={currentCurrency}
        />;
      }


    // Module Sales OR Purchases - Form (Editor)
    if (activeTab.type === 'FORM' && (activeTab.module === 'SALES' || activeTab.module === 'PURCHASES')) {
      const docData = state.documents.find(d => d.id === activeTab.entityId);
      // Determine type for new docs based on ID prefix or fallback
      let type = docData?.type || DocType.INVOICE;
      
      if (!docData) {
        if (activeTab.entityId?.startsWith('new_bl')) type = DocType.DELIVERY_NOTE;
        if (activeTab.entityId?.startsWith('new_inv')) type = DocType.INVOICE;
        if (activeTab.entityId?.startsWith('new_quo')) type = DocType.QUOTE;
        if (activeTab.entityId?.startsWith('new_cn')) type = DocType.CREDIT_NOTE;
        if (activeTab.entityId?.startsWith('new_pur')) type = DocType.PURCHASE;
        if (activeTab.entityId?.startsWith('new_ord')) type = DocType.ORDER;
        if (activeTab.entityId?.startsWith('new_pcn')) type = DocType.PURCHASE_CREDIT_NOTE;
      }
      
      // Filter payments relevant to this doc (if it exists)
      const docPayments = state.payments.filter(p => p.documentId === activeTab.entityId);

      return (
        <DocumentEditor 
          docType={type}
          initialData={docData}
          partners={state.partners}
          products={state.products}
          payments={docPayments} // PASS PAYMENTS
          onSave={handleSaveDoc}
          onAddPayment={handleAddPayment} // PASS HANDLER
          onConvert={handleConvertDoc}
          onCancel={() => dispatch({ type: 'CLOSE_TAB', payload: activeTab.id })}
          currency={currentCurrency}
          company={state.company}
        />
      );
    }

    return <div className="p-10 text-center text-slate-500">Module en construction</div>;
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      
      {/* Sidebar - Odoo style */}
      <aside className="w-16 md:w-64 bg-slate-900 text-slate-300 flex flex-col transition-all flex-shrink-0 print:hidden">
        <div className="h-14 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-700">
          <LayoutGrid className="text-indigo-400 w-6 h-6 mr-0 md:mr-3" />
          <span className="font-bold text-white text-lg hidden md:block">Nexus ERP</span>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <SidebarItem icon={<Layout />} label="Tableau de bord" onClick={openDashboard} active={state.activeTabId === 'dashboard'} />
          
          <div className="px-6 py-2 text-xs font-bold text-slate-500 uppercase mt-2 hidden md:block">Commercial</div>
          <SidebarItem icon={<FileText />} label="Facture Client" onClick={openInvoices} active={state.activeTabId === 'invoices'} />
          <SidebarItem icon={<FileText />} label="Devis Client" onClick={openQuotes} active={state.activeTabId === 'quotes'} />
          <SidebarItem icon={<ClipboardList />} label="Ventes (BL)" onClick={openDeliveryNotes} active={state.activeTabId === 'delivery_notes'} />
          <SidebarItem icon={<Undo2 />} label="Avoirs Clients" onClick={openCreditNotes} active={state.activeTabId === 'credit_notes'} />
          
          <div className="px-6 py-2 text-xs font-bold text-slate-500 uppercase mt-2 hidden md:block">Achats</div>
          <SidebarItem icon={<Receipt />} label="Factures Achat" onClick={openPurchaseInvoices} active={state.activeTabId === 'purchase_invoices'} />
          <SidebarItem icon={<ShoppingBag />} label="Commandes" onClick={openPurchaseOrders} active={state.activeTabId === 'purchase_orders'} />
          <SidebarItem icon={<Undo2 />} label="Avoirs Fourn." onClick={openPurchaseCreditNotes} active={state.activeTabId === 'purchase_credit_notes'} />
          
          <div className="px-6 py-2 text-xs font-bold text-slate-500 uppercase mt-2 hidden md:block">Logistique</div>
          <SidebarItem icon={<Package />} label="Gestion des Stocks" onClick={openInventory} />
          <SidebarItem icon={<FolderTree />} label="Familles & Catégories" onClick={openCategories} />
          
          <div className="px-6 py-2 text-xs font-bold text-slate-500 uppercase mt-2 hidden md:block">Comptabilité</div>
          <SidebarItem icon={<ArrowDownLeft />} label="Règlements Clients" onClick={openClientPayments} active={state.activeTabId === 'payments_clients'} />
          <SidebarItem icon={<RotateCcw />} label="Remboursements Clients" onClick={openClientRefunds} active={state.activeTabId === 'refunds_clients'} />
          
          <SidebarItem icon={<ArrowUpRight />} label="Règlements Fourn." onClick={openSupplierPayments} active={state.activeTabId === 'payments_suppliers'} />
          {/* REMOVED SidebarItem for Supplier Refunds */}

          <SidebarItem icon={<Banknote />} label="Gestion des Chèques" onClick={openChecks} active={state.activeTabId === 'checks_mgmt'} />
          <SidebarItem icon={<TrendingDown />} label="Dépenses & Frais" onClick={openExpenses} active={state.activeTabId === 'expenses_list'} />
          <SidebarItem icon={<DollarSign />} label="Caisse & Clôture" onClick={openCashRegister} active={state.activeTabId === 'cash_register'} />
          <SidebarItem icon={<FileBarChart />} label="Relevés Clients" onClick={openClientStatements} active={state.activeTabId === 'statements_clients'} />
          <SidebarItem icon={<FileBarChart />} label="Relevés Fourn." onClick={openSupplierStatements} active={state.activeTabId === 'statements_suppliers'} />

          <div className="px-6 py-2 text-xs font-bold text-slate-500 uppercase mt-2 hidden md:block">Relations</div>
          <SidebarItem icon={<Users />} label="Clients" onClick={openClients} active={state.activeTabId === 'clients_list'} />
          <SidebarItem icon={<Truck />} label="Fournisseurs" onClick={openSuppliers} active={state.activeTabId === 'suppliers_list'} />

          <div className="px-6 py-2 text-xs font-bold text-slate-500 uppercase mt-2 hidden md:block">Configuration</div>
          <SidebarItem icon={<Building2 />} label="Société" onClick={openCompanySettings} active={state.activeTabId === 'settings_company'} />
          <SidebarItem icon={<Percent />} label="Taxes & TVA" onClick={openTaxSettings} active={state.activeTabId === 'settings_taxes'} />
          <SidebarItem icon={<Shield />} label="Utilisateurs" onClick={openUsers} active={state.activeTabId === 'users_list'} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Tab Bar */}
        <div className="h-10 bg-slate-200 border-b border-slate-300 flex items-end px-2 gap-1 overflow-x-auto no-scrollbar print:hidden">
          {state.tabs.map(tab => (
            <div 
              key={tab.id}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
              className={`
                group relative px-4 py-2 min-w-[120px] max-w-[200px] text-sm cursor-pointer select-none rounded-t-sm flex items-center justify-between border-t border-x
                ${state.activeTabId === tab.id 
                  ? 'bg-white border-slate-300 text-slate-800 font-medium z-10 -mb-[1px] pb-[9px]' 
                  : 'bg-slate-200 border-transparent text-slate-500 hover:bg-slate-300'}
              `}
            >
              <span className="truncate mr-2">{tab.title}</span>
              <button 
                onClick={(e) => { e.stopPropagation(); dispatch({ type: 'CLOSE_TAB', payload: tab.id }); }}
                className={`p-0.5 rounded-full hover:bg-slate-400/20 ${state.activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Dynamic View Area */}
        <div className="flex-1 overflow-hidden relative bg-white">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

const SidebarItem = ({ icon, label, onClick, active }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center px-4 md:px-6 py-3 hover:bg-slate-800 transition-colors ${active ? 'bg-slate-800 text-white border-r-4 border-indigo-500' : ''}`}
  >
    {React.cloneElement(icon, { size: 20 })}
    <span className="ml-3 hidden md:block">{label}</span>
  </button>
);
