import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Osservabile nativo di Firebase per tracciare i dettagli dell'utente loggato
  public user$: Observable<User | null>;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  // Gestione dello stato booleano (mantenuta per compatibilità con i tuoi componenti esistenti)
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private auth: Auth) {
    // Inizializza l'osservabile dell'utente di Firebase
    this.user$ = user(this.auth);

    // Ascolta i cambiamenti di stato di Firebase per aggiornare automaticamente il BehaviorSubject
    this.user$.subscribe((currentUser) => {
      this.isLoggedInSubject.next(currentUser !== null);
    });
  }

  /**
   * Effettua il login reale su Firebase Authentication.
   * Modificato in Promise<boolean> asincrona per attendere la risposta dei server Google.
   */
  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log('Tentativo di login su Firebase in corso...');
      await signInWithEmailAndPassword(this.auth, email, password);
      console.log('Login effettuato con successo!');
      return true;
    } catch (error) {
      // Questo ti permetterà di vedere l'errore esatto in console (F12) se le credenziali sono errate
      console.error('Errore durante il login su Firebase:', error);
      return false;
    }
  }

  /**
   * Effettua il logout da Firebase e resetta la sessione nel browser.
   */
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('Logout effettuato.');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  }

  /**
   * Restituisce lo stato sincrono del login (se l'utente è attualmente autenticato).
   */
  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }
}
