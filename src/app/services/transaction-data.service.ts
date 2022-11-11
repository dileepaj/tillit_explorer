import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TransactionDataService {

  constructor(private http: HttpClient) { }

  getRecentTransactions(page:number, perPage:number, NoPage:number): Observable<any> {
    let params = new HttpParams();
    params = params.append('page', String(page) );
    params = params.append('perPage', String(perPage));
    params = params.append('NoPage', String(NoPage));
    return this.http.get(environment.blockchain.getRecentTransactions,{params}).pipe(
      // tap(data => { console.log("Hash Data: ", JSON.stringify(data))}),
      catchError(this.handleError)
    );
  }

  getTransactionsCount(): Observable<any> {
    return this.http.get(environment.blockchain.getRecentTransactionsCount).pipe(
      catchError(this.handleError)
    );
  }

  getTransactions(transactionId: string, page:number, perPage:number): Observable<any> {
    let params = new HttpParams();
    params = params.append('txn', String(transactionId));
    params = params.append('page', String(page) );
    params = params.append('perPage', String(perPage));
    return this.http.get(environment.blockchain.getTransactionData,{params}).pipe(
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
