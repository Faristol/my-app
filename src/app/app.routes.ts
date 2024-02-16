import { Routes } from '@angular/router';
import { ArtworkListComponent } from './components/artwork-list/artwork-list.component';
import { ArtworkComponent } from './components/artwork/artwork.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RegisterComponent } from './components/register/register.component';
import { ArtworkListFavoritesComponent } from './components/artwork-list-favorites/artwork-list-favorites.component';

export const routes: Routes = [
  {path: 'artworks', component: ArtworkListComponent},
  {path: 'artworks/favorites', component: ArtworkListFavoritesComponent},
  {path: 'artworks/:num', component: ArtworkComponent},
  {path: 'artwork/:id', component: ArtworkComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'favorites', redirectTo: 'artworks/favorites'},
  {path: 'login', component: LoginComponent},
  {path:'register',component: RegisterComponent},
  { path: '**', component: ArtworkListComponent }

];
