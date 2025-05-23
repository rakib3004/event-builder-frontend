import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Required for PrimeNG animations
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // For template-driven and reactive forms

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// PrimeNG Modules (Import what you need)
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload'; // For basic file upload UI, manual handling needed for API
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ImageModule } from 'primeng/image'; // For p-image
import { GalleriaModule } from 'primeng/galleria';

// Components
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { GalleryComponent } from './components/gallery/gallery.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { EventFormComponent } from './components/event-form/event-form.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    GalleryComponent,
    TimelineComponent,
    EventFormComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MenubarModule,
    InputTextModule,
    ButtonModule,
    TableModule,
    DialogModule,
    CalendarModule,
    DropdownModule,
    TextareaModule,
    InputNumberModule,
    FileUploadModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    ImageModule,
    GalleriaModule
  ],
  providers: [MessageService, ConfirmationService], // For Toast and ConfirmDialog
  bootstrap: [AppComponent]
})
export class AppModule { }