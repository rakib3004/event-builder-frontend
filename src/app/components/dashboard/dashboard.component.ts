import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, JsonPipe } from '@angular/common'; // Import CommonModule and necessary pipes
import { Router, RouterModule } from '@angular/router'; // Import RouterModule for routerLink
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { EventListItem, Event } from '../../models/event.model';
import { MessageService, ConfirmationService } from 'primeng/api';

// Import child component if it's standalone
import { EventFormComponent } from '../event-form/event-form.component';

// PrimeNG Modules for this component
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog'; // For the raw data dialog
import { TooltipModule } from 'primeng/tooltip';
import { ImageModule } from 'primeng/image'; // For p-image in table

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, // For *ngIf, *ngFor, async pipe, etc.
    RouterModule, // For routerLink used in template for "View Timeline"
    TableModule,
    ButtonModule,
    ToolbarModule,
    DialogModule,
    TooltipModule,
    ImageModule,
    EventFormComponent, // Import the standalone EventFormComponent
    JsonPipe // For the raw data dialog
  ],
  providers: [
    // DatePipe is needed if used in the template with | date.
    // If not used in template directly by this component, it's not needed here.
    // JsonPipe is imported directly in imports array now.
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  events: EventListItem[] = [];
  private eventSubscription: Subscription = new Subscription();

  currentEvent: Event | null = null;
  displayShowRawDialog: boolean = false;

  showEventForm: boolean = false;
  eventToEdit: Event | null = null;
  isEditMode: boolean = false;

  constructor(
    private eventService: EventService,
    private messageService: MessageService, // Injected
    private confirmationService: ConfirmationService, // Injected
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventSubscription.add(
      this.eventService.getEvents().subscribe({
        next: (data) => this.events = data,
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load events. ' + err.message })
      })
    );
  }

  openNewEventForm(): void {
    this.eventToEdit = null;
    this.isEditMode = false;
    this.showEventForm = true;
  }

  // Helper to format date string 'YYYY-MM-DD' for input[type=date] or Date object for p-calendar
  private formatDateForInput(dateStr: string): string { // Keep as string for consistency with form model
    if (!dateStr) return '';
    // Assuming dateStr from API is 'YYYY-MM-DD' or compatible with new Date()
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Return original if not parsable
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }


  openEditEventForm(eventItem: EventListItem): void {
    this.eventService.getEventById(eventItem.id).subscribe({
        next: (fullEvent) => {
            this.eventToEdit = { ...fullEvent };
            // Dates from API are strings like "YYYY-MM-DD"
            // EventFormComponent's p-calendar will parse these strings into Date objects
            // If EventFormComponent expects Date objects, convert here.
            // But if it takes strings and converts, this is fine.
            // Let's assume EventFormComponent handles the string date from API.
            this.isEditMode = true;
            this.showEventForm = true;
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load event details for editing. ' + err.message })
    });
  }

  onEventFormSubmitted(success: boolean): void {
    this.showEventForm = false;
    if (success) {
      this.loadEvents();
      const message = this.isEditMode ? 'Event updated successfully!' : 'Event created successfully!';
      this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
    }
    this.eventToEdit = null;
    this.isEditMode = false;
  }

  onEventFormCancelled(): void {
    this.showEventForm = false;
    this.eventToEdit = null;
    this.isEditMode = false;
  }

  showEventRawData(eventItem: EventListItem): void {
    this.eventService.getEventById(eventItem.id).subscribe({
      next: (data) => { this.currentEvent = data; this.displayShowRawDialog = true; },
      error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load event details. ' + err.message })
    });
  }

  deleteEvent(event: EventListItem): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${event.event_title}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventService.deleteEvent(event.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event deleted successfully!' });
            this.loadEvents();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete event. ' + err.message })
        });
      }
    });
  }

  viewTimeline(eventId: number): void {
    this.router.navigate(['/timeline', eventId]);
  }

  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
  }
}