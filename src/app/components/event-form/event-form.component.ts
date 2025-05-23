import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Event, EventCategory } from '../../models/event.model';
import { EventService } from '../../services/event.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() eventToEdit: Event | null = null;
  @Input() isEditMode: boolean = false;

  @Output() formSubmitted = new EventEmitter<boolean>();
  @Output() formCancelled = new EventEmitter<void>();

  eventForm!: FormGroup;
  categories: any[]; // For dropdown
  isLoading = false;

  selectedMainPoster: File | null = null;
  selectedEventPhotos: File[] = [];
  mainPosterPreview: string | ArrayBuffer | null = null;
  eventPhotosPreviews: (string | ArrayBuffer)[] = [];


  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private messageService: MessageService
  ) {
    this.categories = Object.keys(EventCategory).map(key => ({
      label: EventCategory[key as keyof typeof EventCategory],
      value: EventCategory[key as keyof typeof EventCategory]
    }));
  }

  ngOnInit(): void {
    this.initForm();
  }

  // To react to changes in input properties (e.g., when eventToEdit is set)
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventToEdit'] && this.eventToEdit) {
      this.initForm(); // Re-initialize form if eventToEdit changes
      this.populateFormForEdit();
    } else if (changes['eventToEdit'] && !this.eventToEdit && this.eventForm) {
      // If eventToEdit becomes null (e.g., closing edit and opening create)
      this.resetForm();
    }
    if (changes['visible'] && !this.visible && this.eventForm) {
        this.resetFormAndFiles(); // Reset when dialog is hidden
    }
  }


  private initForm(): void {
    this.eventForm = this.fb.group({
      event_title: ['', Validators.required],
      event_host_name: ['', Validators.required],
      event_start_date: [null, [Validators.required, this.dateValidator]],
      event_end_date: [null, [Validators.required, this.dateValidator]],
      event_category: [null],
      event_description: [''],
      total_organizer: [null, [Validators.min(0)]],
      total_participant: [null, [Validators.min(0)]],
      total_program: [null, [Validators.min(0)]],
      // File inputs are handled separately, not directly in form group for value
    }, { validators: this.dateRangeValidator });
  }

  private populateFormForEdit(): void {
    if (this.eventToEdit && this.eventForm) {
      this.eventForm.patchValue({
        event_title: this.eventToEdit.event_title,
        event_host_name: this.eventToEdit.event_host_name,
        event_start_date: this.eventToEdit.event_start_date ? new Date(this.eventToEdit.event_start_date) : null, // Convert to Date for p-calendar
        event_end_date: this.eventToEdit.event_end_date ? new Date(this.eventToEdit.event_end_date) : null, // Convert to Date for p-calendar
        event_category: this.eventToEdit.event_category,
        event_description: this.eventToEdit.event_description,
        total_organizer: this.eventToEdit.total_organizer,
        total_participant: this.eventToEdit.total_participant,
        total_program: this.eventToEdit.total_program
      });
      // For existing images, you might want to show them (not implemented here for simplicity of edit)
      this.mainPosterPreview = this.eventToEdit.event_main_poster_url || null;
      this.eventPhotosPreviews = this.eventToEdit.event_photos_urls ? [...this.eventToEdit.event_photos_urls] : [];

    }
  }

  private resetForm(): void {
    if (this.eventForm) {
        this.eventForm.reset({
            event_category: null, // ensure dropdown resets correctly
            // Set other defaults if needed
        });
    }
    this.resetFormAndFiles();
  }

  private resetFormAndFiles(): void {
    if (this.eventForm) this.eventForm.reset();
    this.selectedMainPoster = null;
    this.selectedEventPhotos = [];
    this.mainPosterPreview = null;
    this.eventPhotosPreviews = [];
    // If you have p-fileUpload components, you might need to call their clear() method
  }

  // Custom validator for date format (optional, p-calendar handles much of this)
  dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value && !(control.value instanceof Date)) {
      return { 'invalidDate': true };
    }
    return null;
  }

  // Custom validator for end date >= start date
  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const startDateControl = group.controls['event_start_date'];
    const endDateControl = group.controls['event_end_date'];

    if (startDateControl.value && endDateControl.value && endDateControl.value < startDateControl.value) {
      endDateControl.setErrors({ 'endDateBeforeStartDate': true });
      return { 'endDateBeforeStartDate': true };
    } else {
      if(endDateControl.hasError('endDateBeforeStartDate')) {
        // Clear only this specific error if valid now
        const errors = endDateControl.errors;
        if (errors) {
            delete errors['endDateBeforeStartDate'];
            if (Object.keys(errors).length === 0) {
                 endDateControl.setErrors(null);
            } else {
                 endDateControl.setErrors(errors);
            }
        }
      }
    }
    return null;
  }

  onMainPosterSelect(event: any): void {
    const file = event.files[0];
    if (file) {
      this.selectedMainPoster = file;
      const reader = new FileReader();
      reader.onload = (e) => this.mainPosterPreview = e.target?.result || null;
      reader.readAsDataURL(file);
    }
  }
  onMainPosterClear(): void {
    this.selectedMainPoster = null;
    this.mainPosterPreview = null;
    if (this.isEditMode && this.eventToEdit) {
        this.mainPosterPreview = this.eventToEdit.event_main_poster_url || null; // Revert to original if editing
    }
  }


  onEventPhotosSelect(event: any): void {
    this.selectedEventPhotos = [...event.files]; // Make a new array
    this.eventPhotosPreviews = [];
    this.selectedEventPhotos.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => this.eventPhotosPreviews.push(e.target?.result!);
      reader.readAsDataURL(file);
    });
  }
  onEventPhotosClear(): void {
    this.selectedEventPhotos = [];
    this.eventPhotosPreviews = [];
     if (this.isEditMode && this.eventToEdit && this.eventToEdit.event_photos_urls) {
        this.eventPhotosPreviews = [...this.eventToEdit.event_photos_urls]; // Revert
    }
  }

  // Helper to format Date object to 'YYYY-MM-DD' string for API
  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    if (typeof date === 'string') { // If already a string, assume correct or parse if needed
        const d = new Date(date);
        if (isNaN(d.getTime())) return ''; // Invalid date string
         return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
    }
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
  }


  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.' });
      // Mark all fields as touched to display errors
      Object.values(this.eventForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    const formValues = this.eventForm.value;

    const eventData: Event = {
      ...this.eventToEdit, // Spread existing data if in edit mode
      event_title: formValues.event_title,
      event_host_name: formValues.event_host_name,
      event_start_date: this.formatDate(formValues.event_start_date),
      event_end_date: this.formatDate(formValues.event_end_date),
      event_category: formValues.event_category || null,
      event_description: formValues.event_description || null,
      total_organizer: formValues.total_organizer !== null ? Number(formValues.total_organizer) : null,
      total_participant: formValues.total_participant !== null ? Number(formValues.total_participant) : null,
      total_program: formValues.total_program !== null ? Number(formValues.total_program) : null,
      // event_main_poster_url and event_photos_urls are handled by the backend based on uploaded files
    };

    if (this.isEditMode && this.eventToEdit && this.eventToEdit.id) {
      // Update Event
      this.eventService.updateEvent(this.eventToEdit.id, eventData, this.selectedMainPoster!, this.selectedEventPhotos).subscribe({
        next: () => {
          this.isLoading = false;
          this.formSubmitted.emit(true);
          this.resetFormAndFiles();
        },
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not update event. ' + err.message });
          this.formSubmitted.emit(false);
        }
      });
    } else {
      // Create Event
      this.eventService.createEvent(eventData, this.selectedMainPoster!, this.selectedEventPhotos).subscribe({
        next: () => {
          this.isLoading = false;
          this.formSubmitted.emit(true);
          this.resetFormAndFiles();
        },
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not create event. ' + err.message });
          this.formSubmitted.emit(false);
        }
      });
    }
  }

  onCancel(): void {
    this.resetFormAndFiles();
    this.formCancelled.emit();
  }

  closeDialog() {
    this.resetFormAndFiles();
    this.formCancelled.emit(); // Treat as cancel if dialog is closed directly
  }
}