import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryApiService } from '../inventory-api.service';
import { InventoryItem, ProductInput, ProductUpdate, Supplier, WindowDays } from '../models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, FormsModule],
  template: `
    <header class="page-heading">
      <div><p class="eyebrow">OPERATIONS / CATALOG</p><h1>Inventory</h1><p class="subhead">Know what is moving, what is low, and what comes next.</p></div>
      <button class="button button-primary" (click)="showCreate = true">＋ <span>Add product</span></button>
    </header>
    <div *ngIf="notice" class="notice notice-success"><span>{{ notice }}</span><button aria-label="Dismiss" class="dismiss" (click)="notice = ''">×</button></div>
    <div *ngIf="error" class="notice notice-error"><span>{{ error }}</span><button class="text-button" (click)="load()">Try again</button></div>
    <section class="inventory-toolbar">
      <label class="search-box"><span class="search-glyph">⌕</span><input type="search" [(ngModel)]="query" placeholder="Search by product, SKU or supplier" aria-label="Search inventory"></label>
      <div class="window-select" aria-label="Sales calculation window">
        <span>Sales window</span><button *ngFor="let d of [30,60,90]" [class.selected]="window === d" (click)="setWindow(d)">{{ d }}d</button>
      </div>
    </section>
    <section class="table-panel">
      <div class="table-intro"><div><strong>{{ filteredItems.length }}</strong> products <span class="table-dot">·</span> Reorder point includes lead time demand + safety stock</div><span class="updated-indicator"><i></i> Live inventory</span></div>
      <div *ngIf="loading" class="table-loading"><div class="loading-line" *ngFor="let x of [1,2,3,4,5]"></div></div>
      <div *ngIf="!loading && !filteredItems.length" class="empty-state"><span class="empty-symbol">{{ query ? '⌕' : '—' }}</span><strong>{{ query ? 'No matching products' : 'Your catalog starts here' }}</strong><p>{{ query ? 'Try a different search term.' : 'Add products to see stock cover and reorder timing.' }}</p><button *ngIf="!query" class="button button-primary" (click)="showCreate = true">Add your first product</button></div>
      <div class="table-scroll" *ngIf="!loading && filteredItems.length">
        <table class="data-table">
          <thead><tr><th>PRODUCT</th><th>ON HAND</th><th>REORDER AT</th><th>COVER</th><th>SUPPLIER</th><th>UNIT COST</th><th>STATUS</th><th><span class="sr-only">Actions</span></th></tr></thead>
          <tbody><tr *ngFor="let item of filteredItems">
            <td><div class="product-cell"><span class="product-monogram">{{ monogram(item.name) }}</span><span><strong>{{ item.name }}</strong><small>{{ item.sku }} <span *ngIf="item.category">· {{ item.category }}</span></small></span></div></td>
            <td><strong>{{ item.onHand }}</strong><small class="cell-sub">{{ item.salesWindow }}d avg {{ item.averageDailySales | number:'1.0-1' }}/day</small></td>
            <td><strong>{{ item.reorderPoint }}</strong><small class="cell-sub">LT {{ item.leadTimeDemand | number:'1.0-0' }} + SS {{ item.safetyStock | number:'1.0-0' }}</small></td>
            <td><span class="cover-value" [class.cover-low]="item.projectedDaysCover <= item.leadTimeDays">{{ item.projectedDaysCover | number:'1.0-0' }}<small> days</small></span></td>
            <td>{{ item.supplierName }}</td><td>{{ item.unitCost | currency:'USD':'symbol':'1.2-2' }}</td>
            <td><span class="status-chip" [class]="'status-' + item.status">{{ label(item.status) }}</span></td>
            <td><button class="row-action" [attr.aria-label]="'Edit ' + item.name" (click)="openEdit(item)">Edit</button></td>
          </tr></tbody>
        </table>
      </div>
    </section>
    <div class="modal-backdrop" *ngIf="showCreate" (click)="closeCreate()">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="create-title" (click)="$event.stopPropagation()">
        <div class="modal-heading"><div><p class="eyebrow">CATALOG / NEW ITEM</p><h2 id="create-title">Add a product</h2></div><button class="dismiss" (click)="closeCreate()" aria-label="Close">×</button></div>
        <form (ngSubmit)="createProduct()" #createForm="ngForm">
          <div class="form-grid">
            <label class="field field-wide">Product name<input name="name" [(ngModel)]="draft.name" required placeholder="e.g. Recycled mailer, medium"></label>
            <label class="field">SKU<input name="sku" [(ngModel)]="draft.sku" required placeholder="PKG-204"></label>
            <label class="field">Category<input name="category" [(ngModel)]="draft.category" placeholder="Packaging"></label>
            <label class="field field-wide">Supplier<select name="supplierId" [(ngModel)]="draft.supplierId" required><option [ngValue]="0" disabled>Select a supplier</option><option *ngFor="let s of suppliers" [ngValue]="s.id">{{ s.name }} · {{ s.leadTimeDays }} day lead</option></select><small *ngIf="!suppliers.length && !supplierLoading">Add a supplier before creating products.</small></label>
            <label class="field">Unit cost<input name="unitCost" type="number" min="0" step="0.01" [(ngModel)]="draft.unitCost" required></label>
            <label class="field">On hand<input name="onHand" type="number" min="0" step="1" [(ngModel)]="draft.onHand" required></label>
            <label class="field field-wide">Safety stock cover<input name="safetyStockDays" type="number" min="0" step="1" [(ngModel)]="draft.safetyStockDays" required><small>Additional days of demand held as a buffer.</small></label>
          </div>
          <p *ngIf="formError" class="form-error">{{ formError }}</p>
          <div class="modal-actions"><button type="button" class="button button-quiet" (click)="closeCreate()">Cancel</button><button class="button button-primary" [disabled]="saving || !createForm.valid || !draft.supplierId">{{ saving ? 'Saving…' : 'Save product' }}</button></div>
        </form>
      </section>
    </div>
    <div class="modal-backdrop" *ngIf="editing" (click)="editing = null">
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-title" (click)="$event.stopPropagation()">
        <div class="modal-heading"><div><p class="eyebrow">CATALOG / UPDATE ITEM</p><h2 id="edit-title">{{ editing.name }}</h2><p class="subhead compact">{{ editing.sku }} · update operational details</p></div><button class="dismiss" (click)="editing = null" aria-label="Close">×</button></div>
        <div class="form-grid">
          <label class="field">On hand<input type="number" min="0" step="1" [(ngModel)]="editOnHand"></label>
          <label class="field">Unit cost<input type="number" min="0" step="0.01" [(ngModel)]="editUnitCost"></label>
          <label class="field">Safety stock days<input type="number" min="0" step="1" [(ngModel)]="editSafety"></label>
          <label class="field">Supplier<select [(ngModel)]="editSupplier"><option *ngFor="let s of suppliers" [ngValue]="s.id">{{ s.name }}</option></select></label>
        </div>
        <div class="form-error" *ngIf="formError">{{ formError }}</div>
        <div class="modal-actions"><button class="button button-quiet" (click)="editing = null">Cancel</button><button class="button button-primary" [disabled]="saving" (click)="saveEdit()">{{ saving ? 'Saving…' : 'Save changes' }}</button></div>
        <div class="sale-box"><div><strong>Record a sale</strong><small>Reduce current on-hand stock.</small></div><div class="sale-controls"><input aria-label="Sale quantity" type="number" min="1" step="1" [(ngModel)]="saleQuantity"><button class="button button-secondary" [disabled]="saving || saleQuantity < 1" (click)="recordSale()">Record sale</button></div></div>
      </section>
    </div>
  `,
})
export class InventoryComponent implements OnInit {
  items: InventoryItem[] = [];
  suppliers: Supplier[] = [];
  window: WindowDays = 30;
  query = '';
  loading = true;
  supplierLoading = true;
  showCreate = false;
  editing: InventoryItem | null = null;
  saving = false;
  error = '';
  formError = '';
  notice = '';
  saleQuantity = 1;
  editOnHand = 0;
  editUnitCost = 0;
  editSafety = 0;
  editSupplier = 0;
  draft: ProductInput = { sku: '', name: '', category: '', supplierId: 0, unitCost: 0, onHand: 0, safetyStockDays: 7 };
  constructor(private readonly api: InventoryApiService) {}
  ngOnInit(): void { this.load(); this.api.getSuppliers().subscribe({ next: s => { this.suppliers = s; this.supplierLoading = false; }, error: () => { this.supplierLoading = false; } }); }
  get filteredItems(): InventoryItem[] { const q = this.query.trim().toLowerCase(); return this.items.filter(i => !q || [i.name, i.sku, i.supplierName, i.category].some(v => v.toLowerCase().includes(q))); }
  load(): void { this.loading = true; this.error = ''; this.api.getInventory(this.window).subscribe({ next: data => { this.items = data; this.loading = false; }, error: () => { this.loading = false; this.error = 'Inventory could not be loaded. Check the connection and retry.'; } }); }
  setWindow(days: number): void { this.window = days as WindowDays; this.load(); }
  label(status: string): string { return status === 'critical' ? 'Critical' : status === 'reorder' ? 'Reorder' : 'Healthy'; }
  monogram(name: string): string { return name.split(/\s+/).slice(0, 2).map(x => x[0] || '').join('').toUpperCase(); }
  closeCreate(): void { this.showCreate = false; this.formError = ''; }
  createProduct(): void {
    this.saving = true; this.formError = '';
    this.api.createProduct({ ...this.draft, supplierId: Number(this.draft.supplierId), unitCost: Number(this.draft.unitCost), onHand: Number(this.draft.onHand), safetyStockDays: Number(this.draft.safetyStockDays) }).subscribe({
      next: () => { this.saving = false; this.closeCreate(); this.draft = { sku: '', name: '', category: '', supplierId: 0, unitCost: 0, onHand: 0, safetyStockDays: 7 }; this.notice = 'Product added. Reorder metrics are up to date.'; this.load(); },
      error: () => { this.saving = false; this.formError = 'Product could not be saved. Please check the details and try again.'; },
    });
  }
  openEdit(item: InventoryItem): void { this.editing = item; this.editOnHand = item.onHand; this.editUnitCost = item.unitCost; this.editSafety = item.safetyStockDays; this.editSupplier = item.supplierId; this.saleQuantity = 1; this.formError = ''; }
  saveEdit(): void {
    if (!this.editing) return;
    this.saving = true; this.formError = '';
    const update: ProductUpdate = { onHand: Number(this.editOnHand), unitCost: Number(this.editUnitCost), safetyStockDays: Number(this.editSafety), supplierId: Number(this.editSupplier) };
    this.api.updateProduct(this.editing.id, update).subscribe({ next: () => { this.saving = false; this.editing = null; this.notice = 'Product updated. Reorder calculations refreshed.'; this.load(); }, error: () => { this.saving = false; this.formError = 'Changes could not be saved. Try again.'; } });
  }
  recordSale(): void {
    if (!this.editing || this.saleQuantity < 1) return;
    this.saving = true; this.formError = '';
    this.api.recordSale({ productId: this.editing.id, quantity: Number(this.saleQuantity) }).subscribe({ next: item => { this.saving = false; this.editing = item; this.editOnHand = item.onHand; this.notice = `${this.saleQuantity} units recorded as sold.`; this.load(); }, error: () => { this.saving = false; this.formError = 'Sale could not be recorded. Try again.'; } });
  }
}
