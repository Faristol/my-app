import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
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
import { combineLatest } from 'rxjs';
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
  searchFilter: string = '';

  constructor(
    private artService: ApiServiceService,
    private filterService: FilterService,
    private usersService: UsersService,
    private route: ActivatedRoute
  ) {}

  ngOnDestroy(): void {
    this.subArt.unsubscribe();
    this.subFilter.unsubscribe();
    this.subPagination.unsubscribe();
  }

  ngOnInit(): void {
    this.subFilter = this.filterService.searchFilter
      .pipe(debounceTime(500))
      .subscribe((filter) => {
        this.handleSearchFilter(filter);
        if (!this.usersService.getUserId()) {
          this.loadArtworksWithoutLikesAndPagination(
            this.currentPage,
            this.searchFilter
          );
        } else {
          this.loadArtworksWithLikesAndPagination(
            this.currentPage,
            this.searchFilter
          );
        }
      });

    this.subPagination = this.route.params.subscribe((page) => {
      this.handleRouteParams(page);
      if (!this.usersService.getUserId()) {
        this.loadArtworksWithoutLikesAndPagination(
          this.currentPage,
          this.searchFilter
        );
      } else {
        this.loadArtworksWithLikesAndPagination(
          this.currentPage,
          this.searchFilter
        );
      }
    });

    if (!this.usersService.getUserId()) {
      this.loadArtworksWithoutLikesAndPagination(
        this.currentPage,
        this.searchFilter
      );
    } else {
      this.loadArtworksWithLikesAndPagination(
        this.currentPage,
        this.searchFilter
      );
    }
  }
  private handleRouteParams(page: any) {
    this.currentPage = +page['page'];
    this.currentPage = isNaN(this.currentPage) ? 1 : this.currentPage;
    console.log(this.currentPage);
  }

  private handleSearchFilter(searchFilter: any) {
    this.searchFilter = searchFilter;
  }
  loadArtworksWithoutLikesAndPagination(currentPage: number, filter: any) {
    this.subArt = this.artService
      .filterArtWorksWithPagination(currentPage, filter)
      .pipe()
      .subscribe(({ artworks: artworkList, totalPages }) => {
        if (this.currentPage > totalPages) {
          this.currentPage = 1;
          this.loadArtworksWithoutLikesAndPagination(this.currentPage, filter);
        } else {
          this.quadres = artworkList;
          console.log(this.quadres);
          this.totalPages = totalPages;
        }
      });
  }
  loadArtworksWithLikesAndPagination(currentPage: number, filter: any) {
    let favorites: string[];
    this.subArt = from(this.usersService.getFavoritesId())
      .pipe(
        tap((favoritesList: string[]) => {
          favorites = favoritesList;
        }),
        switchMap(() => {
          return this.artService.filterArtWorksWithPagination(
            currentPage,
            filter
          );
        })
      )
      .subscribe(({ artworks: artworkList, totalPages }) => {
        if (this.currentPage > totalPages) {
          this.currentPage = 1;
          this.loadArtworksWithLikesAndPagination(this.currentPage, filter);
        } else {
          this.quadres = artworkList.map((artwork: IArtwork) => {
            if (favorites.includes(artwork.id + '')) {
              artwork.like = true;
            }
            return artwork;
          });
          console.log(this.quadres);
          this.totalPages = totalPages;
        }
      });
  }
  /*
  loadArtworksWithLikes() {
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
          this.artService.filterArtWorksWithPagination(this.currentPage, filter)
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
  */

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
