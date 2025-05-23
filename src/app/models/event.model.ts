export enum EventCategory {
  SCIENCE = "Science",
  SPORTS = "Sports",
  RELIGION = "Religion",
  HISTORY = "History",
  DEFENSE = "Defense",
  AWARENESS = "Awareness"
}

export interface Event {
  id?: number;
  event_title: string;
  event_host_name: string;
  event_start_date: string;
  event_end_date: string;
  event_category?: EventCategory | null;
  event_main_poster_url?: string | null;
  event_description?: string | null;
  total_organizer?: number | null;
  total_participant?: number | null;
  total_program?: number | null;
  event_photos_urls?: string[];
}

export interface EventListItem {
  id: number;
  event_title: string;
  event_host_name: string;
  event_start_date: string;
  event_end_date: string;
  event_category?: EventCategory | null;
  event_main_poster_url?: string | null;
  total_organizer?: number | null;
  total_participant?: number | null;
  total_program?: number | null;
}