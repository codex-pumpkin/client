import {
  Component, input, OnInit, OnDestroy, computed, signal,
  ChangeDetectionStrategy, ElementRef, ViewChild, AfterViewInit, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ─── Types ─────────────────────────────────────────────────────────────────

export type CircuitComponent = {
  name: string;
  type: string;
  nodes: string[];
  values: Record<string, string> | null;
};

export type Point   = { x: number; y: number };
export type CompPos = Record<string, Point>;

export type NodePath = {
  id: string;
  d: string;
  junctions: Point[];
  labelX: number;
  labelY: number;
};

export type WireData = {
  nodePaths:  NodePath[];
  gndBusX1:   number; gndBusX2: number; gndBusY: number;
  gndCentreX: number; gndDrops: Point[];
  vddBusX1:   number; vddBusX2: number; vddBusY: number;
  vddCentreX: number; vddDrops: Point[]; vddLabelX: number;
};

// ─── Colours — CSS variables allow light/dark theming via the stylesheet ───

export const TYPE_COLORS: Record<string, string> = {
  Resistor:      'var(--cg-type-resistor)',
  VoltageSource: 'var(--cg-type-voltage)',
  CurrentSource: 'var(--cg-type-current)',
  Mosfet:        'var(--cg-type-mosfet)',
  Capacitor:     'var(--cg-type-capacitor)',
  Inductor:      'var(--cg-type-inductor)',
  default:       'var(--cg-type-default)',
};

const WIRE_SIGNAL = 'var(--cg-wire-signal)';
const WIRE_VDD    = 'var(--cg-wire-vdd)';
const WIRE_GND    = 'var(--cg-wire-gnd)';
const SNAP        = 10;

// ─── Type normalisation ────────────────────────────────────────────────────
// Handles non-standard type strings from generated netlists (e.g. "vsrc",
// "bjt", "transistor") so the rest of the code always works with canonical
// names like 'Resistor', 'Mosfet', 'VoltageSource', etc.

function normalizeType(type: string): string {
  const t = (type ?? '').toLowerCase();
  if (t === 'mosfet' || t === 'transistor' || t === 'bjt' || t === 'npn' || t === 'pnp') return 'Mosfet';
  if (t === 'resistor')                                                                    return 'Resistor';
  if (t === 'capacitor')                                                                   return 'Capacitor';
  if (t === 'inductor')                                                                    return 'Inductor';
  if (t === 'voltagesource' || t === 'vsource' || t === 'vsrc')                           return 'VoltageSource';
  if (t === 'currentsource' || t === 'isource' || t === 'isrc')                           return 'CurrentSource';
  return type;
}

function kindOf(comp: CircuitComponent): string {
  const normalized = normalizeType(comp.type);
  if (normalized !== comp.type) return normalized;

  // Secondary heuristics for netlists that use non-standard type labels.
  const rawType = (comp.type ?? '').toLowerCase();
  const name    = (comp.name ?? '').toLowerCase();
  const nodeCnt = comp.nodes?.length ?? 0;

  if (name.startsWith('m') || name.startsWith('q'))                     return 'Mosfet';
  if (rawType.includes('fet') || rawType.includes('transistor') || rawType.includes('bjt')) return 'Mosfet';
  if (nodeCnt >= 3 && nodeCnt <= 4 && normalized === comp.type)         return 'Mosfet';

  return normalized;
}

// ─── Layout ────────────────────────────────────────────────────────────────
// BFS-based 2D placement: voltage/current sources are roots (column 0),
// then each connected component is placed one column further right.
// This prevents everything collapsing into a single vertical stack.

export function computeLayout(comps: CircuitComponent[]): CompPos {
  if (comps.length === 0) return {};

  // Build adjacency from shared nodes
  const adjacency = new Map<string, Set<string>>();
  comps.forEach(c => adjacency.set(c.name, new Set()));

  const nodeIndex = new Map<string, string[]>();
  comps.forEach(comp => {
    comp.nodes.forEach(nid => {
      if (!nodeIndex.has(nid)) nodeIndex.set(nid, []);
      nodeIndex.get(nid)!.push(comp.name);
    });
  });
  nodeIndex.forEach(names => {
    for (let i = 0; i < names.length; i++)
      for (let j = i + 1; j < names.length; j++) {
        adjacency.get(names[i])?.add(names[j]);
        adjacency.get(names[j])?.add(names[i]);
      }
  });

  const COL_GAP = 220;
  const ROW_GAP = 180;

  const roots = comps.filter(c =>
    kindOf(c) === 'VoltageSource' || kindOf(c) === 'CurrentSource'
  );

  const ordered: string[]        = [];
  const visited  = new Set<string>();
  const level    = new Map<string, number>();

  const enqueue = (name: string, lvl: number) => {
    if (visited.has(name)) return;
    visited.add(name);
    level.set(name, lvl);
    ordered.push(name);
    [...(adjacency.get(name) ?? [])].sort().forEach(n => enqueue(n, lvl + 1));
  };

  roots.forEach(r => enqueue(r.name, 0));
  comps.forEach(c => enqueue(c.name, level.get(c.name) ?? 0));

  const colCounts = new Map<number, number>();
  const pos: CompPos = {};

  ordered.forEach(name => {
    const col = level.get(name) ?? 0;
    const row = colCounts.get(col) ?? 0;
    colCounts.set(col, row + 1);
    pos[name] = { x: 120 + col * COL_GAP, y: 120 + row * ROW_GAP };
  });

  return pos;
}

// ─── Terminal positions ────────────────────────────────────────────────────
// Returns the SVG coordinate of a component's idx-th pin.
// Resistor/Inductor/Capacitor use left/right terminals so they connect
// naturally in a horizontal BFS layout.

export function terminalPoint(comp: CircuitComponent, idx: number, pos: CompPos): Point {
  const p = pos[comp.name] ?? { x: 0, y: 0 };
  switch (kindOf(comp)) {
    case 'Resistor': case 'Inductor': case 'Capacitor':
      return idx === 0 ? { x: p.x - 32, y: p.y } : { x: p.x + 32, y: p.y };
    case 'VoltageSource': case 'CurrentSource':
      return idx === 0 ? { x: p.x, y: p.y - 38 } : { x: p.x, y: p.y + 38 };
    case 'Mosfet':
      if (idx === 0) return { x: p.x + 22, y: p.y - 40 };  // Drain  (top-right)
      if (idx === 1) return { x: p.x - 40, y: p.y };        // Gate   (left)
      return             { x: p.x + 22, y: p.y + 40 };      // Source (bottom-right)
    default:
      return idx === 0 ? { x: p.x - 22, y: p.y } : { x: p.x + 22, y: p.y };
  }
}

// ─── Wire routing ──────────────────────────────────────────────────────────

const rnd = (v: number) => Math.round(v * 10) / 10;

function lRoute(a: Point, b: Point): string {
  if (Math.abs(a.x - b.x) < 2) return `M${rnd(a.x)},${rnd(a.y)} L${rnd(b.x)},${rnd(b.y)}`;
  if (Math.abs(a.y - b.y) < 2) return `M${rnd(a.x)},${rnd(a.y)} L${rnd(b.x)},${rnd(b.y)}`;
  return `M${rnd(a.x)},${rnd(a.y)} L${rnd(a.x)},${rnd(b.y)} L${rnd(b.x)},${rnd(b.y)}`;
}

// Builds an SVG path that connects all terminals on a shared node.
// Uses a vertical spine at the median X so wires branch left AND right,
// rather than collapsing into a single straight line.
function buildNodeWirePath(pts: Point[]): string {
  if (pts.length < 2) return '';
  if (pts.length === 2) return lRoute(pts[0], pts[1]);

  const xs   = pts.map(p => p.x).sort((a, b) => a - b);
  const busX = xs[Math.floor(xs.length / 2)];
  const minY = Math.min(...pts.map(p => p.y));
  const maxY = Math.max(...pts.map(p => p.y));

  let d = `M${rnd(busX)},${rnd(minY)} L${rnd(busX)},${rnd(maxY)}`;
  pts.forEach(p => {
    if (Math.abs(p.x - busX) > 2)
      d += ` M${rnd(p.x)},${rnd(p.y)} L${rnd(busX)},${rnd(p.y)}`;
  });
  return d;
}

// ─── Component ─────────────────────────────────────────────────────────────

@Component({
  selector: 'circuit-graph',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'CircuitGraphViewModel.html',
  styleUrl: 'CircuitGraphViewModel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircuitGraphViewModel implements OnInit, AfterViewInit, OnDestroy {

  readonly json = input.required<string>();

  @ViewChild('svgRoot') svgRootRef!: ElementRef<SVGGElement>;
  @ViewChild('svgEl')   svgElRef!:   ElementRef<SVGSVGElement>;

  protected comps   = signal<CircuitComponent[]>([]);
  protected pos     = signal<CompPos>({});
  protected selComp = signal<string | null>(null);
  protected xfm     = signal({ x: 0, y: 0, s: 1 });

  // ── Wire computation ─────────────────────────────────────────────────────
  // Re-runs automatically whenever pos() or comps() changes (e.g. on drag).

  protected wires = computed<WireData>(() => {
    const comps = this.comps();
    const pos   = this.pos();

    // Build a map: nodeId → list of (component, terminalIndex) pairs
    const nodeMap = new Map<string, { comp: CircuitComponent; idx: number }[]>();
    comps.forEach(comp => {
      comp.nodes.forEach((nid, idx) => {
        if (!nodeMap.has(nid)) nodeMap.set(nid, []);
        const list = nodeMap.get(nid)!;
        if (!list.find(e => e.comp.name === comp.name && e.idx === idx))
          list.push({ comp, idx });
      });
    });

    const ptsFor = (nid: string): Point[] =>
      (nodeMap.get(nid) ?? []).map(e => terminalPoint(e.comp, e.idx, pos));

    // ── GND rail ──────────────────────────────────────────────────────────
    const gndPts   = ptsFor('0');
    const gndBusY  = gndPts.length ? Math.max(...gndPts.map(p => p.y)) + 50 : 600;
    const gndXs    = gndPts.map(p => p.x);
    const gndBusX1 = (gndXs.length ? Math.min(...gndXs) : 0) - 50;
    const gndBusX2 = (gndXs.length ? Math.max(...gndXs) : 0) + 50;

    // ── VDD rail ──────────────────────────────────────────────────────────
    // The VDD node is the positive terminal (nodes[0]) of any voltage/current
    // source that is NOT itself connected to GND ("0").
    // We do NOT use the dc_value string — that heuristic is too fragile.
    const powerSources = comps.filter(c =>
      kindOf(c) === 'VoltageSource' || kindOf(c) === 'CurrentSource'
    );
    const vddNodeId = powerSources
      .map(c => c.nodes[0])
      .find(nid => nid && nid !== '0');

    // ptsFor(vddNodeId) returns terminal coords for EVERY component on that node,
    // including the source's own positive pin — so a drop is drawn for it too.
    const vddPts   = vddNodeId ? ptsFor(vddNodeId) : [];
    const vddBusY  = vddPts.length ? Math.min(...vddPts.map(p => p.y)) - 30 : -100;
    const vddXs    = vddPts.map(p => p.x);
    const vddBusX1 = (vddXs.length ? Math.min(...vddXs) : 0) - 50;
    const vddBusX2 = (vddXs.length ? Math.max(...vddXs) : 0) + 50;

    // ── Signal wires ──────────────────────────────────────────────────────
    // GND and VDD nodes are rendered as special rails above/below;
    // all other shared nodes get orthogonal signal wires.
    const nodePaths: NodePath[] = [];
    nodeMap.forEach((entries, nid) => {
      if (nid === '0' || nid === vddNodeId) return;
      const pts = entries.map(e => terminalPoint(e.comp, e.idx, pos));
      if (pts.length < 2) return;
      const first = pts[0];
      nodePaths.push({
        id:        nid,
        d:         buildNodeWirePath(pts),
        junctions: pts.length >= 3 ? pts : [],
        labelX:    first.x + 6,
        labelY:    first.y - 6,
      });
    });

    return {
      nodePaths,
      gndBusX1, gndBusX2, gndBusY,
      gndCentreX: (gndBusX1 + gndBusX2) / 2,
      gndDrops:   gndPts,
      vddBusX1,  vddBusX2, vddBusY,
      vddCentreX: (vddBusX1 + vddBusX2) / 2,
      vddDrops:   vddPts,
      vddLabelX:  vddBusX1 - 6,
    };
  });

  protected readonly WIRE_SIGNAL = WIRE_SIGNAL;
  protected readonly WIRE_VDD    = WIRE_VDD;
  protected readonly WIRE_GND    = WIRE_GND;

  // ── Pan / drag state ─────────────────────────────────────────────────────

  private panActive  = false;
  private panStart   = { x: 0, y: 0 };
  private panOrigin  = { x: 0, y: 0 };
  private dragState: { name: string; startMx: number; startMy: number; startCx: number; startCy: number } | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private fitted     = false;  // ensures fitAll fires exactly once on init

  protected panningState = signal(false);
  protected isPanning    = this.panningState.asReadonly();

  constructor(private zone: NgZone) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit() {
    const parsed: { components: CircuitComponent[] } = JSON.parse(this.json());
    this.comps.set(parsed.components);
    this.pos.set(computeLayout(parsed.components));
  }

  ngAfterViewInit() {
    const container = this.svgElRef?.nativeElement;
    if (!container) return;

    // ResizeObserver fires as soon as the element has non-zero dimensions.
    // The `fitted` guard ensures we auto-fit exactly once — not on every
    // subsequent resize (which would undo the user's pan/zoom).
    this.resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0 && !this.fitted) {
        this.fitted = true;
        this.zone.run(() => this.fitAll());
      }
    });
    this.resizeObserver.observe(container);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  // ── Template helpers ─────────────────────────────────────────────────────

  protected color(comp: CircuitComponent): string {
    return TYPE_COLORS[kindOf(comp)] ?? TYPE_COLORS['default'];
  }

  protected normalizedType(comp: CircuitComponent): string {
    return kindOf(comp);
  }

  protected componentBodyFill(): string {
    return document.documentElement.classList.contains('dark')
      ? 'rgba(245, 178, 107, 0.16)' : '#ffffff';
  }

  protected selectionFill(): string {
    return document.documentElement.classList.contains('dark')
      ? 'rgba(245, 178, 107, 0.14)' : '#ffffff';
  }

  protected compPos(name: string): Point {
    return this.pos()[name] ?? { x: 0, y: 0 };
  }

  protected svgTransform(): string {
    const { x, y, s } = this.xfm();
    return `translate(${x},${y}) scale(${s})`;
  }

  protected zoomLabel(): string {
    return Math.round(this.xfm().s * 100) + '%';
  }

  protected selectedData(): CircuitComponent | null {
    const name = this.selComp();
    return name ? (this.comps().find(c => c.name === name) ?? null) : null;
  }

  protected valueEntries(comp: CircuitComponent): { k: string; v: string }[] {
    return comp.values ? Object.entries(comp.values).map(([k, v]) => ({ k, v })) : [];
  }

  protected readonly resistorPoints = '0,-16 -9,-12 9,-8 -9,-4 9,0 -9,4 9,8 -9,12 0,16';

  // ── Interaction ──────────────────────────────────────────────────────────

  protected onCompMouseDown(e: MouseEvent, name: string) {
    e.stopPropagation();
    e.preventDefault();
    const p = this.pos()[name];
    this.dragState = { name, startMx: e.clientX, startMy: e.clientY, startCx: p.x, startCy: p.y };
    this.selComp.set(name);
  }

  protected onSvgMouseDown(e: MouseEvent) {
    if ((e.target as Element).closest('[data-comp]')) return;
    e.preventDefault();  // prevents text-selection interfering with drag
    this.panActive = true;
    this.panningState.set(true);
    this.panStart  = { x: e.clientX, y: e.clientY };
    this.panOrigin = { x: this.xfm().x, y: this.xfm().y };
  }

  protected onMouseMove(e: MouseEvent) {
    if (this.dragState) {
      const s  = this.xfm().s;
      const dx = (e.clientX - this.dragState.startMx) / s;
      const dy = (e.clientY - this.dragState.startMy) / s;
      this.pos.update(p => ({
        ...p,
        [this.dragState!.name]: {
          x: Math.round((this.dragState!.startCx + dx) / SNAP) * SNAP,
          y: Math.round((this.dragState!.startCy + dy) / SNAP) * SNAP,
        },
      }));
      return;
    }
    if (this.panActive) {
      this.xfm.update(t => ({
        ...t,
        x: this.panOrigin.x + (e.clientX - this.panStart.x),
        y: this.panOrigin.y + (e.clientY - this.panStart.y),
      }));
    }
  }

  protected onMouseUp() {
    this.dragState = null;
    this.panActive = false;
    this.panningState.set(false);
  }

  protected onWheel(e: WheelEvent) {
    e.preventDefault();
    const rect   = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mx     = e.clientX - rect.left;
    const my     = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    this.xfm.update(t => {
      const ns = Math.max(0.12, Math.min(6, t.s * factor));
      return { x: mx - (mx - t.x) * (ns / t.s), y: my - (my - t.y) * (ns / t.s), s: ns };
    });
  }

  protected resetView() { this.xfm.set({ x: 0, y: 0, s: 1 }); }

  protected zoomIn()  { this.zoomBy(1.15); }
  protected zoomOut() { this.zoomBy(0.87); }

  private zoomBy(factor: number) {
    const svg = this.svgElRef?.nativeElement;
    if (!svg) return;
    const cx = svg.clientWidth  / 2;
    const cy = svg.clientHeight / 2;
    this.xfm.update(t => {
      const ns = Math.max(0.2, Math.min(4, t.s * factor));
      return { x: cx - (cx - t.x) * (ns / t.s), y: cy - (cy - t.y) * (ns / t.s), s: ns };
    });
  }

  protected fitAll(): void {
    const root = this.svgRootRef?.nativeElement;
    const svg  = this.svgElRef?.nativeElement;
    if (!root || !svg) return;
    root.setAttribute('transform', 'translate(0,0) scale(1)');
    try {
      const bb = root.getBBox();
      if (!bb.width || !bb.height) return;
      const W = svg.clientWidth;
      const H = svg.clientHeight;
      if (!W || !H) return;
      const pad = 40;
      const s   = Math.min((W - pad * 2) / bb.width, (H - pad * 2) / bb.height);
      this.xfm.set({
        x: (W - bb.width  * s) / 2 - bb.x * s,
        y: (H - bb.height * s) / 2 - bb.y * s,
        s,
      });
    } catch (_) {}
  }

  protected deselectAll() { this.selComp.set(null); }
}