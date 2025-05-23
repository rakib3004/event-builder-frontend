import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule
import { Event, EventCategory } from '../../models/event.model';
import { EventService } from '../../services/event.service'; // Service is fine
import { MessageService } from 'primeng/api';

// PrimeNG Modules for this component
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
// ToastModule is usually global in app.component or via MessageService

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // For formGroup, formControlName
    DialogModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    TextareaModule,
    InputNumberModule,
    FileUploadModule,
    ButtonModule
    // No need to import ToastModule here if MessageService is used globally
  ],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
  // providers: [DatePipe] // If you were to use DatePipe in the template here explicitly
})
export class EventFormComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() eventToEdit: Event | null = null;
  @Input() isEditMode: boolean = false;

  @Output() formSubmitted = new EventEmitter<boolean>();
  @Output() formCancelled = new EventEmitter<void>();

  eventForm!: FormGroup;
  categories: any[];
  isLoading = false;

  selectedMainPoster: File | null = null;
  selectedEventPhotos: File[] = [];
  mainPosterPreview: string | ArrayBuffer | null = null;
  eventPhotosPreviews: (string | ArrayBuffer)[] = [];

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private messageService: MessageService // Injected, provided in app.config
  ) {
    this.categories = Object.keys(EventCategory).map(key => ({
      label: EventCategory[key as keyof typeof EventCategory],
      value: EventCategory[key as keyof typeof EventCategory]
    }));
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['eventToEdit'] && this.eventToEdit) {
      this.initForm();
      this.populateFormForEdit();
    } else if (changes['eventToEdit'] && !this.eventToEdit && this.eventForm) {
      this.resetForm();
    }
    if (changes['visible'] && !this.visible && this.eventForm) {
        this.resetFormAndFiles();
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
    }, { validators: this.dateRangeValidator });
  }

  private populateFormForEdit(): void {
    if (this.eventToEdit && this.eventForm) {
      this.eventForm.patchValue({
        event_title: this.eventToEdit.event_title,
        event_host_name: this.eventToEdit.event_host_name,
        event_start_date: this.eventToEdit.event_start_date ? new Date(this.eventToEdit.event_start_date) : null,
        event_end_date: this.eventToEdit.event_end_date ? new Date(this.eventToEdit.event_end_date) : null,
        event_category: this.eventToEdit.event_category,
        event_description: this.eventToEdit.event_description,
        total_organizer: this.eventToEdit.total_organizer,
        total_participant: this.eventToEdit.total_participant,
        total_program: this.eventToEdit.total_program
      });
      this.mainPosterPreview = this.eventToEdit.event_main_poster_url || null;
      this.eventPhotosPreviews = this.eventToEdit.event_photos_urls ? [...this.eventToEdit.event_photos_urls] : [];
    }
  }

  private resetFormAndFiles(): void {
    if (this.eventForm) this.eventForm.reset({event_category: null});
    this.selectedMainPoster = null;
    this.selectedEventPhotos = [];
    this.mainPosterPreview = null;
    this.eventPhotosPreviews = [];
  }
   private resetForm(): void { // Added this based on ngOnChanges logic
    if (this.eventForm) {
        this.eventForm.reset({
            event_category: null,
        });
    }
    this.resetFormAndFiles();
  }


  dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (control.value && !(control.value instanceof Date)) {
      return { 'invalidDate': true };
    }
    return null;
  }

  dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const startDateControl = group.controls['event_start_date'];
    const endDateControl = group.controls['event_end_date'];
    if (startDateControl.value && endDateControl.value && new Date(endDateControl.value) < new Date(startDateControl.value)) {
      endDateControl.setErrors({ 'endDateBeforeStartDate': true });
      return { 'endDateBeforeStartDate': true };
    } else {
      if(endDateControl.hasError('endDateBeforeStartDate')) {
        const errors = endDateControl.errors;
        if (errors) {
            delete errors['endDateBeforeStartDate'];
            endDateControl.setErrors(Object.keys(errors).length === 0 ? null : errors);
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
        this.mainPosterPreview = this.eventToEdit.event_main_poster_url || null;
    }
  }

  onEventPhotosSelect(event: any): void {
    this.selectedEventPhotos = [...event.files];
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
        this.eventPhotosPreviews = [...this.eventToEdit.event_photos_urls];
    }
  }

  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.' });
      Object.values(this.eventForm.controls).forEach(control => control.markAsTouched());
      return;
    }

    this.isLoading = true;
    const formValues = this.eventForm.value;
    const eventData: Event = {
      ...(this.isEditMode && this.eventToEdit ? { id: this.eventToEdit.id } : {}), // Keep ID if editing
      event_title: formValues.event_title,
      event_host_name: formValues.event_host_name,
      event_start_date: this.formatDate(formValues.event_start_date),
      event_end_date: this.formatDate(formValues.event_end_date),
      event_category: formValues.event_category || null,
      event_description: formValues.event_description || null,
      total_organizer: formValues.total_organizer !== null ? Number(formValues.total_organizer) : null,
      total_participant: formValues.total_participant !== null ? Number(formValues.total_participant) : null,
      total_program: formValues.total_program !== null ? Number(formValues.total_program) : null,
      // URLs are set by backend
    };

    // For edit, ensure all fields from eventToEdit are carried over if not in form.
    let finalEventData: Partial<Event> = eventData;
    if (this.isEditMode && this.eventToEdit) {
        finalEventData = { ...this.eventToEdit, ...eventData }; // Form values override existing
    }


    if (this.isEditMode && this.eventToEdit && this.eventToEdit.id) {
      this.eventService.updateEvent(this.eventToEdit.id, finalEventData, this.selectedMainPoster!, this.selectedEventPhotos).subscribe({
        next: () => { this.isLoading = false; this.formSubmitted.emit(true); this.resetFormAndFiles(); },
        error: (err) => { this.isLoading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not update event. ' + err.message }); this.formSubmitted.emit(false); }
      });
    } else {
      this.eventService.createEvent(eventData as Event, this.selectedMainPoster!, this.selectedEventPhotos).subscribe({
        next: () => { this.isLoading = false; this.formSubmitted.emit(true); this.resetFormAndFiles(); },
        error: (err) => { this.isLoading = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not create event. ' + err.message }); this.formSubmitted.emit(false); }
      });
    }
  }

  onCancel(): void {
    this.resetFormAndFiles();
    this.formCancelled.emit();
  }

  closeDialog() {
    this.resetFormAndFiles();
    this.formCancelled.emit();
  }
}