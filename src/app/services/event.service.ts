import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Event, EventListItem } from '../models/event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }

  // Helper to create FormData
  private createEventFormData(event: Event, mainPoster?: File, eventPhotos?: File[]): FormData {
    const formData = new FormData();

    // Append mandatory fields
    formData.append('event_title', event.event_title);
    formData.append('event_host_name', event.event_host_name);
    formData.append('event_start_date', event.event_start_date);
    formData.append('event_end_date', event.event_end_date);

    // Append optional fields if they exist
    if (event.event_category) {
      formData.append('event_category', event.event_category);
    }
    if (event.event_description) {
      formData.append('event_description', event.event_description);
    }
    if (event.total_organizer !== null && event.total_organizer !== undefined) {
      formData.append('total_organizer', event.total_organizer.toString());
    }
    if (event.total_participant !== null && event.total_participant !== undefined) {
      formData.append('total_participant', event.total_participant.toString());
    }
    if (event.total_program !== null && event.total_program !== undefined) {
      formData.append('total_program', event.total_program.toString());
    }

    if (mainPoster) {
      formData.append('event_main_poster', mainPoster, mainPoster.name);
    }
    if (eventPhotos && eventPhotos.length > 0) {
      eventPhotos.forEach(photo => {
        formData.append('event_photos', photo, photo.name);
      });
    }
    return formData;
  }


  getEvents(): Observable<EventListItem[]> {
    return this.http.get<EventListItem[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  createEvent(event: Event, mainPoster?: File, eventPhotos?: File[]): Observable<Event> {
    const formData = this.createEventFormData(event, mainPoster, eventPhotos);
    return this.http.post<Event>(this.apiUrl, formData) // No specific headers needed for FormData with HttpClient
      .pipe(catchError(this.handleError));
  }

  updateEvent(id: number, event: Partial<Event>, mainPoster?: File, eventPhotos?: File[]): Observable<Event> {
    const formData = new FormData(); // Use FormData for updates involving files

    // Append fields that are present in the event object
    Object.keys(event).forEach(key => {
        const value = event[key as keyof Partial<Event>];
        if (value !== null && value !== undefined) {
            if (key === 'event_start_date' || key === 'event_end_date') {
                 formData.append(key, value as string); // Dates are strings
            } else if (typeof value === 'number') {
                 formData.append(key, value.toString());
            } else if (typeof value === 'string') {
                 formData.append(key, value);
            }
            // Note: event_photos_urls is not directly updated here, it's handled by uploading new event_photos
        }
    });


    if (mainPoster) {
      formData.append('event_main_poster', mainPoster, mainPoster.name);
    }
    if (eventPhotos && eventPhotos.length > 0) {
      eventPhotos.forEach(photo => {
        formData.append('event_photos', photo, photo.name);
      });
    }
    return this.http.put<Event>(`${this.apiUrl}/${id}`, formData)
      .pipe(catchError(this.handleError));
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // For Gallery and Timeline data fetching (might be same as getEvents or getEventById)
  getGalleryEvents(): Observable<Event[]> { // Assuming gallery uses full event details
    return this.http.get<Event[]>(`${this.apiUrl}/gallery/all`) // Assuming a dedicated endpoint or re-use
      .pipe(catchError(this.handleError));
  }


  private handleError(error: any) {
    console.error('API Error: ', error);
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.detail) {
        errorMessage += `\nDetail: ${error.error.detail}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}