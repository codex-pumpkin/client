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

    const graphNodes: Node[] = nodes.map((node, index) => ({
      id: index.toString(),
      label: node.name
    }))

    const biEdges: Edge[] = []
    nodes.forEach(node => {
      if(node.nodes.length != 2) {
        return
      }

      const edge: Edge = {
        source: node.nodes[0],
        target: node.nodes[1]
      }
      biEdges.push(edge)
    })

    this.nodes.set(graphNodes)
    this.links.set(biEdges)
  }

}
