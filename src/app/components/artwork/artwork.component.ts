import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IArtwork } from '../../interfaces/i-artwork';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, catchError, tap } from 'rxjs';
import { ApiServiceService } from '../../services/api-service.service';
import { MatCardModule } from '@angular/material/card';
import { MatCardHeader } from '@angular/material/card';
import { MatCardContent } from '@angular/material/card';
import { MatCardTitle } from '@angular/material/card';
import { MatCardSubtitle } from '@angular/material/card';
import { MatCardImage } from '@angular/material/card';


@Component({
  selector: 'app-artwork',
  standalone: true,
  imports: [RouterLink, CommonModule,MatCardModule,MatCardHeader,MatCardContent,MatCardTitle,MatCardSubtitle,MatCardImage],
  templateUrl: './artwork.component.html',
  styleUrl: './artwork.component.css',
})
export class ArtworkComponent implements OnInit, OnDestroy{
  @Input() artwork!: IArtwork;
  @Input() id?: string;
  @Input() isLikeEnabled: boolean = false;
  @Output() likeChanged = new EventEmitter<boolean>();
  artworkId!: string;
  artworkDetails!: ArtworkDetails;
  private routeId: Subscription = new Subscription();
  private subArt: Subscription = new Subscription();
  constructor(
    private route: ActivatedRoute,
    private artService: ApiServiceService
  ) {}
  ngOnDestroy(): void {
    this.routeId.unsubscribe();
    this.subArt.unsubscribe();
  }
  ngOnInit(): void {
    this.routeId = this.route.params.subscribe((id) => {
      this.id = id['id'];
      if (this.id) {
        this.getArtwork([this.id]);
      }
    });
  }
  getArtwork(id: string[]) {
    this.artService
      .getArtworksFromIDs(id)
      .pipe(
        tap((artworks) => {
          this.artwork = artworks[0];
          console.log(this.artwork);
          this.artworkDetails = {
            id: this.artwork.id,
            image_id: this.artwork.image_id,
            title: this.artwork.title,
            credit_line: this.artwork.credit_line,
            description: this.artwork.description,
            date_start: this.artwork.date_start,
            date_end: this.artwork.date_end,
            date_display: this.artwork.date_display,
            place_of_origin: this.artwork.place_of_origin,
            medium_display: this.artwork.medium_display,
            provenance_text: this.artwork.provenance_text,
            exhibition_history: this.artwork.exhibition_history,
          };
          console.log(this.artworkDetails)
        }),
        catchError((error) => {
          console.error('Error al cargar');
          throw error;
        })
      )
      .subscribe();
  }

  toggleLike() {
    //this.artwork.like = !this.artwork.like;
    this.likeChanged.emit(this.artwork.like);
  }

  mouseover: boolean = false;
}
export interface ArtworkDetails {
  id: number;
  image_id: string;
  title: string;
  credit_line: string;
  description: string | null;
  date_start: number;
  date_end: number;
  date_display: string;
  place_of_origin: string;
  medium_display: string;
  provenance_text: any;
  exhibition_history: any;
}
