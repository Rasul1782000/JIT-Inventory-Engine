import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardSummary, DraftGenerationResult, InventoryItem, ProductInput,
  ProductUpdate, PurchaseOrder, SaleInput, Supplier, SupplierInput, WindowDays,
} from './models';

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly baseUrl = '/inventory-api/api';

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard`);
  }

  getInventory(window: WindowDays): Observable<InventoryItem[]> {
    return this.http.get<InventoryItem[]>(`${this.baseUrl}/inventory`, {
      params: new HttpParams().set('window', window),
    });
  }

  createProduct(input: ProductInput): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/inventory`, input);
  }

  updateProduct(id: number, changes: ProductUpdate): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.baseUrl}/inventory/${id}`, changes);
  }

  recordSale(input: SaleInput): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(`${this.baseUrl}/sales`, input);
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.baseUrl}/suppliers`);
  }

  createSupplier(input: SupplierInput): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.baseUrl}/suppliers`, input);
  }

  getPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.baseUrl}/purchase-orders`);
  }

  generateDrafts(window: WindowDays): Observable<DraftGenerationResult> {
    return this.http.post<DraftGenerationResult>(`${this.baseUrl}/purchase-orders/drafts`, { window });
  }
}
