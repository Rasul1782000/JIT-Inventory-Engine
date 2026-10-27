import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="workspace">
      <aside class="sidebar">
        <a routerLink="/dashboard" class="brand-lockup"><span class="brand-symbol"><i></i><i></i><i></i></span><span>stockroom<small>OPERATIONS</small></span></a>
        <div class="workspace-label">WORKSPACE <span>01</span></div>
        <nav class="main-nav" aria-label="Main navigation">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><span class="nav-icon dashboard-icon"><i></i><i></i><i></i><i></i></span>Overview</a>
          <a routerLink="/inventory" routerLinkActive="active"><span class="nav-icon inventory-icon"><i></i><i></i><i></i></span>Inventory</a>
          <a routerLink="/purchase-orders" routerLinkActive="active"><span class="nav-icon orders-icon">PO</span>Purchase orders</a>
          <a routerLink="/suppliers" routerLinkActive="active"><span class="nav-icon suppliers-icon"><i></i><i></i></span>Suppliers</a>
        </nav>
        <div class="sidebar-bottom"><div class="side-note"><span class="side-note-mark">↗</span><p>Good operations<br>are quiet operations.</p><span>STOCKROOM PRINCIPLE 01</span></div><div class="sidebar-footer"><span class="avatar-initials">LT</span><span><strong>Lean team</strong><small>Operations workspace</small></span><span class="footer-dots">•••</span></div></div>
      </aside>
      <div class="main-frame">
        <header class="topbar"><div class="breadcrumb"><span>Workspace</span><b>/</b><strong>Inventory operations</strong></div><div class="topbar-right"><span class="today-label"><span class="today-dot"></span> WORKSPACE LIVE</span><span class="topbar-date">{{ today | date:'EEE, MMM d' }}</span><span class="topbar-avatar">LT</span></div></header>
        <main class="content"><router-outlet></router-outlet></main>
        <footer class="page-footer"><span>STOCKROOM <b>·</b> REORDER POINT INVENTORY</span><span>Built for steady operations <i>↗</i></span></footer>
      </div>
    </div>
  `,
})
export class AppComponent {
  readonly today = new Date();
}
