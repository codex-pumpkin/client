import {Component, input, OnInit, signal} from '@angular/core';
import {Edge, NgxGraphModule, Node} from '@swimlane/ngx-graph';

/**
 * Type we expect the json to conform to.
 */
type GraphJson = {

  /**
   * The node name.
   */
  name: string,

  /**
   * The type of node.
   */
  type: string,

  /**
   * The nodes it is connected to.
   */
  nodes: string[],

  /**
   * The additional values.
   */
  values: any
}

@Component({
  selector: "circuit-graph",
  imports: [
    NgxGraphModule
  ],
  templateUrl: "CircuitGraphViewModel.html",
  styleUrl: "CircuitGraphViewModel.css"
})
export class CircuitGraphViewModel implements OnInit {

  /**
   * The raw json input that should be visualized.
   */
  readonly json = input.required<string>()

  /**
   * The reconstructed edges.
   */
  protected readonly links = signal<Edge[] | null>(null)

  /**
   * The reconstructed nodes.
   */
  protected readonly nodes = signal<Node[] | null>(null)

  ngOnInit() {
    const parsed = JSON.parse(this.json())
    const mainNodes = parsed["main"]
    const nodes = mainNodes as GraphJson[]
    const gnd: GraphJson = { name: "GND", nodes: ["0"], type: "Ground", values: undefined }
    nodes.push(gnd)

    const graphNodes: Node[] = nodes.map((node, index) => ({
      id: node.name,
      label: node.name
    }))

    const nodeNumbers = nodes.map(node => Math.max(...node.nodes.map(node => Number.parseInt(node))))
    // The highest node that exists
    const maxNode = Math.max(...nodeNumbers)
    const edges: Edge[] = []

    for(let i = 0; i <= maxNode; i++) {
      const componentsWithNode = nodes.filter(
        component => component.nodes.includes(i.toString())
      )

      const pairs = getPairs(componentsWithNode)
      pairs.forEach(([src, tgt]) => {
        const edge: Edge = {
          source: src.name,
          target: tgt.name
        }
        edges.push(edge)
      })
    }

    this.nodes.set(graphNodes)
    this.links.set(edges)
  }

}

function getPairs<T>(arr: T[]): [T, T][] {
  const result: [T, T][] = [];

  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      result.push([arr[i], arr[j]]);
    }
  }

  return result;
}
