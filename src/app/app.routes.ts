import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { TimelineComponent } from './components/timeline/timeline.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, title: 'Event Dashboard' },
  { path: 'gallery', component: GalleryComponent, title: 'Event Gallery' },
  { path: 'timeline/:id', component: TimelineComponent, title: 'Event Timeline' },
  // Add other routes as needed
  { path: '**', redirectTo: '/dashboard' } // Wildcard route for a 404 or redirect
];