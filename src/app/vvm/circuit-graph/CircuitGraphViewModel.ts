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
  const parsed = JSON.parse(this.json());
  // Adjust the key if your JSON uses a different top‑level name (e.g., "main" or "components")
  const components = parsed["components"] as GraphJson[];

  // 1. Collect all unique net names (every string in any component's "nodes")
  const netSet = new Set<string>();
  components.forEach(comp => {
    comp.nodes.forEach(net => netSet.add(net));
  });

  // 2. Create a node for every net (connection points)
  const netNodes: Node[] = Array.from(netSet).map(net => ({
    id: net,
    label: net,
    data: { type: 'net' }          // mark as a net
  }));

  const graphEdges: Edge[] = [];
  const componentNodes: Node[] = [];   // nodes for each component

  // 3. Process each component – all become component nodes
  components.forEach(comp => {
    // Create a unique node ID for the component (prefix to avoid collisions with nets)
    const compNodeId = `comp_${comp.name}`;
    componentNodes.push({
      id: compNodeId,
      label: `${comp.name}`,
      data: {
        type: 'component',           // mark as a component
        componentType: comp.type,
        values: comp.values
      }
    });

    // Connect the component node to each of its nets (one edge per terminal)
    comp.nodes.forEach((net, idx) => {
      graphEdges.push({
        source: compNodeId,           // from component
        target: net,                  // to net

      });
    });
  });

  // 4. Combine all nodes (net nodes + component nodes)
  this.nodes.set([...netNodes, ...componentNodes]);
  this.links.set(graphEdges);
}

}
