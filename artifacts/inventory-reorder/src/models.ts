export type WindowDays = 30 | 60 | 90;

export interface DashboardSummary {
  skuCount: number;
  stockValue: number;
  belowReorderCount: number;
  openDraftCount: number;
  unitsSold30d: number;
  inventoryHealth: number;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  supplierId: number;
  supplierName: string;
  unitCost: number;
  onHand: number;
  leadTimeDays: number;
  safetyStockDays: number;
  averageDailySales: number;
  leadTimeDemand: number;
  safetyStock: number;
  reorderPoint: number;
  projectedDaysCover: number;
  salesWindow: number;
  status: 'healthy' | 'reorder' | 'critical';
}

export interface ProductInput {
  sku: string;
  name: string;
  category: string;
  supplierId: number;
  unitCost: number;
  onHand: number;
  safetyStockDays: number;
}

export interface ProductUpdate {
  onHand?: number;
  safetyStockDays?: number;
  supplierId?: number;
  unitCost?: number;
}

export interface Supplier {
  id: number;
  name: string;
  contactName: string | null;
  email: string | null;
  leadTimeDays: number;
  integrationStatus: 'manual' | 'connected';
}

export interface SupplierInput {
  name: string;
  contactName?: string;
  email?: string;
  leadTimeDays: number;
}

export interface PurchaseOrder {
  id: number;
  reference: string;
  supplierId: number;
  supplierName: string;
  status: 'draft' | 'submitted';
  itemCount: number;
  total: number;
  createdAt: string;
}

export interface DraftGenerationResult {
  createdCount: number;
  purchaseOrders: PurchaseOrder[];
}

export interface SaleInput {
  productId: number;
  quantity: number;
}
