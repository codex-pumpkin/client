import {
  Component, input, computed,
  ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';


export type SimVariable = {
  name: string;
  values: number[];
};

export type SimulationData = {
  type: string;
  x_axis: SimVariable;
  variables: SimVariable[];
};


@Component({
  selector: 'simulation-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'SimulationResultViewModel.html',
  styleUrl: 'SimulationResultViewModel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulationResultViewModel {

  readonly json = input.required<string>();

  protected readonly result = computed<SimulationData | null>(() => {
    try {
      return JSON.parse(this.json()) as SimulationData;
    } catch {
      return null;
    }
  });

  

  protected readonly activeVar = signal<string | null>(null);

  protected readonly activeVariable = computed<SimVariable | null>(() => {
    const r = this.result();
    if (!r) return null;
    const name = this.activeVar() ?? r.variables[0]?.name ?? null;
    return r.variables.find(v => v.name === name) ?? null;
  });

  protected selectVar(name: string) { this.activeVar.set(name); }

 

  protected readonly CHART_W = 600;
  protected readonly CHART_H = 260;
  protected readonly PAD = { top: 20, right: 20, bottom: 40, left: 72 };

  protected readonly chartPath = computed<string>(() => {
    const v  = this.activeVariable();
    const xs = this.result()?.x_axis.values ?? [];
    if (!v || xs.length === 0) return '';

    const W = this.CHART_W - this.PAD.left - this.PAD.right;
    const H = this.CHART_H - this.PAD.top  - this.PAD.bottom;

    const xMin = xs[0], xMax = xs[xs.length - 1];
    const yMin = Math.min(...v.values), yMax = Math.max(...v.values);
    const xR = (xMax - xMin) || 1, yR = (yMax - yMin) || 1;

    const px = (x: number) => ((x - xMin) / xR) * W;
    const py = (y: number) => H - ((y - yMin) / yR) * H;

    return v.values
      .map((val, i) => `${i === 0 ? 'M' : 'L'}${px(xs[i]).toFixed(2)},${py(val).toFixed(2)}`)
      .join(' ');
  });

  protected readonly yTicks = computed<{ y: number; label: string }[]>(() => {
    const v = this.activeVariable();
    if (!v) return [];
    const H = this.CHART_H - this.PAD.top - this.PAD.bottom;
    const yMin = Math.min(...v.values), yMax = Math.max(...v.values);
    const range = (yMax - yMin) || 1;
    return Array.from({ length: 6 }, (_, i) => ({
      y: H - (i / 5) * H,
      label: this.fmt(yMin + (i / 5) * range)
    }));
  });

  protected readonly xTicks = computed<{ x: number; label: string }[]>(() => {
    const xs = this.result()?.x_axis.values ?? [];
    if (!xs.length) return [];
    const W = this.CHART_W - this.PAD.left - this.PAD.right;
    const xMin = xs[0], xMax = xs[xs.length - 1];
    const range = (xMax - xMin) || 1;
    return Array.from({ length: 6 }, (_, i) => ({
      x: (i / 5) * W,
      label: this.fmt(xMin + (i / 5) * range)
    }));
  });

  protected readonly xAxisLabel = computed<string>(() => {
    const name = this.result()?.x_axis.name ?? '';
    if (name === 'time')      return 'Time (s)';
    if (name === 'frequency') return 'Frequency (Hz)';
    return name;
  });

  protected readonly analysisType = computed<string>(() =>
    (this.result()?.type ?? '').toUpperCase()
  );

  private fmt(v: number): string {
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a >= 1e6)  return (v / 1e6).toPrecision(3)  + 'M';
    if (a >= 1e3)  return (v / 1e3).toPrecision(3)  + 'k';
    if (a < 1e-6)  return (v * 1e9).toPrecision(3)  + 'n';
    if (a < 1e-3)  return (v * 1e6).toPrecision(3)  + 'µ';
    if (a < 1)     return (v * 1e3).toPrecision(3)  + 'm';
    return v.toPrecision(4);
  }
}