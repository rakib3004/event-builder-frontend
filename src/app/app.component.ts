import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router'; // Import RouterOutlet and RouterLink if used
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common'; // For basic directives

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, // For <router-outlet>
    RouterModule, // For routerLink in Menubar
    MenubarModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-th-large',
        routerLink: ['/dashboard']
      },
      {
        label: 'Gallery',
        icon: 'pi pi-fw pi-images',
        routerLink: ['/gallery']
      },
    ];
  }
}