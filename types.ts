
export enum EntityType {
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER'
}

export enum DocType {
  QUOTE = 'QUOTE',
  INVOICE = 'INVOICE',
  ORDER = 'ORDER',
  PURCHASE = 'PURCHASE',
  DELIVERY_NOTE = 'DELIVERY_NOTE',
  CREDIT_NOTE = 'CREDIT_NOTE', // Avoir Client
  PURCHASE_CREDIT_NOTE = 'PURCHASE_CREDIT_NOTE' // Avoir Fournisseur
}

export enum Status {
  DRAFT = 'Brouillon',
  VALIDATED = 'Validé',
  UNPAID = 'Impayé', // Nouveau statut explicite
  PAID = 'Payé',
  CANCELLED = 'Annulé'
}

export enum Role {
  ADMIN = 'Administrateur',
  SALES = 'Commercial',
  STOCK = 'Responsable Stock',
  PURCHASES = 'Acheteur'
}

export enum PaymentMethod {
  CASH = 'Espèces',
  CHECK = 'Chèque',
  TRANSFER = 'Virement',
  CARD = 'Carte Bancaire'
}

export enum PaymentStatus {
  PENDING = 'En attente',
  CLEARED = 'Encaissé',
  REJECTED = 'Rejeté'
}

export enum PaymentNature {
  PAYMENT = 'PAYMENT', // Encaissement (Client) ou Décaissement (Frs)
  REFUND = 'REFUND'    // Remboursement (Sortie pour Client, Entrée pour Frs)
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: EntityType;
  address: string;
  zip: string;
  city: string;
  country: string;
  taxId?: string; // Matricule Fiscal
  initialBalance?: number; // Solde de départ
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  nature: PaymentNature; // Nature de l'opération
  reference: string; // Numéro de chèque ou virement
  partnerId: string;
  documentId?: string; // Lien optionnel vers un document spécifique
  note?: string;
  dueDate?: string; // Date d'échéance (Spécifique aux chèques)
  status?: PaymentStatus; // Statut du règlement (En attente, Encaissé...)
}

export interface Expense {
  id: string;
  date: string;
  category: string; // Loyer, Salaires, Transport, etc.
  description: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
}

export interface CashSession {
  id: string;
  openedAt: string; // ISO String datetime
  closedAt?: string; // ISO String datetime
  openingBalance: number; // Fond de caisse
  closingBalance?: number; // Solde Théorique calculé
  actualBalance?: number; // Solde Réel compté
  difference?: number; // Ecart
  status: 'OPEN' | 'CLOSED';
  totalIn: number; // Total Espèces entrées
  totalOut: number; // Total Espèces sorties
}

export interface ProductFamily {
  id: string;
  name: string;
}

export interface ProductCategory {
  id: string;
  familyId: string;
  name: string;
}

export interface ProductSubCategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  taxRate: number; // Taux de TVA en %
  // Hierarchie
  familyId?: string;
  categoryId?: string;
  subCategoryId?: string;
  // Display label (concaténé ou nom de la catégorie principale)
  categoryLabel: string; 
}

export interface LineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // P.U. HT
  taxRate: number; // TVA %
  discount: number; // Remise %
  totalHT: number; // Total HT après remise
  totalTTC: number; // Total TTC ligne
}

export interface Document {
  id: string;
  reference: string;
  type: DocType;
  partnerId: string;
  partnerName: string;
  date: string;
  status: Status;
  items: LineItem[];
  totalHT: number;
  tax: number;
  totalTTC: number;
}

export interface CompanySettings {
  name: string;
  address: string;
  zip: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  siret: string;
  vatNumber: string; // Numéro TVA Intra
  currency: string;
  logoUrl?: string;
}

export interface TabData {
  id: string;
  title: string;
  type: 'DASHBOARD' | 'LIST' | 'FORM' | 'CONFIG';
  module: 'SALES' | 'PURCHASES' | 'INVENTORY' | 'PARTNERS' | 'SETTINGS' | 'COMPANY' | 'USERS' | 'FINANCE' | 'CHECKS' | 'CASH' | 'EXPENSES';
  entityId?: string; // For editing
  initialTab?: string; // Optional: specific tab to open within a module (e.g. 'STATEMENT')
  startDate?: string; // Optional: start date filter passed to form
  endDate?: string; // Optional: end date filter passed to form
}

export interface AppState {
  company: CompanySettings;
  partners: Partner[];
  products: Product[];
  documents: Document[];
  payments: Payment[];
  expenses: Expense[];
  cashSessions: CashSession[]; // Historique de caisse
  families: ProductFamily[];
  categories: ProductCategory[];
  subCategories: ProductSubCategory[];
  taxRates: TaxRate[];
  users: User[];
  tabs: TabData[];
  activeTabId: string;
}
