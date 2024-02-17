import { Injectable } from '@angular/core';
import { IArtwork } from '../interfaces/i-artwork';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  Subject,
  from,
  map,
  mergeMap,
  toArray,
} from 'rxjs';

const url = `https://api.artic.edu/api/v1/artworks`;

@Injectable({
  providedIn: 'root',
})
export class ApiServiceService {
  artworksSubject: Subject<IArtwork[]> = new Subject();

  constructor(private http: HttpClient) {}

  public getArtWorks(): Observable<IArtwork[]> {
    this.http
      .get<{ data: IArtwork[] }>(url)
      .pipe(
        map((response) => {
          console.log(response);
          return response.data;
        })
      )
      .subscribe((artworks) => {
        this.artworksSubject.next(artworks);
      });
    return this.artworksSubject;
  }
  public getArtWorksByPage(page : number ): Observable<{ artworks: IArtwork[], totalPages: number }> {
    return this.http.get<{ data: IArtwork[], pagination: { total_pages: number } }>(`${url}?page=${page}&limit=10`).pipe(
      map(response => {
        const artworks = response.data;
        console.log(artworks);
        const totalPages = response.pagination.total_pages;
        return { artworks, totalPages };
      })
    );
  }

  public filterArtWorks(filter: string): Observable<IArtwork[]> {
    return this.http
      .get<{ data: IArtwork[] }>(
        `${url}/search?q=${filter}&fields=id,description,title,image_id`
      )
      .pipe(map((response) => response.data));
  }
  public filterArtWorksWithPagination( page: number,filter: string): Observable<{artworks : IArtwork[], totalPages:number}> {
    
      filter = filter.trim();
      return this.http
      .get<{ data: IArtwork[], pagination: { total_pages: number } }>(
        `${url}/search?q=${filter}&fields=id,description,title,image_id&page=${page}&limit=10`
      ).pipe(map(response => {
        const artworks = response.data;
        console.log(artworks)
        const totalPages = response.pagination.total_pages > 100 ? 100 : response.pagination.total_pages;
        return { artworks, totalPages };
      }));
  }
  

  public getArtworksFromIDs(artworkList: string[]): Observable<IArtwork[]> {
    from(artworkList)
      .pipe(
        mergeMap((artwork_id) => {
          return this.http
            .get<{ data: IArtwork[] }>(`${url}/${artwork_id}`)
            .pipe(map((response) => response.data));
        }),
        toArray()
      )
      .subscribe((artworks) => this.artworksSubject.next(artworks.flat()));

    return this.artworksSubject;
  }
}
