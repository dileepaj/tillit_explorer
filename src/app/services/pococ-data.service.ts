import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PococDataService {

  constructor(private http: HttpClient) { }

  getPococProofData(id: string): Observable<any> {
    return this.http.get<any>(environment.blockchain.getPococData + id).pipe(
      // tap(data => { console.log("Hash Data: ", JSON.stringify(data))}),
      catchError(this.handleError)
    );
  }

  handleError(err: HttpErrorResponse) {
    console.log("Error Handler: ", err);
    return throwError('test');
  }
}
