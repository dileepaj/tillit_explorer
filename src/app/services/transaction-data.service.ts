import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionDataService {

  constructor(private http: HttpClient) { }

  getRecentTransactions(trasactionCount: number): Observable<any> {
    return this.http.get(environment.blockchain.getRecentTransactions + 10).pipe(
      // tap(data => { console.log("Hash Data: ", JSON.stringify(data))}),
      catchError(this.handleError)
    );
  }

  getTransactions(transactionId: string): Observable<any> {
    return this.http.get(environment.blockchain.getTransactionData + transactionId).pipe(
      // tap(data => { console.log("Transaction Data: ", JSON.stringify(data))}),
      catchError(this.handleError)
    );
  }

  getTracifiedDataPackets(tdpId: string) {
    return this.http.get(environment.backend.api_backendRaw + tdpId, {
      headers: new HttpHeaders({
        'Authorization': environment.backend.backendAuth
      })
    }).pipe(
      // tap(data => { console.log("Hash Data: ", JSON.stringify(data))}),
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    console.log("Error Handler: ", err);
    return throwError(err);
  }
}
