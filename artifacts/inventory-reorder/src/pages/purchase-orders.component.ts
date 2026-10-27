import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryApiService } from '../inventory-api.service';
import { PurchaseOrder, WindowDays } from '../models';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, FormsModule],
  template: `
    <header class="page-heading"><div><p class="eyebrow">OPERATIONS / REPLENISHMENT</p><h1>Purchase orders</h1><p class="subhead">Drafts grouped by supplier, ready for a final review.</p></div><button class="button button-primary" (click)="generate()" [disabled]="generating">{{ generating ? 'Scanning inventory…' : '↻ Generate drafts' }}</button></header>
    <div *ngIf="notice" class="notice notice-success"><span>{{ notice }}</span><button class="dismiss" (click)="notice = ''">×</button></div>
    <div *ngIf="error" class="notice notice-error"><span>{{ error }}</span><button class="text-button" (click)="load()">Try again</button></div>
    <section class="po-hero">
      <div class="po-hero-copy"><p class="eyebrow">REORDER SCAN</p><h2>Find what is ready<br>to replenish.</h2><p>Choose the sales window used to calculate demand and reorder points.</p><div class="po-windows"><button *ngFor="let d of [30,60,90]" [class.selected]="window === d" (click)="setWindow(d)">{{ d }} days</button></div></div>
      <div class="po-hero-mark"><div class="scan-ring ring-one"></div><div class="scan-ring ring-two"></div><div class="scan-center"><span>SCAN</span><strong>{{ window }}</strong><small>DAY WINDOW</small></div><span class="scan-tick tick-a"></span><span class="scan-tick tick-b"></span><span class="scan-tick tick-c"></span></div>
    </section>
    <section class="po-stats"><div><span class="eyebrow">TOTAL DRAFTS</span><strong>{{ orders.length }}</strong></div><div><span class="eyebrow">ITEMS TO REPLENISH</span><strong>{{ itemCount }}</strong></div><div><span class="eyebrow">DRAFT VALUE</span><strong>{{ total | currency:'USD':'symbol':'1.0-0' }}</strong></div><div class="po-help"><span class="po-help-mark">i</span><span>Generating creates supplier-grouped drafts from items below their reorder point. It never submits an order.</span></div></section>
    <section class="table-panel po-table-panel">
      <div class="table-intro"><div><strong>Order history</strong><span class="table-dot">·</span> Drafts and submitted orders</div><span class="updated-indicator"><i></i> {{ orders.length }} records</span></div>
      <div *ngIf="loading" class="table-loading"><div class="loading-line" *ngFor="let x of [1,2,3,4]"></div></div>
      <div *ngIf="!loading && !orders.length" class="empty-state"><span class="empty-symbol">—</span><strong>No purchase orders yet</strong><p>Run a reorder scan to create the first supplier drafts.</p><button class="button button-primary" (click)="generate()" [disabled]="generating">{{ generating ? 'Scanning…' : 'Generate drafts' }}</button></div>
      <div class="table-scroll" *ngIf="!loading && orders.length"><table class="data-table">
        <thead><tr><th>REFERENCE</th><th>SUPPLIER</th><th>CREATED</th><th>ITEMS</th><th>ORDER VALUE</th><th>STATUS</th></tr></thead>
        <tbody><tr *ngFor="let order of orders"><td><strong class="mono">{{ order.reference }}</strong></td><td>{{ order.supplierName }}</td><td>{{ order.createdAt | date:'MMM d, y' }}</td><td>{{ order.itemCount }} <small class="cell-sub inline-sub">items</small></td><td><strong>{{ order.total | currency:'USD':'symbol':'1.2-2' }}</strong></td><td><span class="status-chip" [class]="order.status === 'draft' ? 'status-draft' : 'status-submitted'">{{ order.status === 'draft' ? 'Draft' : 'Submitted' }}</span></td></tr></tbody>
      </table></div>
    </section>
  `,
})
export class PurchaseOrdersComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  loading = true;
  generating = false;
  window: WindowDays = 30;
  error = '';
  notice = '';
  constructor(private readonly api: InventoryApiService) {}
  get itemCount(): number { return this.orders.reduce((sum, po) => sum + po.itemCount, 0); }
  get total(): number { return this.orders.reduce((sum, po) => sum + po.total, 0); }
  setWindow(value: number): void { if (value === 30 || value === 60 || value === 90) this.window = value; }
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.error = ''; this.api.getPurchaseOrders().subscribe({ next: data => { this.orders = data; this.loading = false; }, error: () => { this.loading = false; this.error = 'Purchase orders could not be loaded.'; } }); }
  generate(): void {
    this.generating = true; this.error = ''; this.notice = '';
    this.api.generateDrafts(this.window).subscribe({
      next: result => { this.generating = false; this.notice = result.createdCount ? `${result.createdCount} draft ${result.createdCount === 1 ? 'order' : 'orders'} created for review.` : 'No new drafts needed. Everything is above its reorder point.'; this.load(); },
      error: () => { this.generating = false; this.error = 'Drafts could not be generated. Please try again.'; },
    });
  }
}
