import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class VerificationServiceService {
  constructor(private http: HttpClient) {}
  loadPage(url: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        Accept: "text/html, application/xhtml+xml, */*",
        "Content-Type": "application/x-www-form-urlencoded"
      }),
      responseType: "text" as "json"
    };
    return this.http.get(url, httpOptions).pipe(catchError(this.handleError));
  }

  handleError(err: HttpErrorResponse) {
    //console.log("Error Handler: ", err);
    return throwError("test");
  }
}
