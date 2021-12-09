import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProofPoeComponent } from './features/proofs/poe/proof-poe.component';
import { ProofPogComponent } from './features/proofs/pog/proof-pog.component';
import { HomeComponent } from './features/home/home.component';
import { InvalidLinkComponent } from './features/invalid-link/invalid-link.component';
import { SearchPageComponent } from './features/search-page/search-page.component';
import { TransactionDetailsComponent } from './features/transaction-details/transaction-details.component';
import { ProofPococComponent } from './features/proofs/pococ/proof-pococ.component';
import { ProofPocComponent } from './features/proofs/poc/proof-poc.component';
import { MaintenanceComponent } from './features/maintenance/maintenance.component';
import { VerificationScreenComponent } from './features/proof-verification/verification-screen/verification-screen.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'search/:id', component: SearchPageComponent},
  {path: 'poe/:txnhash', component: ProofPoeComponent},
  {path: 'pog/:txnhash', component: ProofPogComponent},
  {path: 'pococ/:txnhash', component: ProofPococComponent},
  {path: 'poc/:txnhash', component: ProofPocComponent},
  {path: 'txn/:txnId', component: TransactionDetailsComponent},
  {path: 'proof-verification/:txnId', component: VerificationScreenComponent},
  {path: '**', component: InvalidLinkComponent}

  // { path: '', component: MaintenanceComponent },
  // { path: '**', component: MaintenanceComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [HomeComponent];
