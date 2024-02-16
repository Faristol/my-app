import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IArtwork } from '../../interfaces/i-artwork';
import { ArtworkComponent } from '../artwork/artwork.component';
import { ArtworkRowComponent } from '../artwork-row/artwork-row.component';
import { ApiServiceService } from '../../services/api-service.service';
import { ArtworkFilterPipe } from '../../pipes/artwork-filter.pipe';
import { FilterService } from '../../services/filter.service';
import { Subscription, debounceTime, from } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { CommonModule } from '@angular/common';
import { map, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { PaginationComponent } from '../pagination/pagination.component';
@Component({
  selector: 'app-artwork-list',
  standalone: true,
  imports: [
    ArtworkComponent,
    ArtworkRowComponent,
    ArtworkFilterPipe,
    CommonModule,
    PaginationComponent,
  ],
  templateUrl: './artwork-list.component.html',
  styleUrl: './artwork-list.component.css',
})
export class ArtworkListComponent implements OnInit, OnDestroy {
  public isLikeEnabled = this.usersService.getUserId() ? true : false;
  protected isLogged = this.usersService.getUserId() ? true : false;
  private subArt: Subscription = new Subscription();
  private subFilter: Subscription = new Subscription();
  private subPagination: Subscription = new Subscription();
  currentPage!: number;
  totalPages!: number;

  constructor(
    private artService: ApiServiceService,
    private filterService: FilterService,
    private usersService: UsersService,
    private route: ActivatedRoute
  ) {}
  ngOnDestroy(): void {
    this.subArt.unsubscribe();
    this.subFilter.unsubscribe();
  }

  ngOnInit(): void {
    this.subPagination = this.route.params.subscribe((page) => {
      console.log(page);
      this.currentPage = +page['page'];
      this.currentPage = isNaN(this.currentPage) ? 1 : this.currentPage;
      if (this.usersService.getUserId()) {
      } else {
        this.loadArtworksWithoutLikes();
        this.filterSearchWithPagination();
      }
    });

    console.log('entra a list normal');
    if (this.usersService.getUserId()) {
      //ens carreguem els ids dels arts favorits
      let favorites: string[];
      this.subArt = from(this.usersService.getFavoritesId())
        .pipe(
          tap((favoritesList: string[]) => {
            favorites = favoritesList;
          }),
          switchMap(() => {
            return this.artService.getArtWorks();
          })
        )
        .subscribe((allArtworks: IArtwork[]) => {
          this.quadres = allArtworks.map((artwork: IArtwork) => {
            if (favorites.includes(artwork.id + '')) {
              artwork.like = true;
            }
            return artwork;
          });
        });
      this.filterSearchFavorites();
    } else {
      this.subArt = this.artService
        .getArtWorksByPage(this.currentPage)
        .pipe()
        .subscribe(({ artworks: artworkList, totalPages }) => {
          this.quadres = artworkList;
          console.log(this.quadres);
          this.totalPages = totalPages;
        });
      this.filterSearch();
    }
  }
  loadArtworksWithoutLikes() {
    this.subArt = this.artService
      .getArtWorksByPage(this.currentPage)
      .pipe()
      .subscribe(({ artworks: artworkList, totalPages }) => {
        this.quadres = artworkList;
        console.log(this.quadres);
        this.totalPages = totalPages;
      });
  }

  filterSearch() {
    this.subFilter = this.filterService.searchFilter
      .pipe(
        debounceTime(500),

        switchMap((filter) => this.artService.filterArtWorks(filter))
      )
      .subscribe((filteredArtworks) => {
        this.quadres = filteredArtworks;
      });
  }

  filterSearchWithPagination() {
    this.subFilter = this.filterService.searchFilter
      .pipe(
        debounceTime(500),

        switchMap((filter) =>
          this.artService.filterArtWorksWithPagination(filter, this.currentPage)
        )
      )
      .subscribe(({ artworks: artworkList, totalPages }) => {
        this.quadres = artworkList;
        console.log(this.quadres);
        this.totalPages = totalPages;
      });
  }
  filterSearchFavorites() {
    //reiniciem el current page

    this.subFilter = this.filterService.searchFilter
      .pipe(
        debounceTime(500),

        switchMap((filter) => {
          return this.artService.filterArtWorks(filter);
        }),
        switchMap((filteredArtworks) => {
          return from(this.usersService.getFavoritesId()).pipe(
            map((favorites) => ({ filteredArtworks, favorites }))
          );
        })
      )
      .subscribe(({ filteredArtworks, favorites }) => {
        this.quadres = filteredArtworks.map((artwork: IArtwork) => {
          if (favorites.includes(artwork.id + '')) {
            artwork.like = true;
          }
          return artwork;
        });
      });
  }

  toggleLike($event: boolean, artwork: IArtwork) {
    console.log($event, artwork);
    artwork.like = !artwork.like;
    console.log(artwork.like);
    if (artwork.like) {
      //si fa like el posem com a favorite
      this.usersService.setFavorite(artwork.id + '');
    } else {
      //si no es el posem com no favorite
      this.usersService.removeFavorite(artwork.id + '');
    }
  }

  protected quadres: IArtwork[] = [];
  protected filter: string = '';
}
