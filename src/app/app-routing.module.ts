import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { VerificationScreenComponent } from "./features/proof-verification/verification-screen/verification-screen.component";

const routes: Routes = [
  { path: "", component: VerificationScreenComponent }

  // { path: '', component: MaintenanceComponent },
  // { path: '**', component: MaintenanceComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
export const routingComponents = [];

//http://localhost:5006/?type=poe&txn=7fbec1205d1a1d7f7d119a0fdff072cd3f50320fa09293313b3f9d34969bec23