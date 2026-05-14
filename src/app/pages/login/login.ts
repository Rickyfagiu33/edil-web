import { Component, NgZone, ChangeDetectorRef } from '@angular/core'; // 1. Importa ChangeDetectorRef
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef // 2. Inietta ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid || this.loading) return;
    this.loading = true;
    this.errorMessage = '';

    // Forza subito l'interfaccia a mostrare lo stato di caricamento
    this.cdr.detectChanges();

    const { email, password } = this.loginForm.value;
    const success = await this.authService.login(email, password);

    this.loading = false;

    if (success) {
      // 3. Spingiamo Angular e il browser a sincronizzarsi prima di cambiare rotta
      this.ngZone.run(async () => {
        this.cdr.detectChanges(); // Risveglia la grafica di Angular

        // Esegue la navigazione e attende l'esito reale del router
        const navigato = await this.router.navigate(['/admin']);

        if (!navigato) {
          console.warn("Il router ha rifiutato la rotta 'admin'. Tento la rotta assoluta...");
          await this.router.navigateByUrl('/admin');
        }
      });
    } else {
      this.errorMessage = 'Credenziali non valide. Riprova.';
      this.cdr.detectChanges(); // Mostra subito il messaggio di errore a schermo
    }
  }
}
