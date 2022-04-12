import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule, routingComponents } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AlertModule } from "ngx-bootstrap/alert";
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { SearchbarComponent } from "./shared/components/searchbar/searchbar.component";
import { DropdownComponent } from "./shared/components/dropdown/dropdown.component";
import { CardComponent } from "./features/search-page/card/card.component";
import { HttpClientModule } from "@angular/common/http";
import { LoaderComponent } from "./shared/components/loader/loader.component";
import { ProofPogComponent } from "./features/proofs/pog/proof-pog.component";
import { ProofModule } from "./features/proofs/proof.module";
import { HomeComponent } from "./features/home/home.component";
import { InvalidLinkComponent } from "./features/invalid-link/invalid-link.component";
import { SearchPageComponent } from "./features/search-page/search-page.component";
import { ProofPococComponent } from "./features/proofs/pococ/proof-pococ.component";
import { ProofPoeComponent } from "./features/proofs/poe/proof-poe.component";
import { TransactionDetailsComponent } from "./features/transaction-details/transaction-details.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ErrorIdComponent } from "./shared/components/error-id/error-id.component";
import { ClipboardModule } from "ngx-clipboard";
import { ProofPocComponent } from "./features/proofs/poc/proof-poc.component";
import { NgxPaginationModule } from "ngx-pagination";
import { CarouselModule } from "ngx-owl-carousel-o";
import { MaintenanceComponent } from "./features/maintenance/maintenance.component";
import { SiteScreenComponent } from "./features/proof-verification/components/site-screen/site-screen.component";
import { ProofBotComponent } from "./features/proof-verification/proof-bot/proof-bot.component";
import { VerificationScreenComponent } from "./features/proof-verification/verification-screen/verification-screen.component";
import { GlobalStorageComponent } from "./features/proof-verification/components/global-storage/global-storage.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { HomeSkeletonComponent } from "./features/skeleton-view/home-skeleton/home-skeleton.component";
import { ElementDividerComponent } from "./features/proof-verification/components/element-divider/element-divider.component";
import { BotHeaderComponent } from './features/proof-verification/components/bot-header/bot-header.component';
import { BotLoaderComponent } from './features/proof-verification/components/bot-loader/bot-loader.component';
import { BotGlobaldataComponent } from './features/proof-verification/components/bot-globaldata/bot-globaldata.component';
import { BotSegmentsComponent } from './features/proof-verification/components/bot-segments/bot-segments.component';

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
    MaintenanceComponent,
    SiteScreenComponent,
    ProofBotComponent,
    VerificationScreenComponent,
    GlobalStorageComponent,
    HomeSkeletonComponent,
    ElementDividerComponent,
    BotHeaderComponent,
    BotLoaderComponent,
    BotGlobaldataComponent,
    BotSegmentsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AlertModule.forRoot(),
    AppRoutingModule,
    ProofModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    BrowserAnimationsModule,
    ClipboardModule,
    CarouselModule,
    NgxPaginationModule,
    NgbModule,
    NgxSkeletonLoaderModule.forRoot({
      animation: "pulse",
      loadingText: "This item is actually loading..."
    })
  ],
  entryComponents: [SiteScreenComponent, ElementDividerComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}
