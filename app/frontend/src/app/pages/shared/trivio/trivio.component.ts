// ============================================================
// TrivioComponent — schermata di assessment come "trivio percorribile".
//
// Componente PRESENTAZIONALE condiviso da diagnosi e retest: mostra la
// domanda in alto, le destinazioni A/B/C in fila, una biforcazione a
// ventaglio (SVG neon) e un omino avatar arcade che, alla scelta,
// cammina lungo il percorso fino alla destinazione.
//
// Non contiene logica di scoring: alla scelta emette `scelta(opzione.id)`
// e lascia che sia il parent a chiamare il backend e gestire l'esito.
// L'avanzamento del gioco NON dipende dalla fine dell'animazione
// (setTimeout del parent), quindi resta robusto anche con motion ridotto.
// ============================================================
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { Item } from '../../../services/assessment.service';

@Component({
  selector: 'app-trivio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trivio.component.html',
  styleUrls: ['./trivio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrivioComponent implements AfterViewInit, OnDestroy, OnChanges {
  private cdr = inject(ChangeDetectorRef);

  /** L'item corrente (domanda + opzioni). */
  @Input() item: Item | null = null;
  /** Esito dell'ultima scelta, guida il glow sulla destinazione scelta. */
  @Input() esito: 'correct' | 'wrong' | null = null;
  /** Accento cromatico neon: viola (diagnosi) o ambra (retest). */
  @Input() accent: 'purp' | 'amber' = 'purp';
  /** Badge opzionale sopra la domanda (es. "VERIFICA FINALE"). */
  @Input() etichetta?: string;

  /** Emesso alla scelta dell'utente con l'id dell'opzione selezionata. */
  @Output() scelta = new EventEmitter<string>();

  /** Contenitore misurato: definisce lo spazio px della biforcazione. */
  @ViewChild('arena') arena?: ElementRef<HTMLElement>;

  /** Stringhe SVG `d` dei percorsi, una per opzione (single source of truth). */
  percorsi: string[] = [];
  /** Indice della destinazione scelta (null finché non si sceglie). */
  selIndex: number | null = null;
  /** true dopo la scelta: avvia la camminata dell'avatar. */
  cammina = false;
  /** true durante il reset: azzera la transizione così l'avatar scatta
   *  in basso al nuovo item invece di "ridiscendere" dalla destinazione. */
  senzaTransizione = false;
  /** Percorso `d` seguito dall'avatar (default: corridoio centrale). */
  walkPathD = '';

  private arenaW = 0;
  private arenaH = 0;
  private ro?: ResizeObserver;

  ngAfterViewInit(): void {
    const el = this.arena?.nativeElement;
    if (el && typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect;
        if (!box) return;
        this.arenaW = box.width;
        this.arenaH = box.height;
        this.recomputePercorsi();
        this.cdr.markForCheck();
      });
      this.ro.observe(el);
    }
    // Misura iniziale (nel caso ResizeObserver non sia disponibile).
    this.misuraArena();
    this.recomputePercorsi();
    this.focusPrimaDestinazione();
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['item']) {
      // Nuovo item: l'avatar scatta in basso (niente discesa animata) e si
      // azzera la selezione.
      this.selIndex = null;
      this.cammina = false;
      this.senzaTransizione = true;
      this.recomputePercorsi();
      this.focusPrimaDestinazione();
      // Riabilita la transizione dopo che lo snap in basso è stato applicato,
      // così la camminata del prossimo item torna animata.
      setTimeout(() => {
        this.senzaTransizione = false;
        this.cdr.markForCheck();
      }, 80);
    }
  }

  /** Lettera della destinazione (A, B, C, …). */
  lettera(i: number): string {
    return String.fromCharCode(65 + i);
  }

  /** offset-path per l'avatar: percorso scelto o corridoio centrale. */
  avatarPath(): string {
    return this.walkPathD ? `path("${this.walkPathD}")` : 'none';
  }

  /** Gestione scelta: imposta destinazione, avvia camminata, emette. */
  scegliOpzione(i: number, id: string): void {
    if (this.selIndex !== null) return;
    this.selIndex = i;
    this.walkPathD = this.percorsi[i] ?? this.walkPathD;
    this.cammina = true;
    this.scelta.emit(id);
    this.cdr.markForCheck();
  }

  /**
   * Tastiera: ← = prima destinazione, → = ultima, ↑ = centrale.
   * Invio/Spazio restano gestiti nativamente dai <button>.
   */
  onKeydown(e: KeyboardEvent): void {
    const n = this.item?.opzioni.length ?? 0;
    if (!n || this.selIndex !== null) return;

    let idx: number | null = null;
    switch (e.key) {
      case 'ArrowLeft':  idx = 0; break;
      case 'ArrowRight': idx = n - 1; break;
      case 'ArrowUp':    idx = Math.floor(n / 2); break;
      default: return;
    }

    e.preventDefault();
    const opzione = this.item!.opzioni[idx];
    if (opzione) this.scegliOpzione(idx, opzione.id);
  }

  /**
   * Geometria del trivio (funzione pura, single source of truth).
   * Dato n opzioni e la dimensione px dell'arena (w×h), calcola la
   * stringa SVG `d` di ogni percorso: corridoio centrale iniziale da
   * (w/2, h) → biforcazione (w/2, h*0.55), poi diramazione a ventaglio.
   * Le destinazioni sono simmetriche rispetto all'asse x = w/2.
   */
  buildPercorsi(n: number, w: number, h: number): string[] {
    if (!w || !h || n < 1) return [];
    const cx = w / 2;
    const by = h * 0.55; // punto di biforcazione
    const ty = h * 0.16; // quota delle destinazioni (vicino all'alto)

    return Array.from({ length: n }, (_, i) => {
      // Centro di ogni destinazione, allineato ai pulsanti (flex uniforme).
      const dx = w * ((i + 0.5) / n);
      return (
        `M ${cx.toFixed(1)} ${h.toFixed(1)} ` +
        `L ${cx.toFixed(1)} ${by.toFixed(1)} ` +
        `Q ${cx.toFixed(1)} ${ty.toFixed(1)} ${dx.toFixed(1)} ${ty.toFixed(1)}`
      );
    });
  }

  private recomputePercorsi(): void {
    const n = this.item?.opzioni.length ?? 0;
    this.percorsi = this.buildPercorsi(n, this.arenaW, this.arenaH);
    // Default: avatar fermo in basso al centro sul corridoio centrale.
    if (!this.cammina) {
      const mid = Math.floor(n / 2);
      this.walkPathD = this.percorsi[mid] ?? this.percorsi[0] ?? '';
    }
  }

  private misuraArena(): void {
    const el = this.arena?.nativeElement;
    if (el) {
      this.arenaW = el.clientWidth;
      this.arenaH = el.clientHeight;
    }
  }

  private focusPrimaDestinazione(): void {
    // Focus sulla prima destinazione ad ogni nuovo item (WCAG 2.4.3).
    // Doppio timeout: lascia ad Angular il tempo di renderizzare i
    // pulsanti con [disabled] rimosso prima di cercarli nel DOM.
    setTimeout(() => {
      setTimeout(() => {
        const el = this.arena?.nativeElement?.parentElement ?? undefined;
        const firstBtn = el?.querySelector(
          '.trivio-dest:not([disabled])',
        ) as HTMLButtonElement | null;
        firstBtn?.focus();
      }, 80);
    }, 30);
  }
}
