import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { GalleryComponent } from './pages/gallery/gallery';
import { QuoteComponent } from './pages/quote/quote';
import { ContactsComponent } from './pages/contacts/contacts';
import { AdminComponent } from './pages/admin/admin';
import { LoginComponent } from './pages/login/login';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'gallery', component: GalleryComponent },
  { path: 'quote', component: QuoteComponent },
  { path: 'contacts', component: ContactsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];
