import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule, routingComponents } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AlertModule } from "ngx-bootstrap/alert";
import { DropdownComponent } from "./shared/components/dropdown/dropdown.component";
import { HttpClientModule } from "@angular/common/http";
import { LoaderComponent } from "./shared/components/loader/loader.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ErrorIdComponent } from "./shared/components/error-id/error-id.component";
import { ClipboardModule } from "ngx-clipboard";
import { NgxPaginationModule } from "ngx-pagination";
import { CarouselModule } from "ngx-owl-carousel-o";
import { SiteScreenComponent } from "./features/proof-verification/components/site-screen/site-screen.component";
import { ProofBotComponent } from "./features/proof-verification/proof-bot/proof-bot.component";
import { VerificationScreenComponent } from "./features/proof-verification/verification-screen/verification-screen.component";
import { GlobalStorageComponent } from "./features/proof-verification/components/global-storage/global-storage.component";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { ElementDividerComponent } from "./features/proof-verification/components/element-divider/element-divider.component";
import { BotHeaderComponent } from './features/proof-verification/components/bot-header/bot-header.component';
import { BotLoaderComponent } from './features/proof-verification/components/bot-loader/bot-loader.component';
import { BotGlobaldataComponent } from './features/proof-verification/components/bot-globaldata/bot-globaldata.component';
import { BotSegmentsComponent } from './features/proof-verification/components/bot-segments/bot-segments.component';

@NgModule({
  declarations: [
    AppComponent,
    DropdownComponent,
    routingComponents,
    LoaderComponent,
    ErrorIdComponent,
    SiteScreenComponent,
    ProofBotComponent,
    VerificationScreenComponent,
    GlobalStorageComponent,
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
