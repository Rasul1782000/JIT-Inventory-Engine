import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component';
import { InventoryComponent } from './pages/inventory.component';
import { PurchaseOrdersComponent } from './pages/purchase-orders.component';
import { SuppliersComponent } from './pages/suppliers.component';

export const appRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'purchase-orders', component: PurchaseOrdersComponent },
  { path: 'suppliers', component: SuppliersComponent },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
