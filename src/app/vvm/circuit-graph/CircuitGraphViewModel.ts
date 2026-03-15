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
  Resistor:            'var(--cg-type-resistor)',
  VoltageSource:       'var(--cg-type-voltage)',
  CurrentSource:       'var(--cg-type-current)',
  Mosfet:              'var(--cg-type-mosfet)',
  Capacitor:           'var(--cg-type-capacitor)',
  BehavioralCapacitor: 'var(--cg-type-capacitor)',
  Inductor:            'var(--cg-type-inductor)',
  VCCS:                'var(--cg-type-vccs)',
  VCVS:                'var(--cg-type-vcvs)',
  Diode:               'var(--cg-type-diode)',
  BJT:                 'var(--cg-type-bjt)',
  default:             'var(--cg-type-default)',
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
  if (t === 'mosfet' || t === 'nmos' || t === 'pmos' || t === 'fet')      return 'Mosfet';
  if (t === 'bjt'  || t === 'npn'  || t === 'pnp')                        return 'BJT';
  if (t === 'diode' || t === 'd')                                          return 'Diode';
  if (t === 'resistor')                                                    return 'Resistor';
  if (t === 'capacitor')                                                   return 'Capacitor';
  if (t === 'behavioralcapacitor' || t === 'bcap' || t === 'behavioral_capacitor') return 'BehavioralCapacitor';
  if (t === 'inductor')                                                    return 'Inductor';
  if (t === 'voltagesource' || t === 'vsource' || t === 'vsrc')           return 'VoltageSource';
  if (t === 'currentsource' || t === 'isource' || t === 'isrc')           return 'CurrentSource';
  if (t === 'vccs' || t === 'voltage_controlled_current_source')          return 'VCCS';
  if (t === 'vcvs' || t === 'voltage_controlled_voltage_source')          return 'VCVS';
  return type;
}

function kindOf(comp: CircuitComponent): string {
  const normalized = normalizeType(comp.type);
  if (normalized !== comp.type) return normalized;

  const rawType = (comp.type ?? '').toLowerCase();
  const name    = (comp.name ?? '').toLowerCase();
  const nodeCnt = comp.nodes?.length ?? 0;

  // SPICE name prefixes: M=MOSFET, Q=BJT, D=Diode
  if (name.startsWith('m'))                                               return 'Mosfet';
  if (name.startsWith('q'))                                               return 'BJT';
  if (name.startsWith('d') && nodeCnt === 2)                             return 'Diode';
  if (rawType.includes('fet') || rawType.includes('mosfet'))             return 'Mosfet';
  if (rawType.includes('bjt') || rawType.includes('transistor'))         return 'BJT';
  if (rawType.includes('diode'))                                         return 'Diode';
  if (nodeCnt === 3 && normalized === comp.type)                         return 'BJT';
  if (nodeCnt === 4 && normalized === comp.type)                         return 'Mosfet';

  return normalized;
}

// ─── Netlist normalisation ──────────────────────────────────────────────────
// AI generators often emit one VoltageSource per transistor instead of sharing
// a single VDD rail. We detect duplicate sources (same GND terminal, same
// voltage) and merge them: keep the first, rename every node wired to a
// duplicate's positive terminal to the canonical VDD node, then drop the dupe.

export function normalizeNetlist(comps: CircuitComponent[]): CircuitComponent[] {
  const isSrc = (c: CircuitComponent) =>
    kindOf(c) === 'VoltageSource' || kindOf(c) === 'CurrentSource';
  const sources = comps.filter(isSrc);
  if (sources.length <= 1) return comps;

  const dcVal = (c: CircuitComponent): string =>
    String(c.values?.['dc_value'] ?? c.values?.['voltage'] ?? c.values?.['value'] ?? '')
      .replace(/[^0-9.]/g, '');

  // Group sources with same negative node + same (or unknown) voltage
  type Group = { canon: CircuitComponent; dupes: CircuitComponent[] };
  const groups: Group[] = [];
  sources.forEach(src => {
    const neg = src.nodes[1] ?? '0';
    const val = dcVal(src);
    const g   = groups.find(g =>
      (g.canon.nodes[1] ?? '0') === neg &&
      (!dcVal(g.canon) || !val || dcVal(g.canon) === val)
    );
    if (g) g.dupes.push(src); else groups.push({ canon: src, dupes: [] });
  });

  const nodeRename = new Map<string, string>();
  const toRemove   = new Set<string>();
  groups.forEach(({ canon, dupes }) => {
    dupes.forEach(dup => {
      if (dup.nodes[0] && dup.nodes[0] !== canon.nodes[0])
        nodeRename.set(dup.nodes[0], canon.nodes[0]);
      toRemove.add(dup.name);
    });
  });

  if (toRemove.size === 0) return comps;
  const rn = (nid: string) => nodeRename.get(nid) ?? nid;

  return comps
    .filter(c => !toRemove.has(c.name))
    .map(c => ({ ...c, nodes: c.nodes.map(rn) }))
    .filter(c => new Set(c.nodes).size >= 2 || c.nodes.length < 2);
}

// ─── Layout — Sugiyama layered algorithm (ELK/dot style) ─────────────────────
//
// Implements the full 4-phase Sugiyama framework used by ELK, Graphviz dot,
// and dagre — adapted for circuit schematics with domain-aware edge direction
// and vertical pin constraints for transistors.
//
// Phase 1 — Layer assignment (longest-path from sources)
//   • VoltageSource / CurrentSource are pinned to layer 0 (left rail)
//   • Transistors get a priority layer based on their signal-path depth
//   • Every other component gets the maximum layer of its predecessors + 1
//
// Phase 2 — Crossing minimisation (barycenter, 4 forward+backward sweeps)
//   • Within each layer, components are sorted by the average position of
//     their neighbours in the adjacent layer (classic Sugiyama step)
//
// Phase 3 — Coordinate assignment (Brandes–Köpf inspired)
//   • X  = layer index × COL_W, starting from 80
//   • Y  = position within layer, centred around canvas midline (300)
//   • Transistors keep their pin-relative offsets: load-R above drain,
//     source-R below emitter, caps to the right at pin Y
//
// Phase 4 — Post-processing
//   • Grid-snap all coordinates to SNAP px
//   • Vertical re-centre so the layout is visually centred at y = 300

export function computeLayout(comps: CircuitComponent[]): CompPos {
  if (comps.length === 0) return {};

  const SNAP    = 10;
  const COL_W   = 220;   // horizontal gap between layers
  const ROW_H   = 200;   // vertical gap within a layer
  const sg = (v: number) => Math.round(v / SNAP) * SNAP;

  // ── Build directed signal-flow graph ─────────────────────────────────────
  // Edge direction: from the component that DRIVES a node to the one that SINKS it.
  // Heuristic: sources → everything on their output node → transistor gates →
  //            transistor drains → loads.
  // For undirected edges we fall back to shared-node adjacency.

  const nodeMbrs = new Map<string, string[]>();
  comps.forEach(c => c.nodes.forEach(n => {
    if (!nodeMbrs.has(n)) nodeMbrs.set(n, []);
    nodeMbrs.get(n)!.push(c.name);
  }));

  // Build plain adjacency (undirected) for crossing-min and fallback
  const adj = new Map<string, Set<string>>();
  comps.forEach(c => adj.set(c.name, new Set()));
  nodeMbrs.forEach(ns => {
    for (let i = 0; i < ns.length; i++)
      for (let j = i + 1; j < ns.length; j++) {
        adj.get(ns[i])!.add(ns[j]);
        adj.get(ns[j])!.add(ns[i]);
      }
  });

  // Build directed predecessors (for longest-path layering)
  // Direction: source → passive → transistor gate → transistor → load
  const compMap = new Map<string, CircuitComponent>(comps.map(c => [c.name, c]));

  const isTr  = (c: CircuitComponent) => kindOf(c) === 'Mosfet' || kindOf(c) === 'BJT';
  const isSrc = (c: CircuitComponent) => kindOf(c) === 'VoltageSource' || kindOf(c) === 'CurrentSource';
  const isCap = (c: CircuitComponent) => kindOf(c) === 'Capacitor' || kindOf(c) === 'BehavioralCapacitor';
  const isRes = (c: CircuitComponent) => kindOf(c) === 'Resistor' || kindOf(c) === 'Inductor';

  // ── Phase 1: Layer assignment via longest-path from sources ──────────────
  const layer = new Map<string, number>();

  // Pin sources to layer 0
  comps.filter(isSrc).forEach(c => layer.set(c.name, 0));

  // Iteratively assign layer = max(predecessor layers) + 1
  // Run until stable (at most N passes)
  let changed = true;
  for (let pass = 0; pass < comps.length && changed; pass++) {
    changed = false;
    comps.forEach(c => {
      if (isSrc(c)) return;
      const nbLayers = [...(adj.get(c.name) ?? [])]
        .map(nb => layer.get(nb) ?? -1)
        .filter(l => l >= 0);
      if (nbLayers.length === 0) return;
      const candidate = Math.max(...nbLayers) + 1;
      const current   = layer.get(c.name) ?? -1;
      if (candidate > current) {
        layer.set(c.name, candidate);
        changed = true;
      }
    });
  }

  // Anything still unassigned gets layer 1
  comps.forEach(c => { if (!layer.has(c.name)) layer.set(c.name, 1); });

  // Circuit-domain correction:
  // Transistors should always be to the RIGHT of their bias components.
  // If a transistor is at the same layer as its gate-resistor, push transistor right.
  comps.filter(isTr).forEach(t => {
    const gateIdx  = kindOf(t) === 'BJT' ? 0 : 1;
    const gateNode = t.nodes[gateIdx];
    if (!gateNode) return;
    const gateNeighbours = (nodeMbrs.get(gateNode) ?? [])
      .filter(n => n !== t.name)
      .map(n => layer.get(n) ?? 0);
    if (gateNeighbours.length) {
      const minGateLayer = Math.min(...gateNeighbours);
      if ((layer.get(t.name) ?? 0) <= minGateLayer)
        layer.set(t.name, minGateLayer + 1);
    }
  });

  // ── Phase 2: Group into layers, crossing minimisation ────────────────────
  const maxLayer = Math.max(...[...layer.values()]);
  const layers: string[][] = Array.from({ length: maxLayer + 1 }, () => []);
  comps.forEach(c => layers[layer.get(c.name)!].push(c.name));

  // Barycenter sweep: 4 passes (forward then backward twice)
  const barycenter = (names: string[], refLayer: string[], refPos: Map<string, number>): string[] => {
    const scores = names.map(name => {
      const nbs = [...(adj.get(name) ?? [])].filter(n => refLayer.includes(n));
      if (!nbs.length) return { name, score: refPos.get(name) ?? 0 };
      const avg = nbs.reduce((s, n) => s + (refPos.get(n) ?? 0), 0) / nbs.length;
      return { name, score: avg };
    });
    return scores.sort((a, b) => a.score - b.score).map(s => s.name);
  };

  for (let sweep = 0; sweep < 4; sweep++) {
    const forward = sweep % 2 === 0;
    if (forward) {
      for (let li = 1; li <= maxLayer; li++) {
        const refPos = new Map(layers[li - 1].map((n, i) => [n, i]));
        layers[li] = barycenter(layers[li], layers[li - 1], refPos);
      }
    } else {
      for (let li = maxLayer - 1; li >= 0; li--) {
        const refPos = new Map(layers[li + 1].map((n, i) => [n, i]));
        layers[li] = barycenter(layers[li], layers[li + 1], refPos);
      }
    }
  }

  // ── Phase 3: Coordinate assignment ───────────────────────────────────────
  // X = layer * COL_W + LEFT_MARGIN
  // Y = centred within layer around canvas midline MID_Y

  const LEFT_MARGIN = 120;
  const MID_Y       = 300;
  const pos: CompPos = {};

  layers.forEach((names, li) => {
    const x    = LEFT_MARGIN + li * COL_W;
    const h    = (names.length - 1) * ROW_H;
    const topY = MID_Y - h / 2;
    names.forEach((name, ri) => {
      pos[name] = { x: sg(x), y: sg(topY + ri * ROW_H) };
    });
  });

  // ── Phase 4: Circuit-domain vertical pin adjustments ─────────────────────
  // Load resistors snap directly above the transistor drain (same X).
  // Source resistors snap directly below the source/emitter (same X).
  // Bypass caps snap to the right of the transistor at pin Y.

  const LOAD_ABOVE = -170;  // load resistor: px above drain/collector
  const SRC_BELOW  =  160;  // source/emitter resistor: px below
  const CAP_RIGHT  =  190;  // bypass cap: px right of transistor

  const overrides = new Map<string, Point>();

  comps.filter(isTr).forEach(t => {
    const tp = pos[t.name];
    if (!tp) return;

    // Load resistors / inductors ABOVE drain/collector
    const drainNodeIdx = kindOf(t) === 'BJT' ? 1 : 0;
    const drainNode    = t.nodes[drainNodeIdx];
    if (drainNode && drainNode !== '0') {
      (nodeMbrs.get(drainNode) ?? []).filter(n => n !== t.name).forEach((n, i) => {
        const c = compMap.get(n);
        if (c && isRes(c))
          overrides.set(n, { x: sg(tp.x), y: sg(tp.y + LOAD_ABOVE - i * 150) });
      });
    }

    // Source/emitter resistors BELOW
    const srcNode = t.nodes[2];
    if (srcNode && srcNode !== '0') {
      (nodeMbrs.get(srcNode) ?? []).filter(n => n !== t.name).forEach((n, i) => {
        const c = compMap.get(n);
        if (c && isRes(c))
          overrides.set(n, { x: sg(tp.x), y: sg(tp.y + SRC_BELOW + i * 140) });
      });
    }

    // Bypass/coupling caps to the RIGHT at gate/base Y
    const gateNodeIdx = kindOf(t) === 'BJT' ? 0 : 1;
    const gateNode    = t.nodes[gateNodeIdx];
    if (gateNode && gateNode !== '0') {
      (nodeMbrs.get(gateNode) ?? []).filter(n => n !== t.name).forEach((n, i) => {
        const c = compMap.get(n);
        if (c && isCap(c))
          overrides.set(n, { x: sg(tp.x + CAP_RIGHT + i * 170), y: sg(tp.y) });
      });
    }
  });

  overrides.forEach((p, name) => { pos[name] = p; });

  // ── Phase 5: Anchor sources right next to their VDD neighbours ──────────────
  // VoltageSource has vertical terminals (top = VDD node, bottom = GND "0").
  // We must NOT include GND-side neighbours in the positioning — they fan out
  // across the entire circuit and would pull the source far from its real anchor.
  // Instead we only look at the POSITIVE terminal node (nodes[0]) neighbours,
  // find the leftmost of those, and place the source one tight SRC_STEP to its left.
  const SRC_STEP = 120;   // px — tight horizontal gap between source and circuit

  comps.filter(isSrc).forEach(src => {
    const vddNode = src.nodes[0];   // positive terminal node (VDD)
    if (!vddNode) return;

    // Components sharing the VDD node — these are the true neighbours
    const vddNbs = (nodeMbrs.get(vddNode) ?? [])
      .filter(n => n !== src.name && !!pos[n]);

    // Also check GND-side (nodes[1]) as fallback if VDD has no neighbours
    const gndNode = src.nodes[1] ?? '0';
    const gndNbs  = (nodeMbrs.get(gndNode) ?? [])
      .filter(n => n !== src.name && !!pos[n]);

    const relevantNbs = vddNbs.length ? vddNbs : gndNbs;
    if (!relevantNbs.length) return;

    // Y = average of VDD-side neighbours (they sit at the same voltage level)
    const avgNbY = sg(relevantNbs.reduce((s, n) => s + pos[n]!.y, 0) / relevantNbs.length);

    // X = just left of the leftmost VDD neighbour — one SRC_STEP gap
    const minNbX = Math.min(...relevantNbs.map(n => pos[n]!.x));
    const srcX   = sg(minNbX - SRC_STEP);

    pos[src.name] = { x: Math.max(40, srcX), y: avgNbY };
  });

  // ── Final: vertical re-centre so layout is visually centred at MID_Y ──────
  const ys    = Object.values(pos).map(p => p.y);
  const midY  = (Math.min(...ys) + Math.max(...ys)) / 2;
  const shift = sg(MID_Y - midY);
  if (Math.abs(shift) > SNAP)
    Object.keys(pos).forEach(n => { pos[n] = { x: pos[n].x, y: pos[n].y + shift }; });

  return pos;
}


// ─── Terminal positions ────────────────────────────────────────────────────
// Returns the SVG coordinate of a component's idx-th pin.
// Resistor/Inductor/Capacitor use left/right terminals so they connect
// naturally in a horizontal BFS layout.

export function terminalPoint(comp: CircuitComponent, idx: number, pos: CompPos): Point {
  const p = pos[comp.name] ?? { x: 0, y: 0 };
  switch (kindOf(comp)) {
    case 'Resistor': case 'Inductor': case 'Capacitor': case 'BehavioralCapacitor':
      return idx === 0 ? { x: p.x - 32, y: p.y } : { x: p.x + 32, y: p.y };
    case 'VoltageSource': case 'CurrentSource':
      return idx === 0 ? { x: p.x, y: p.y - 38 } : { x: p.x, y: p.y + 38 };
    case 'Diode':
      // Anode (idx 0) left, Cathode (idx 1) right
      return idx === 0 ? { x: p.x - 28, y: p.y } : { x: p.x + 28, y: p.y };
    case 'Mosfet':
      if (idx === 0) return { x: p.x + 22, y: p.y - 40 };  // Drain  (top-right)
      if (idx === 1) return { x: p.x - 40, y: p.y };        // Gate   (left)
      return             { x: p.x + 22, y: p.y + 40 };      // Source (bottom-right)
    case 'BJT':
      if (idx === 0) return { x: p.x - 40, y: p.y };        // Base   (left)
      if (idx === 1) return { x: p.x + 22, y: p.y - 38 };  // Collector (top-right)
      return             { x: p.x + 22, y: p.y + 38 };      // Emitter   (bottom-right)
    case 'VCCS': case 'VCVS':
      if (idx === 0) return { x: p.x - 36, y: p.y - 24 };  // in+
      if (idx === 1) return { x: p.x - 36, y: p.y + 24 };  // in-
      if (idx === 2) return { x: p.x + 36, y: p.y - 24 };  // out+
      return             { x: p.x + 36, y: p.y + 24 };      // out-
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
    // Collect ALL distinct positive-terminal nodes from power sources.
    // After normalizeNetlist there is typically just one, but we stay robust.
    const powerSources = comps.filter(c =>
      kindOf(c) === 'VoltageSource' || kindOf(c) === 'CurrentSource'
    );
    const vddNodeIds = [...new Set(
      powerSources.map(c => c.nodes[0]).filter(nid => nid && nid !== '0')
    )];
    const vddNodeId = vddNodeIds[0] ?? null;

    const vddPts: Point[] = vddNodeIds.flatMap(nid => ptsFor(nid));
    const vddBusY  = vddPts.length ? Math.min(...vddPts.map(p => p.y)) - 30 : -100;
    const vddXs    = vddPts.map(p => p.x);
    const vddBusX1 = (vddXs.length ? Math.min(...vddXs) : 0) - 50;
    const vddBusX2 = (vddXs.length ? Math.max(...vddXs) : 0) + 50;

    // ── Signal wires ──────────────────────────────────────────────────────
    // GND and VDD nodes are rendered as special rails above/below;
    // all other shared nodes get orthogonal signal wires.
    const nodePaths: NodePath[] = [];
    nodeMap.forEach((entries, nid) => {
      if (nid === '0' || vddNodeIds.includes(nid)) return;
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
    const normalized = normalizeNetlist(parsed.components);
    this.comps.set(normalized);
    this.pos.set(computeLayout(normalized));
  }

  ngAfterViewInit() {
    const container = this.svgElRef?.nativeElement;
    if (!container) return;

    // ResizeObserver fires as soon as the element has non-zero dimensions.
    // The `fitted` guard ensures we auto-fit exactly once — not on every
    // subsequent resize (which would undo the user's pan/zoom).
    // We use a double-rAF so Angular's change detection has fully rendered
    // all component symbols into the DOM before we measure getBBox().
    this.resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0 && !this.fitted) {
        this.fitted = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            this.zone.run(() => this.fitAll());
          });
        });
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

  // Returns just the value string for the most meaningful attribute — no key prefix.
  protected primaryValue(comp: CircuitComponent): string | null {
    if (!comp.values) return null;
    const PRIMARY: Record<string, string> = {
      Resistor:            'resistance',
      Capacitor:           'capacitance',
      BehavioralCapacitor: 'capacitance_expression',
      Inductor:            'inductance',
      VoltageSource:       'dc_value',
      CurrentSource:       'dc_value',
      VCCS:                'gain',
      VCVS:                'gain',
      Mosfet:              'width',
      Diode:               'area',
      BJT:                 'area',
    };
    const key = PRIMARY[kindOf(comp)];
    const val = key ? comp.values[key] : null;
    if (val != null) return String(val);
    // Fallback: first available value
    const first = Object.values(comp.values)[0];
    return first != null ? String(first) : null;
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

    // Reset transform so getBBox() measures natural (unscaled) coordinates
    root.setAttribute('transform', 'translate(0,0) scale(1)');

    const attempt = () => {
      try {
        const bb = root.getBBox();
        // If bbox is still empty the DOM hasn't painted yet — retry next frame
        if (!bb.width || !bb.height) {
          requestAnimationFrame(attempt);
          return;
        }
        const W = svg.clientWidth;
        const H = svg.clientHeight;
        if (!W || !H) { requestAnimationFrame(attempt); return; }
        const pad = 48;
        const s   = Math.min((W - pad * 2) / bb.width, (H - pad * 2) / bb.height, 1.5);
        this.xfm.set({
          x: (W - bb.width  * s) / 2 - bb.x * s,
          y: (H - bb.height * s) / 2 - bb.y * s,
          s,
        });
      } catch (_) {}
    };

    requestAnimationFrame(attempt);
  }

  protected deselectAll() { this.selComp.set(null); }
}