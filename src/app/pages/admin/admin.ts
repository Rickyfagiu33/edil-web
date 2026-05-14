import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { DataService, GalleryProject, QuoteSettings, SiteContent } from '../../services/data';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class AdminComponent implements OnInit {
  activeTab: 'gallery' | 'settings' | 'content' = 'gallery';
  projects$: Observable<GalleryProject[]>;
  settings$: Observable<QuoteSettings>;
  content$: Observable<SiteContent>;

  galleryForm: FormGroup;
  settingsForm: FormGroup;
  contentForm: FormGroup;
  editingProjectId: string | null = null; // ora è string (ID Firestore)

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    public dataService: DataService,
    private router: Router
  ) {
    this.projects$ = this.dataService.gallery$;
    this.settings$ = this.dataService.settings$;
    this.content$ = this.dataService.content$;

    // Form gallery
    this.galleryForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      category: ['costruzione', Validators.required],
      imageUrl: ['', Validators.required]
    });

    // Form settings
    this.settingsForm = this.fb.group({
      costruzionePrice: [0, [Validators.required, Validators.min(0)]],
      restauroPrice: [0, [Validators.required, Validators.min(0)]],
      modificaPrice: [0, [Validators.required, Validators.min(0)]],
      bassaMultiplier: [1, [Validators.required, Validators.min(0)]],
      mediaMultiplier: [1.3, [Validators.required, Validators.min(0)]],
      altaMultiplier: [1.6, [Validators.required, Validators.min(0)]],
      vatRate: [0.22, [Validators.required, Validators.min(0), Validators.max(1)]]
    });

    // Form contenuti (con FormArray)
    this.contentForm = this.fb.group({
      heroTitle: ['', Validators.required],
      heroSubtitle: ['', Validators.required],
      aboutTitle: ['', Validators.required],
      aboutText: ['', Validators.required],
      ctaTitle: ['', Validators.required],
      ctaText: ['', Validators.required],
      services: this.fb.array([]),
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      workingHours: this.fb.array([]),
      locations: this.fb.array([]),
      footerCopyright: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadSettingsIntoForm();
    this.loadContentIntoForm();
  }

  /* ========== GALLERY ========== */
  resetGalleryForm(): void {
    this.editingProjectId = null;
    this.galleryForm.reset({ category: 'costruzione' });
  }

  editProject(project: GalleryProject): void {
    this.editingProjectId = project.id || null;
    this.galleryForm.patchValue(project);
  }

  async saveProject(): Promise<void> {
    if (this.galleryForm.invalid) return;
    const fv = this.galleryForm.value;
    const project: GalleryProject = { ...fv };
    if (this.editingProjectId) {
      project.id = this.editingProjectId;
      await this.dataService.updateProject(project);
    } else {
      await this.dataService.addProject(project);
    }
    this.resetGalleryForm();
  }

  async deleteProject(id: string): Promise<void> {
    if (confirm('Eliminare questo progetto?')) {
      await this.dataService.deleteProject(id);
      if (this.editingProjectId === id) this.resetGalleryForm();
    }
  }

  /* ========== SETTINGS ========== */
  loadSettingsIntoForm(): void {
    this.dataService.settings$.subscribe(s => {
      if (s) {
        this.settingsForm.patchValue({
          costruzionePrice: s.basePrices.costruzione,
          restauroPrice: s.basePrices.restauro,
          modificaPrice: s.basePrices.modifica,
          bassaMultiplier: s.multipliers.bassa,
          mediaMultiplier: s.multipliers.media,
          altaMultiplier: s.multipliers.alta,
          vatRate: s.vatRate
        });
      }
    });
  }

  async saveSettings(): Promise<void> {
    if (this.settingsForm.invalid) return;
    const fv = this.settingsForm.value;
    const newSettings: QuoteSettings = {
      basePrices: {
        costruzione: fv.costruzionePrice,
        restauro: fv.restauroPrice,
        modifica: fv.modificaPrice
      },
      multipliers: {
        bassa: fv.bassaMultiplier,
        media: fv.mediaMultiplier,
        alta: fv.altaMultiplier
      },
      vatRate: fv.vatRate
    };
    await this.dataService.updateQuoteSettings(newSettings);
    alert('Impostazioni aggiornate!');
  }

  /* ========== CONTENUTI ========== */
  loadContentIntoForm(): void {
    this.dataService.content$.subscribe(content => {
      if (!content) return;
      this.contentForm.patchValue({
        heroTitle: content.heroTitle,
        heroSubtitle: content.heroSubtitle,
        aboutTitle: content.aboutTitle,
        aboutText: content.aboutText,
        ctaTitle: content.ctaTitle,
        ctaText: content.ctaText,
        phone: content.phone,
        email: content.email,
        footerCopyright: content.footerCopyright
      });

      // Servizi
      const servicesArray = this.contentForm.get('services') as FormArray;
      servicesArray.clear();
      content.services.forEach(s => servicesArray.push(this.fb.group({
        icon: [s.icon, Validators.required],
        title: [s.title, Validators.required],
        description: [s.description, Validators.required]
      })));
  
      // Orari
      const hoursArray = this.contentForm.get('workingHours') as FormArray;
      hoursArray.clear();
      content.workingHours.forEach(h => hoursArray.push(this.fb.control(h, Validators.required)));

      // Sedi
      const locArray = this.contentForm.get('locations') as FormArray;
      locArray.clear();
      content.locations.forEach(loc => locArray.push(this.fb.group({
        city: [loc.city, Validators.required],
        badge: [loc.badge, Validators.required],
        address: [loc.address, Validators.required],
        region: [loc.region, Validators.required],
        description: [loc.description, Validators.required]
      })));
    });
  }

  async saveContent(): Promise<void> {
    if (this.contentForm.invalid) return;
    const fv = this.contentForm.value;
    const newContent: SiteContent = {
      heroTitle: fv.heroTitle,
      heroSubtitle: fv.heroSubtitle,
      aboutTitle: fv.aboutTitle,
      aboutText: fv.aboutText,
      ctaTitle: fv.ctaTitle,
      ctaText: fv.ctaText,
      services: fv.services,
      phone: fv.phone,
      email: fv.email,
      workingHours: fv.workingHours,
      locations: fv.locations,
      footerCopyright: fv.footerCopyright
    };
    await this.dataService.updateSiteContent(newContent);
    alert('Contenuti aggiornati!');
  }

  /* ========== HELPER per FormArray ========== */
  get servicesArray(): FormArray { return this.contentForm.get('services') as FormArray; }
  get workingHoursArray(): FormArray { return this.contentForm.get('workingHours') as FormArray; }
  get locationsArray(): FormArray { return this.contentForm.get('locations') as FormArray; }

  addService(): void {
    this.servicesArray.push(this.fb.group({
      icon: ['🔧', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required]
    }));
  }
  removeService(index: number): void { this.servicesArray.removeAt(index); }

  addWorkingHour(): void {
    this.workingHoursArray.push(this.fb.control('', Validators.required));
  }
  removeWorkingHour(index: number): void { this.workingHoursArray.removeAt(index); }

  addLocation(): void {
    this.locationsArray.push(this.fb.group({
      city: ['', Validators.required],
      badge: ['', Validators.required],
      address: ['', Validators.required],
      region: ['', Validators.required],
      description: ['', Validators.required]
    }));
  }
  removeLocation(index: number): void { this.locationsArray.removeAt(index); }

  /* ========== LOGOUT ========== */
  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
