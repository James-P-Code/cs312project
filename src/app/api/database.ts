import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})

export class Database {
    readonly apiURL: string = "https://cs.colostate.edu:4444/~c837426514/api/api.php";

    constructor(private http: HttpClient) {}

    public getColors() {
        const params = new HttpParams().set('param', 'colors');
        return this.http.get<{id: number, name: string, hex_value : string}[]>(this.apiURL, {params});
    }

    public getColorCount() {
        const params = new HttpParams().set('param', 'count');
        return this.http.get<{count: number}>(this.apiURL, {params});
    }
}
