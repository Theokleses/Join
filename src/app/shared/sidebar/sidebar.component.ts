import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  activeTab: string = 'home'; // Standardmäßig ist "Home" aktiv

  setActiveTab(tab: string) {
    this.activeTab = tab; // Setzt den aktiven Tab
  }
}
