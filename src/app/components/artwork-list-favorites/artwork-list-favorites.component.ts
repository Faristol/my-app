import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ApiServiceService } from '../../services/api-service.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, debounceTime, from, map, switchMap, tap } from 'rxjs';
import { IArtwork } from '../../interfaces/i-artwork';
import { FilterService } from '../../services/filter.service';
import { UsersService } from '../../services/users.service';
import { MatDialogComponent } from '../mat-dialog/mat-dialog.component';
import { ArtworkComponent } from '../artwork/artwork.component';
import { ArtworkRowComponent } from '../artwork-row/artwork-row.component';
import { ArtworkFilterPipe } from '../../pipes/artwork-filter.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-artwork-list-favorites',
  standalone: true,
  imports: [ ArtworkComponent,
    ArtworkRowComponent,
    ArtworkFilterPipe,
    CommonModule],
  templateUrl: './artwork-list-favorites.component.html',
  styleUrl: './artwork-list-favorites.component.css',
})
export class ArtworkListFavoritesComponent implements OnInit, OnDestroy {
  public isLikeEnabled = this.usersService.getUserId() ? true : false;
  protected loading: boolean = false;
  protected isLogged = this.usersService.getUserId() ? true : false;
  private subArt: Subscription = new Subscription();
  private subFilter : Subscription = new Subscription();

  constructor(
    private artService: ApiServiceService,
    private filterService: FilterService,
    private usersService: UsersService,
    private matDialog: MatDialog
  ) {}
  ngOnDestroy(): void {
    this.subArt.unsubscribe();
    this.subFilter.unsubscribe();
  }

  ngOnInit(): void {
    console.log(this.isLikeEnabled);
    console.log("entra a favorites")
    if (!this.usersService.getUserId()) {
      //mostrem un pop up indiquant q per a accedir a les favorites ha d'estar registrat
      console.log('no user');
      this.matDialog.open(MatDialogComponent, {
        height: 'min-content',
        width: 'max-content',
        data: {
          title: 'Content not available',
          content: 'You need to login to see your favorites',
        },
      });
    } else {
     this.subArt= from(this.usersService.getFavoritesId())
        .pipe(
          switchMap((idList: string[]) => {
            return this.artService.getArtworksFromIDs(idList);
          }),
          tap(() => {
            this.loading = true;
          })
        )
        .subscribe((artworkList: IArtwork[]) => {
          this.quadres = artworkList;
          this.quadres.map((quadre) => {
            quadre.like = true;
          });
          this.loading = false;
        });
      /*this.artService
      .getArtworksFromIDs()
      .subscribe((artworkList: IArtwork[]) => (this.quadres = artworkList));
  }*/
      this.filterSearch();
    }
  }
  public filterSearch(): void {
    this.loading = true;
    this.subFilter = this.filterService.searchFilter.pipe(
      switchMap((filter: string) => {
        return from(this.usersService.getFavoritesId()).pipe(
          switchMap((favoriteIds: string[]) => {
            return this.artService.getArtworksFromIDs(favoriteIds).pipe(
              map((artworks: IArtwork[]) => {
                return artworks.filter(artwork =>
                  artwork.title.includes(filter)
                );
              }),
              map((filteredArtworks: IArtwork[]) => {
                console.log(filteredArtworks);
                console.log(favoriteIds);
                return filteredArtworks.filter(artwork =>
                  favoriteIds.includes(artwork.id+"")
                );
              })
            );
          })
        );
      })
    ).subscribe((selectedArtworks: IArtwork[]) => {
      this.quadres = selectedArtworks;
      console.log(this.quadres);
      this.quadres.map((quadre) => {
        quadre.like = true;
      });
      this.loading = false;
    });
  }

  toggleLike($event: boolean, artwork: IArtwork) {
    console.log($event, artwork);
    artwork.like = !artwork.like;
    console.log(artwork.like);
    //tots els artworks q apareguen tindran un like, per tant sols haurem de 
    //"handlejar" quan lleven el like
      //si no es el posem com no favorite
      if (!artwork.like) {
        this.removeFavoriteAndUpdateList(artwork);
      }
    
  }
  removeFavoriteAndUpdateList(artwork: IArtwork) {
    this.usersService.removeFavorite(artwork.id + '');
    this.quadres = this.quadres.filter(item => item.id !== artwork.id);
  }
  

  protected quadres: IArtwork[] = [];
  protected filter: string = '';
}
