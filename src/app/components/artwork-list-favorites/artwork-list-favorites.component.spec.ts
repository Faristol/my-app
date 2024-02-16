import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtworkListFavoritesComponent } from './artwork-list-favorites.component';

describe('ArtworkListFavoritesComponent', () => {
  let component: ArtworkListFavoritesComponent;
  let fixture: ComponentFixture<ArtworkListFavoritesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArtworkListFavoritesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArtworkListFavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
