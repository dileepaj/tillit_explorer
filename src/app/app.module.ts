import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { AlertModule } from 'ngx-bootstrap';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SearchbarComponent } from './shared/components/searchbar/searchbar.component';
import { DropdownComponent } from './shared/components/dropdown/dropdown.component';
import { CardComponent } from './features/search-page/card/card.component';
import { HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { ProofPogComponent } from './features/proofs/pog/proof-pog.component';
import { ProofModule } from './features/proofs/proof.module';
import { HomeComponent } from './features/home/home.component';
import { InvalidLinkComponent } from './features/invalid-link/invalid-link.component';
import { SearchPageComponent } from './features/search-page/search-page.component';
import { ProofPococComponent } from './features/proofs/pococ/proof-pococ.component';
import { ProofPoeComponent } from './features/proofs/poe/proof-poe.component';
import { TransactionDetailsComponent } from './features/transaction-details/transaction-details.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ErrorIdComponent } from './shared/components/error-id/error-id.component';
import { ClipboardModule } from 'ngx-clipboard';
import { ProofPocComponent } from './features/proofs/poc/proof-poc.component';
import {NgxPaginationModule} from 'ngx-pagination'; 
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    SearchbarComponent,
    DropdownComponent,
    CardComponent,
    routingComponents,
    LoaderComponent,
    ProofPogComponent,
    HomeComponent,
    InvalidLinkComponent,
    SearchPageComponent,
    ProofPococComponent,
    ProofPoeComponent,
    TransactionDetailsComponent,
    ErrorIdComponent,
    ProofPocComponent,
    MaintenanceComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AlertModule.forRoot(),
    AppRoutingModule,
    ProofModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    ClipboardModule,
    CarouselModule,
    NgxPaginationModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


