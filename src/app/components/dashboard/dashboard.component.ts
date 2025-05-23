import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventService } from '../../services/event.service';
import { EventListItem, Event, EventCategory } from '../../models/event.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  events: EventListItem[] = [];
  private eventSubscription: Subscription = new Subscription();

  displayEventDialog: boolean = false;
  isEditMode: boolean = false;
  currentEvent: Event | null = null; // For showing raw data
  displayShowRawDialog: boolean = false;

  // For the form, handled by EventFormComponent
  showEventForm: boolean = false;
  eventToEdit: Event | null = null;


  constructor(
    private eventService: EventService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventSubscription.add(
      this.eventService.getEvents().subscribe({
        next: (data) => {
          this.events = data;
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load events. ' + err.message });
          console.error(err);
        }
      })
    );
  }

  openNewEventForm(): void {
    this.eventToEdit = null;
    this.isEditMode = false;
    this.showEventForm = true;
  }

  openEditEventForm(event: EventListItem): void {
    // Fetch full event details for editing
    this.eventService.getEventById(event.id).subscribe({
        next: (fullEvent) => {
            this.eventToEdit = { ...fullEvent }; // Create a copy to avoid direct mutation
             // Ensure dates are in 'yyyy-MM-dd' for the form if needed, or handle in form component
            if (this.eventToEdit.event_start_date) {
                this.eventToEdit.event_start_date = this.formatDateForInput(this.eventToEdit.event_start_date);
            }
            if (this.eventToEdit.event_end_date) {
                this.eventToEdit.event_end_date = this.formatDateForInput(this.eventToEdit.event_end_date);
            }
            this.isEditMode = true;
            this.showEventForm = true;
        },
        error: (err) => {
             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load event details for editing.' });
        }
    });
  }

  // Helper to format date string 'YYYY-MM-DD' from API to a Date object for p-calendar, or string for input[type=date]
  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }


  onEventFormSubmitted(success: boolean): void {
    this.showEventForm = false;
    if (success) {
      this.loadEvents(); // Refresh the list
      const message = this.isEditMode ? 'Event updated successfully!' : 'Event created successfully!';
      this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
    }
    this.eventToEdit = null; // Reset
    this.isEditMode = false;
  }

  onEventFormCancelled(): void {
    this.showEventForm = false;
    this.eventToEdit = null;
    this.isEditMode = false;
  }


  showEventRawData(eventItem: EventListItem): void {
    this.eventService.getEventById(eventItem.id).subscribe({
      next: (data) => {
        this.currentEvent = data;
        this.displayShowRawDialog = true;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load event details.' });
      }
    });
  }

  deleteEvent(event: EventListItem): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${event.event_title}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.eventSubscription.add(
          this.eventService.deleteEvent(event.id).subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Event deleted successfully!' });
              this.loadEvents(); // Refresh list
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not delete event. ' + err.message });
            }
          })
        );
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