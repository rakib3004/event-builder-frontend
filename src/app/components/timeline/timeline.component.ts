import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { MessageService } from 'primeng/api';

// PrimeNG Modules for this component
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image'; // For p-image
import { TagModule } from 'primeng/tag';   // For p-tag

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [
    CommonModule, // For *ngIf, *ngFor, pipes
    RouterModule, // For routerLink
    CardModule,
    ButtonModule,
    ImageModule,
    TagModule
  ],
  // providers: [DatePipe], // DatePipe is part of CommonModule
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit, OnDestroy {
  event: Event | null = null;
  isLoading: boolean = true;
  private routeSubscription: Subscription = new Subscription();
  private eventSubscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const eventId = params.get('id');
      if (eventId) {
        this.loadEventDetails(+eventId);
      } else {
        this.isLoading = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No event ID provided for timeline.' });
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadEventDetails(id: number): void {
    this.isLoading = true;
    this.eventSubscription.add(
      this.eventService.getEventById(id).subscribe({
        next: (data) => {
          this.event = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load event details. ' + err.message });
          this.router.navigate(['/dashboard']);
        }
      })
    );
  }

  formatDisplayDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
  }
}