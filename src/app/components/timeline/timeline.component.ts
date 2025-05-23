import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-timeline',
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
        this.router.navigate(['/dashboard']); // Redirect if no ID
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
          console.error(err);
          this.router.navigate(['/dashboard']); // Redirect if event not found or error
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
    this.router.navigate(['/dashboard']); // Or history.back() if appropriate
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.eventSubscription.unsubscribe();
  }
}