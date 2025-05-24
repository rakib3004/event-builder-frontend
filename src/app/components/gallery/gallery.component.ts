import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import CommonModule
import { Subscription } from 'rxjs';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { MessageService } from 'primeng/api';

// PrimeNG Modules for this component
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image'; // For p-image
import { GalleriaModule } from 'primeng/galleria';
import { ButtonModule } from 'primeng/button'; // If any buttons are used

interface GalleryEventItem {
  eventInfo: string;
  images: { itemImageSrc: string, thumbnailImageSrc: string, alt: string, title: string }[];
  startDate: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule, // For *ngIf, *ngFor, pipes
    CardModule,
    ImageModule,
    GalleriaModule,
    ButtonModule
  ],
  // providers: [DatePipe], // DatePipe is part of CommonModule
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  galleryEvents: GalleryEventItem[] = [];
  isLoading: boolean = true;
  private eventSubscription: Subscription = new Subscription();

  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 1 }
  ];
  displayGalleria: boolean = false;
  activeIndex: number = 0;
  currentGalleriaImages: any[] = []; // For p-galleria value

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
      this.eventService.getGalleryEvents().subscribe({
        next: (events) => {
          this.galleryEvents = events
            .filter(event => (event.event_main_poster_url || (event.event_photos_urls && event.event_photos_urls.length > 0)))
            .map(event => {
              const allImagesRaw = [];
              if (event.event_main_poster_url) {
                allImagesRaw.push({
                    itemImageSrc: event.event_main_poster_url,
                    thumbnailImageSrc: event.event_main_poster_url,
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
                startDate: event.event_start_date
              };
            })
            .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not load gallery events. ' + err.message });
        }
      })
    );
  }

  formatDisplayDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    // Using toLocaleDateString for simpler formatting, DatePipe could also be used if injected
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