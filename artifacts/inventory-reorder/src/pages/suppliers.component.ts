import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InventoryApiService } from '../inventory-api.service';
import { Supplier, SupplierInput } from '../models';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="page-heading"><div><p class="eyebrow">OPERATIONS / PARTNERS</p><h1>Suppliers</h1><p class="subhead">The people behind every replenishment.</p></div><button class="button button-primary" (click)="showForm = true">＋ <span>Add supplier</span></button></header>
    <div *ngIf="notice" class="notice notice-success"><span>{{ notice }}</span><button class="dismiss" (click)="notice = ''">×</button></div>
    <div *ngIf="error" class="notice notice-error"><span>{{ error }}</span><button class="text-button" (click)="load()">Try again</button></div>
    <section class="supplier-overview"><div><span class="eyebrow">SUPPLIER DIRECTORY</span><strong>{{ suppliers.length }}</strong><span>active partners</span></div><div class="overview-note">Lead times inform your reorder point automatically.<span class="note-rule"></span></div></section>
    <section *ngIf="loading" class="supplier-grid"><div class="supplier-card skeleton" *ngFor="let x of [1,2,3]"><div></div><div></div><div></div></div></section>
    <section *ngIf="!loading && !suppliers.length" class="empty-state supplier-empty"><span class="empty-symbol">＋</span><strong>No suppliers added</strong><p>Add your first supplier to connect products with a reliable lead time.</p><button class="button button-primary" (click)="showForm = true">Add a supplier</button></section>
    <section *ngIf="!loading && suppliers.length" class="supplier-grid">
      <article class="supplier-card" *ngFor="let supplier of suppliers">
        <div class="supplier-card-top"><div class="supplier-avatar">{{ initials(supplier.name) }}</div><span class="integration-chip" [class.connected]="supplier.integrationStatus === 'connected'"><i></i>{{ supplier.integrationStatus === 'connected' ? 'Connected' : 'Manual' }}</span></div>
        <h2>{{ supplier.name }}</h2><p class="supplier-contact">{{ supplier.contactName || 'Contact not provided' }}</p>
        <a *ngIf="supplier.email" class="supplier-email" [href]="'mailto:' + supplier.email">{{ supplier.email }}</a><span *ngIf="!supplier.email" class="supplier-email muted-copy">No email on file</span>
        <div class="supplier-card-footer"><span>Typical lead time</span><strong>{{ supplier.leadTimeDays }} <small>days</small></strong></div>
      </article>
    </section>
    <div class="modal-backdrop" *ngIf="showForm" (click)="closeForm()"><section class="modal-card modal-narrow" role="dialog" aria-modal="true" aria-labelledby="supplier-title" (click)="$event.stopPropagation()">
      <div class="modal-heading"><div><p class="eyebrow">PARTNERS / NEW RECORD</p><h2 id="supplier-title">Add a supplier</h2></div><button class="dismiss" (click)="closeForm()" aria-label="Close">×</button></div>
      <form (ngSubmit)="create()" #supplierForm="ngForm">
        <label class="field">Company name<input name="name" [(ngModel)]="draft.name" required placeholder="Supplier name"></label>
        <label class="field">Contact person <span class="optional">OPTIONAL</span><input name="contactName" [(ngModel)]="draft.contactName" placeholder="Name"></label>
        <label class="field">Email <span class="optional">OPTIONAL</span><input name="email" [(ngModel)]="draft.email" type="email" placeholder="name@company.com"></label>
        <label class="field">Lead time in days<input name="leadTimeDays" [(ngModel)]="draft.leadTimeDays" type="number" min="1" step="1" required></label>
        <p *ngIf="formError" class="form-error">{{ formError }}</p>
        <div class="modal-actions"><button class="button button-quiet" type="button" (click)="closeForm()">Cancel</button><button class="button button-primary" [disabled]="saving || !supplierForm.valid">{{ saving ? 'Saving…' : 'Save supplier' }}</button></div>
      </form>
    </section></div>
  `,
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  loading = true;
  showForm = false;
  saving = false;
  error = '';
  formError = '';
  notice = '';
  draft: SupplierInput = { name: '', contactName: '', email: '', leadTimeDays: 7 };
  constructor(private readonly api: InventoryApiService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading = true; this.error = ''; this.api.getSuppliers().subscribe({ next: data => { this.suppliers = data; this.loading = false; }, error: () => { this.loading = false; this.error = 'Supplier directory could not be loaded.'; } }); }
  initials(name: string): string { return name.split(/\s+/).slice(0, 2).map(x => x[0] || '').join('').toUpperCase(); }
  closeForm(): void { this.showForm = false; this.formError = ''; }
  create(): void {
    this.saving = true; this.formError = '';
    const input: SupplierInput = { name: this.draft.name.trim(), leadTimeDays: Number(this.draft.leadTimeDays) };
    if (this.draft.contactName?.trim()) input.contactName = this.draft.contactName.trim();
    if (this.draft.email?.trim()) input.email = this.draft.email.trim();
    this.api.createSupplier(input).subscribe({ next: () => { this.saving = false; this.closeForm(); this.draft = { name: '', contactName: '', email: '', leadTimeDays: 7 }; this.notice = 'Supplier added to your directory.'; this.load(); }, error: () => { this.saving = false; this.formError = 'Supplier could not be saved. Check the details and try again.'; } });
  }
}
