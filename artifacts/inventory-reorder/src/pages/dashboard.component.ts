import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InventoryApiService } from '../inventory-api.service';
import { DashboardSummary, InventoryItem, PurchaseOrder, WindowDays } from '../models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DecimalPipe, RouterLink],
  template: `
    <header class="page-heading">
      <div><p class="eyebrow">OPERATIONS / OVERVIEW</p><h1>Good morning.</h1><p class="subhead">A clear read on what needs attention today.</p></div>
      <a routerLink="/inventory" class="button button-primary">Review inventory <span aria-hidden="true">↗</span></a>
    </header>
    <div *ngIf="error" class="notice notice-error"><span>{{ error }}</span><button class="text-button" (click)="load()">Try again</button></div>
    <section *ngIf="loading" class="metric-grid" aria-label="Loading summary"><div class="metric-card skeleton" *ngFor="let x of [1,2,3,4]"><div></div><div></div></div></section>
    <ng-container *ngIf="!loading && summary">
      <section class="metric-grid">
        <article class="metric-card"><span class="metric-label">Active SKUs</span><strong>{{ summary.skuCount | number }}</strong><span class="metric-foot">Across your catalog</span><span class="metric-mark">01</span></article>
        <article class="metric-card metric-accent"><span class="metric-label">Below reorder point</span><strong>{{ summary.belowReorderCount | number }}</strong><span class="metric-foot">Needs a replenishment decision</span><span class="metric-mark">02</span></article>
        <article class="metric-card"><span class="metric-label">Stock value</span><strong>{{ summary.stockValue | currency:'USD':'symbol':'1.0-0' }}</strong><span class="metric-foot">Current inventory at cost</span><span class="metric-mark">03</span></article>
        <article class="metric-card"><span class="metric-label">Open drafts</span><strong>{{ summary.openDraftCount | number }}</strong><span class="metric-foot">Purchase orders ready to review</span><span class="metric-mark">04</span></article>
      </section>
      <section class="dashboard-lower">
        <article class="panel attention-panel">
          <div class="panel-heading"><div><p class="eyebrow">REPLENISHMENT</p><h2>Items to watch</h2></div><a routerLink="/inventory" class="inline-link">All inventory <span>→</span></a></div>
          <div *ngIf="itemsLoading" class="table-loading"><div class="loading-line" *ngFor="let x of [1,2,3]"></div></div>
          <div *ngIf="!itemsLoading && !items.length" class="empty-state"><span class="empty-symbol">✓</span><strong>All clear for now</strong><p>No items are below their reorder point.</p></div>
          <div class="watch-list" *ngIf="!itemsLoading && items.length">
            <div class="watch-row" *ngFor="let item of items.slice(0,5)">
              <span class="status-dot" [class]="item.status"></span><div class="watch-name"><strong>{{ item.name }}</strong><small>{{ item.sku }} · {{ item.supplierName }}</small></div>
              <div class="watch-qty"><strong>{{ item.onHand }} <small>units</small></strong><small>Reorder at {{ item.reorderPoint }}</small></div>
              <span class="status-chip" [class]="'status-' + item.status">{{ item.status === 'critical' ? 'Critical' : 'Reorder' }}</span>
            </div>
          </div>
        </article>
        <aside class="insight-rail">
          <article class="health-card">
            <div class="health-top"><span class="eyebrow">INVENTORY HEALTH</span><span class="health-orbit">↗</span></div>
            <div class="health-score">{{ summary.inventoryHealth | number:'1.0-0' }}<span>%</span></div>
            <div class="health-meter"><span [style.width.%]="summary.inventoryHealth"></span></div>
            <p>of your catalog is comfortably stocked</p>
            <div class="health-divider"></div>
            <div class="health-stat"><span>Units sold · 30 days</span><strong>{{ summary.unitsSold30d | number }}</strong></div>
          </article>
          <article class="panel activity-panel">
            <div class="panel-heading"><div><p class="eyebrow">LATEST ACTIVITY</p><h2>Draft orders</h2></div><a routerLink="/purchase-orders" class="inline-link">View all <span>→</span></a></div>
            <div *ngIf="ordersLoading" class="table-loading"><div class="loading-line" *ngFor="let x of [1,2]"></div></div>
            <div *ngIf="!ordersLoading && !orders.length" class="compact-empty">No draft orders yet.</div>
            <div *ngFor="let order of orders.slice(0,3)" class="activity-row"><span class="activity-icon">PO</span><div><strong>{{ order.reference }}</strong><small>{{ order.supplierName }} · {{ order.itemCount }} items</small></div><b>{{ order.total | currency:'USD':'symbol':'1.0-0' }}</b></div>
          </article>
        </aside>
      </section>
    </ng-container>
  `,
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  items: InventoryItem[] = [];
  orders: PurchaseOrder[] = [];
  loading = true;
  itemsLoading = true;
  ordersLoading = true;
  error = '';
  constructor(private readonly api: InventoryApiService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = this.itemsLoading = this.ordersLoading = true;
    this.error = '';
    this.api.getDashboard().subscribe({ next: value => { this.summary = value; this.loading = false; }, error: () => { this.loading = false; this.error = 'Dashboard data could not be loaded.'; } });
    this.api.getInventory(30 as WindowDays).subscribe({ next: value => { this.items = value.filter(x => x.status !== 'healthy'); this.itemsLoading = false; }, error: () => { this.itemsLoading = false; } });
    this.api.getPurchaseOrders().subscribe({ next: value => { this.orders = value; this.ordersLoading = false; }, error: () => { this.ordersLoading = false; } });
  }
}
