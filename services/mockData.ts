
import { AppState, DocType, EntityType, Status, Role, PaymentMethod, PaymentNature } from '../types';

export const INITIAL_STATE: AppState = {
  activeTabId: 'dashboard',
  tabs: [{ id: 'dashboard', title: 'Tableau de bord', type: 'DASHBOARD', module: 'SALES' }],
  company: {
    name: 'Ma Société SAS',
    address: '10 Rue de l\'Innovation',
    zip: '75001',
    city: 'Paris',
    country: 'France',
    phone: '01 23 45 67 89',
    email: 'contact@masociete.com',
    website: 'www.masociete.com',
    siret: '800 123 456 00012',
    vatNumber: 'FR 12 800123456',
    currency: 'EUR'
  },
  partners: [
    { 
      id: 'p1', name: 'Acme Corp', type: EntityType.CLIENT, email: 'contact@acme.com', phone: '01 02 03 04 05', 
      address: '123 Tech Blvd', zip: '75010', city: 'Paris', country: 'France', taxId: 'FR9999999', initialBalance: 0
    },
    { 
      id: 'p2', name: 'Global Supplies', type: EntityType.SUPPLIER, email: 'sales@global.com', phone: '01 99 88 77 66', 
      address: '456 Warehouse Way', zip: '69002', city: 'Lyon', country: 'France', taxId: 'FR8888888', initialBalance: 0
    },
    { 
      id: 'p3', name: 'Jean Dupont', type: EntityType.CLIENT, email: 'jean@dupont.com', phone: '06 12 34 56 78', 
      address: '789 Residential St', zip: '13001', city: 'Marseille', country: 'France', taxId: '', initialBalance: 150.00
    },
  ],
  families: [
    { id: 'fam1', name: 'Matériel Informatique' },
    { id: 'fam2', name: 'Mobilier de Bureau' },
  ],
  categories: [
    { id: 'cat1', familyId: 'fam1', name: 'Ordinateurs' },
    { id: 'cat2', familyId: 'fam1', name: 'Périphériques' },
    { id: 'cat3', familyId: 'fam2', name: 'Assises' },
    { id: 'cat4', familyId: 'fam2', name: 'Bureaux' },
  ],
  subCategories: [
    { id: 'sub1', categoryId: 'cat1', name: 'PC Portables' },
    { id: 'sub2', categoryId: 'cat1', name: 'Stations de travail' },
    { id: 'sub3', categoryId: 'cat2', name: 'Souris & Claviers' },
    { id: 'sub4', categoryId: 'cat3', name: 'Chaises Ergonomiques' },
  ],
  taxRates: [
    { id: 't1', name: 'TVA Standard', rate: 20 },
    { id: 't2', name: 'TVA Intermédiaire', rate: 10 },
    { id: 't3', name: 'TVA Réduite', rate: 5.5 },
    { id: 't4', name: 'Exonéré', rate: 0 },
  ],
  products: [
    { 
      id: 'prod1', sku: 'LAP-001', name: 'Laptop Pro X1', price: 1200, cost: 800, stock: 15, minStock: 5, taxRate: 20,
      categoryLabel: 'Ordinateurs > PC Portables',
      familyId: 'fam1', categoryId: 'cat1', subCategoryId: 'sub1'
    },
    { 
      id: 'prod2', sku: 'MOU-002', name: 'Souris Sans Fil', price: 25, cost: 10, stock: 50, minStock: 10, taxRate: 20,
      categoryLabel: 'Périphériques > Souris',
      familyId: 'fam1', categoryId: 'cat2', subCategoryId: 'sub3'
    },
    { 
      id: 'prod3', sku: 'DESK-003', name: 'Bureau Assis-Debout', price: 350, cost: 200, stock: 2, minStock: 3, taxRate: 20,
      categoryLabel: 'Bureaux',
      familyId: 'fam2', categoryId: 'cat4'
    },
  ],
  users: [
    { id: 'u1', name: 'Administrateur', email: 'admin@nexus.com', role: Role.ADMIN, active: true },
    { id: 'u2', name: 'Sarah Vente', email: 'sarah@nexus.com', role: Role.SALES, active: true },
    { id: 'u3', name: 'Marc Stock', email: 'marc@nexus.com', role: Role.STOCK, active: true },
  ],
  documents: [
    {
      id: 'doc1', reference: 'FAC-2023-001', type: DocType.INVOICE, partnerId: 'p1', partnerName: 'Acme Corp', date: '2023-10-15', status: Status.UNPAID,
      items: [{ 
        id: 'l1', productId: 'prod1', productName: 'Laptop Pro X1', quantity: 1, unitPrice: 1200, 
        taxRate: 20, discount: 0, totalHT: 1200, totalTTC: 1440 
      }],
      totalHT: 1200, tax: 240, totalTTC: 1440
    },
    {
      id: 'doc2', reference: 'DEV-2023-045', type: DocType.QUOTE, partnerId: 'p3', partnerName: 'Jean Dupont', date: '2023-10-18', status: Status.DRAFT,
      items: [{ 
        id: 'l2', productId: 'prod2', productName: 'Souris Sans Fil', quantity: 2, unitPrice: 25, 
        taxRate: 20, discount: 0, totalHT: 50, totalTTC: 60 
      }],
      totalHT: 50, tax: 10, totalTTC: 60
    },
    {
      id: 'doc3', reference: 'BL-2023-009', type: DocType.DELIVERY_NOTE, partnerId: 'p1', partnerName: 'Acme Corp', date: '2023-10-20', status: Status.VALIDATED,
      items: [{ 
        id: 'l3', productId: 'prod1', productName: 'Laptop Pro X1', quantity: 1, unitPrice: 1200, 
        taxRate: 20, discount: 0, totalHT: 1200, totalTTC: 1440 
      }],
      totalHT: 1200, tax: 240, totalTTC: 1440
    },
    {
      id: 'doc4', reference: 'ACH-2023-888', type: DocType.PURCHASE, partnerId: 'p2', partnerName: 'Global Supplies', date: '2023-10-05', status: Status.PAID,
      items: [{ 
        id: 'l4', productId: 'prod2', productName: 'Souris Sans Fil', quantity: 100, unitPrice: 10, 
        taxRate: 20, discount: 0, totalHT: 1000, totalTTC: 1200 
      }],
      totalHT: 1000, tax: 200, totalTTC: 1200
    },
    {
      id: 'doc5', reference: 'AV-2023-001', type: DocType.CREDIT_NOTE, partnerId: 'p1', partnerName: 'Acme Corp', date: '2023-10-22', status: Status.PAID,
      items: [{ 
        id: 'l5', productId: 'prod1', productName: 'Laptop Pro X1', quantity: 1, unitPrice: 1200, 
        taxRate: 20, discount: 0, totalHT: 1200, totalTTC: 1440 
      }],
      totalHT: 1200, tax: 240, totalTTC: 1440
    }
  ],
  payments: [],
  expenses: [
      { id: 'exp1', date: '2023-10-01', category: 'Loyer', description: 'Loyer Bureau Octobre', amount: 800, method: PaymentMethod.TRANSFER, reference: 'VIR-LOYER' },
      { id: 'exp2', date: '2023-10-10', category: 'Electricité', description: 'Facture STEG', amount: 150, method: PaymentMethod.CASH, reference: '' },
  ],
  cashSessions: []
};
