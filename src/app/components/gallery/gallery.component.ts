import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model'; // Using full Event model
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

interface GalleryEventItem {
  eventInfo: string;
  images: { itemImageSrc: string, thumbnailImageSrc: string, alt: string, title: string }[];
  startDate: string; // For sorting
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  galleryEvents: GalleryEventItem[] = [];
  isLoading: boolean = true;
  private eventSubscription: Subscription = new Subscription();

  // For PrimeNG Galleria
  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];
  displayGalleria: boolean = false;
  activeIndex: number = 0;
  currentGalleriaImages: any[] = [];


  constructor(
    private eventService: EventService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadGalleryEvents();
  }

  loadGalleryEvents(): void {
    this.isLoading = true;
    this.eventSubscription.add(
      this.eventService.getGalleryEvents().subscribe({ // Uses getGalleryEvents (or getEvents if similar structure)
        next: (events) => {
          this.galleryEvents = events
            .filter(event => (event.event_main_poster_url || (event.event_photos_urls && event.event_photos_urls.length > 0))) // Only events with images
            .map(event => {
              const allImagesRaw = [];
              if (event.event_main_poster_url) {
                allImagesRaw.push({
                    itemImageSrc: event.event_main_poster_url,
                    thumbnailImageSrc: event.event_main_poster_url, // Use same for thumbnail or generate smaller ones
                    alt: `Main poster for ${event.event_title}`,
                    title: `${event.event_title} - Main Poster`
                });
              }
              if (event.event_photos_urls) {
                event.event_photos_urls.forEach((photoUrl, index) => {
                  allImagesRaw.push({
                    itemImageSrc: photoUrl,
                    thumbnailImageSrc: photoUrl,
                    alt: `Photo ${index + 1} for ${event.event_title}`,
                    title: `${event.event_title} - Photo ${index + 1}`
                  });
                });
              }
              return {
                eventInfo: `${event.event_title} organized by ${event.event_host_name} from ${this.formatDisplayDate(event.event_start_date)} to ${this.formatDisplayDate(event.event_end_date)}`,
                images: allImagesRaw,
                startDate: event.event_start_date // For sorting
              };
            })
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()); // Sort by start date ascending

          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load gallery events. ' + err.message });
          console.error(err);
        }
      })
    );
  }

  formatDisplayDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  openGalleria(images: any[], index: number = 0) {
    this.currentGalleriaImages = images;
    this.activeIndex = index;
    this.displayGalleria = true;
  }


  ngOnDestroy(): void {
    this.eventSubscription.unsubscribe();
  }
}