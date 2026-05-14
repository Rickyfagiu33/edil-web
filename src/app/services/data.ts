import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

/* ========== INTERFACCE ========== */
export interface GalleryProject {
  id?: string;
  title: string;
  description: string;
  location: string;
  category: 'costruzione' | 'restauro' | 'modifica';
  imageUrl: string;
}

export interface QuoteSettings {
  basePrices: {
    costruzione: number;
    restauro: number;
    modifica: number;
  };
  multipliers: {
    bassa: number;
    media: number;
    alta: number;
  };
  vatRate: number;
}

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

export interface LocationItem {
  city: string;
  badge: string;
  address: string;
  region: string;
  description: string;
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutText: string;
  ctaTitle: string;
  ctaText: string;
  services: ServiceItem[];
  phone: string;
  email: string;
  workingHours: string[];
  locations: LocationItem[];
  footerCopyright: string;
}

/* ========== VALORI PREDEFINITI ========== */
const DEFAULT_GALLERY: GalleryProject[] = [
  { title: 'Villa Moderna', description: 'Costruzione chiavi in mano di una villa unifamiliare di 250 m² con giardino e piscina.', location: 'Milano', category: 'costruzione', imageUrl: 'https://picsum.photos/id/104/600/400' },
  { title: 'Residence "Le Terrazze"', description: 'Edificio residenziale di 8 appartamenti con terrazze panoramiche e parcheggio interrato.', location: 'Roma', category: 'costruzione', imageUrl: 'https://picsum.photos/id/159/600/400' },
  { title: 'Palazzo Storico', description: 'Restauro conservativo di un palazzo del \'700 con recupero degli affreschi originali.', location: 'Napoli', category: 'restauro', imageUrl: 'https://picsum.photos/id/106/600/400' },
  { title: 'Cascina Rurale', description: 'Recupero di una cascina lombarda del XIX secolo con tecniche di bioedilizia.', location: 'Milano', category: 'restauro', imageUrl: 'https://picsum.photos/id/160/600/400' },
  { title: 'Appartamento Moderno', description: 'Ristrutturazione completa di un appartamento di 120 m² con open space e domotica.', location: 'Roma', category: 'modifica', imageUrl: 'https://picsum.photos/id/107/600/400' },
  { title: 'Loft Industriale', description: 'Trasformazione di un ex capannone in un loft abitativo di design con soppalco.', location: 'Napoli', category: 'modifica', imageUrl: 'https://picsum.photos/id/221/600/400' }
];

const DEFAULT_SETTINGS: QuoteSettings = {
  basePrices: { costruzione: 120, restauro: 180, modifica: 90 },
  multipliers: { bassa: 1, media: 1.3, alta: 1.6 },
  vatRate: 0.22
};

const DEFAULT_CONTENT: SiteContent = {
  heroTitle: 'Costruiamo il tuo futuro',
  heroSubtitle: 'Dal 1995, EdilSolido è sinonimo di qualità, affidabilità e innovazione nel settore edile italiano.',
  aboutTitle: 'Un\'impresa solida, una tradizione che dura',
  aboutText: '<p><strong>EdilSolido Costruzioni</strong> nasce nel 1995 dalla passione e dall\'esperienza di un team di professionisti del settore edile. In oltre 25 anni di attività, abbiamo realizzato centinaia di progetti in tutta Italia, distinguendoci per la qualità delle finiture e il rispetto delle tempistiche.</p><p>La nostra filosofia si basa su tre pilastri fondamentali: <strong>trasparenza</strong> nei preventivi, <strong>eccellenza</strong> nei materiali e <strong>attenzione</strong> alle esigenze del cliente.</p><p>Ogni progetto, dalla semplice ristrutturazione alla costruzione chiavi in mano, viene seguito con la stessa cura artigianale e professionale che ci contraddistingue da sempre.</p>',
  ctaTitle: 'Pronto a realizzare il tuo progetto?',
  ctaText: 'Richiedi subito un preventivo gratuito e senza impegno. Ti risponderemo entro 24 ore.',
  services: [
    { icon: '🏠', title: 'Costruzioni chiavi in mano', description: 'Realizziamo la tua casa da zero, gestendo ogni fase: dalla progettazione architettonica alla posa dell\'ultimo mattone.' },
    { icon: '🏛️', title: 'Restauro conservativo', description: 'Recuperiamo il patrimonio edilizio storico con tecniche all\'avanguardia e materiali tradizionali.' },
    { icon: '🔨', title: 'Ristrutturazioni interne', description: 'Trasformiamo gli spazi interni con soluzioni moderne e funzionali, ottimizzando ogni metro quadro.' },
    { icon: '📐', title: 'Progettazione', description: 'Il nostro team di architetti e ingegneri ti affianca nella progettazione personalizzata.' }
  ],
  phone: '+39 02 1234567',
  email: 'info@edilsolido.it',
  workingHours: ['Lunedì - Venerdì: 8:00 - 18:00', 'Sabato: 9:00 - 13:00'],
  locations: [
    { city: 'Milano', badge: 'Sede Legale', address: 'Via Roma, 10<br>20121 Milano (MI)', region: 'Lombardia', description: 'La nostra sede principale, punto di riferimento per i progetti in tutto il Nord Italia.' },
    { city: 'Roma', badge: 'Sede Operativa', address: 'Via Appia, 15<br>00179 Roma (RM)', region: 'Lazio', description: 'La nostra presenza nel centro Italia, per servire al meglio i progetti nella capitale e dintorni.' },
    { city: 'Napoli', badge: 'Sede Operativa', address: 'Via Toledo, 5<br>80132 Napoli (NA)', region: 'Campania', description: 'Il nostro presidio nel Sud Italia, per offrire la qualità EdilSolido in tutto il Meridione.' }
  ],
  footerCopyright: '© 2024 EdilSolido Costruzioni. Tutti i diritti riservati. | Sito realizzato con passione e professionalità.'
};

@Injectable({ providedIn: 'root' })
export class DataService {
  private gallerySubject = new BehaviorSubject<GalleryProject[]>([]);
  public gallery$ = this.gallerySubject.asObservable();

  private settingsSubject = new BehaviorSubject<QuoteSettings>(DEFAULT_SETTINGS);
  public settings$ = this.settingsSubject.asObservable();

  private contentSubject = new BehaviorSubject<SiteContent>(DEFAULT_CONTENT);
  public content$ = this.contentSubject.asObservable();

  private galleryCollection!: CollectionReference<DocumentData>;
  private settingsDocRef: any;
  private contentDocRef: any;

  constructor(private firestore: Firestore) {
    // Inizializza i riferimenti a Firestore DOPO che firestore è stato iniettato
    this.galleryCollection = collection(this.firestore, 'gallery');
    this.settingsDocRef = doc(this.firestore, 'settings/quote');
    this.contentDocRef = doc(this.firestore, 'settings/content');

    // 👉 Ascolta la galleria in tempo reale
    onSnapshot(this.galleryCollection, (snapshot) => {
      if (snapshot.empty) {
        this.seedDefaultGallery();
      } else {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryProject));
        this.gallerySubject.next(projects);
      }
    });

    // 👉 Ascolta impostazioni preventivatore
    onSnapshot(this.settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        this.settingsSubject.next(docSnap.data() as QuoteSettings);
      } else {
        setDoc(this.settingsDocRef, DEFAULT_SETTINGS);
        this.settingsSubject.next(DEFAULT_SETTINGS);
      }
    });

    // 👉 Ascolta contenuti del sito
    onSnapshot(this.contentDocRef, (docSnap) => {
      if (docSnap.exists()) {
        this.contentSubject.next(docSnap.data() as SiteContent);
      } else {
        setDoc(this.contentDocRef, DEFAULT_CONTENT);
        this.contentSubject.next(DEFAULT_CONTENT);
      }
    });
  }

  getDefaultSettings(): QuoteSettings {
    return DEFAULT_SETTINGS;
  }

  /* ========== INIZIALIZZAZIONE GALLERIA ========== */
  private async seedDefaultGallery(): Promise<void> {
    for (const project of DEFAULT_GALLERY) {
      await addDoc(this.galleryCollection, project);
    }
    // Il listener onSnapshot si riattiverà automaticamente dopo l'aggiunta
  }

  /* ========== CRUD GALLERIA ========== */
  async addProject(project: GalleryProject): Promise<void> {
    await addDoc(this.galleryCollection, {
      title: project.title,
      description: project.description,
      location: project.location,
      category: project.category,
      imageUrl: project.imageUrl
    });
  }

  async updateProject(project: GalleryProject): Promise<void> {
    if (!project.id) return;
    const docRef = doc(this.firestore, 'gallery', project.id);
    await updateDoc(docRef, { ...project });
  }

  async deleteProject(id: string): Promise<void> {
    const docRef = doc(this.firestore, 'gallery', id);
    await deleteDoc(docRef);
  }

  /* ========== IMPOSTAZIONI E CONTENUTI ========== */
  async updateQuoteSettings(settings: QuoteSettings): Promise<void> {
    await setDoc(this.settingsDocRef, settings);
  }

  async updateSiteContent(content: SiteContent): Promise<void> {
    await setDoc(this.contentDocRef, content);
  }
}
