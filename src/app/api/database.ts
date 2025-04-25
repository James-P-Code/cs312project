import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class Database {
  readonly apiURL: string =
    'https://cs.colostate.edu:4444/~c837426514/api/api.php';

  constructor(private http: HttpClient) {}

  public getRequest<T>(params: HttpParams) {
    return this.http.get<T>(this.apiURL, { params });
  }

  public postRequest(action: string, postParams: Map<string, string>) {
    const params = { action, ...Object.fromEntries(postParams) };

    return this.http
      .post(this.apiURL, params, { observe: 'response' })
      .pipe(map((response) => response.status));
  }
}
