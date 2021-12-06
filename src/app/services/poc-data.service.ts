import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class PocDataService {

  constructor(private http: HttpClient) { }

  getPocProofData(id: string): Observable<any> {
    console.log("Hit");
    return this.http.get(environment.blockchain.getPocData + id).pipe(
      // tap(data => { console.log("Hash Data: ", JSON.stringify(data))}),
      catchError(this.handleError)
    );
  }

  getPocTreeData(id: string): Observable<any> {
    return this.http.get(environment.blockchain.getPocTreeData + id).pipe(
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    console.log("Error Handler: ", err);
    return throwError('test');
  }
}
