import { TitleCasePipe } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { SigaaComponent } from "src/app/model/sigaaComponent";
import { SigaaService } from "src/app/service/sigaa.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnChanges {
  @Input() public componentSource!: SigaaComponent | undefined;

  public messages: string[] = [];
  private departments = new Map<string, Map<string, SigaaComponent>>();

  public constructor(private service: SigaaService) {}

  msg(...data: any[]) {
    this.messages.push(`<p>${data.toString()}</p>`);
  }
  public getLastMessages(qtd: number) {
    return this.messages;
  }

  private async loadDepartmentsFromRequirements(requirements: string[]) {
    let deps = new Set<string>();

    for (let r of requirements) deps.add(this.getDepartamentFromCodigo(r));

    for (let dep of deps) {
      if (!this.departments.has(dep)) {
        this.msg(`Loading components from department: ${dep}...`);

        let componentsSet = new Map<string, SigaaComponent>();
        for (let d of await this.service.getPromiseFromDepartment(dep))
          componentsSet.set(d.codigo, d);

        this.departments.set(dep, componentsSet);
      }
    }
  }

  public ngOnChanges(): void {
    this.start();
  }

  public async start() {
    try {
      if (!this.componentSource) return;
      let currNode: SigaaComponent = this.componentSource;

      let mancha = new Map<string, Candidato>();
      let candidatos = new Heap();

      let requirements = currNode.pre_requisitos;

      this.msg(
        `Starting search for component: (${currNode.codigo}) ${currNode.nome}<br/>Requirements: ${requirements}`
      );

      await this.loadDepartmentsFromRequirements(requirements);

      let currCandidate: Candidato = {
        node: currNode,
        distance: 0,
        source: currNode,
      };

      mancha.set(currNode.codigo, currCandidate);

      for (let r of requirements) {
        if (r.indexOf("&") != -1) return;
        let c = this.getComponent(r)!;
        let dest: Candidato = {
          node: c,
          distance: currCandidate.distance + c.carga_horaria,
          source: currCandidate.node,
        };
        this.msg(
          `Visiting component ${this.formatName(dest.node)} (d=${
            dest.distance
          })`
        );
      }
      //   if (
      //     !mancha.has(c.codigo) ||
      //     dest.distance < mancha.get(c.codigo)!.distance
      //   )
      //     mancha.set(c.codigo, dest);

      //   console.log(dest);
      //   candidatos.insert(dest);
      // }
      console.log(candidatos);
    } catch (e) {
      console.log(e);
    }
  }

  // PRIVATE AUXILIARY FUNCTIONS

  private formatName(component: SigaaComponent) {
    return `(${component.codigo}) ${new TitleCasePipe().transform(
      component.nome
    )}`;
  }

  private getDepartmentFromComponent(component: SigaaComponent) {
    return component.codigo.substring(0, 3);
  }

  private getDepartamentFromCodigo(codigo: string) {
    return codigo.substring(0, 3);
  }

  private getComponent(codigo: string) {
    let dep = this.getDepartamentFromCodigo(codigo);
    return this.departments.get(dep)!.get(codigo);
  }

  private getPrerequisitos(codigo: string) {
    this.getComponent(codigo)?.pre_requisitos;
  }

  private getComponentsFromDepartment(dep: string) {}

  // ALGORITHM
}

class Edge {
  public nextNode: SigaaComponent;
  public weight: number;
  constructor(nextNode: SigaaComponent, weight: number) {
    this.nextNode = nextNode;
    this.weight = weight;
  }
}

class Graph {
  public adjacencyList = new Map<SigaaComponent, Edge[]>();

  constructor() {}

  addNode(n: SigaaComponent) {
    this.adjacencyList.set(n, []);
  }

  addEdge(startNode: SigaaComponent, nextNode: SigaaComponent, weight: number) {
    let newEdge = new Edge(nextNode, weight);
    if (!this.adjacencyList.has(startNode)) this.addNode(startNode);
    if (!this.adjacencyList.has(nextNode)) this.addNode(nextNode);
    this.adjacencyList.get(startNode)!.push(newEdge);
  }

  getNodes() {
    return this.adjacencyList.keys();
  }
}

type Candidato = {
  node: SigaaComponent;
  distance: number;
  source: SigaaComponent;
};

class Heap {
  heap: Candidato[] = [];

  lastposition = 1;

  constructor() {
    this.heap.push();
  }

  insert(s: Candidato) {
    this.heap[this.lastposition] = s;
    this.shiftUp(this.lastposition++);
  }

  private swap(indexA: number, indexB: number) {
    const temp = this.heap[indexA];
    this.heap[indexA] = this.heap[indexB];
    this.heap[indexB] = temp;
  }

  private shiftUp(index: number) {
    const pai = this.getPai(index);
    while (pai > 0) {
      if (this.heap[index].distance < this.heap[pai].distance)
        this.swap(index, pai);
      index = pai;
    }
  }

  private heapify(index: number) {
    const left = this.heap[this.getLeftChild(index)];
    const right = this.heap[this.getRightChild(index)];
    const value = this.heap[index];
    while (
      this.getLeftChild(index) <= this.lastposition &&
      this.getRightChild(index) <= this.lastposition
    ) {
      if (left < value && left <= right)
        this.swap(this.getLeftChild(index), index);
      if (right < value && right <= left)
        this.swap(this.getRightChild(index), index);
    }
  }

  public getMin() {
    this.swap(1, this.lastposition);
  }

  private getPai(index: number) {
    return Math.floor(index / 2);
  }

  private getLeftChild(index: number) {
    return 2 * index;
  }

  private getRightChild(index: number) {
    return 2 * index + 1;
  }
}
