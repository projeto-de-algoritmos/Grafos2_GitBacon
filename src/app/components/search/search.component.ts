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
    this.dijkstra(this.componentSource!);
    // this.start();
  }

  private async dijkstra(start: SigaaComponent) {
    let requirements = start.pre_requisitos;
    this.msg(
      `Starting search for component: (${start.codigo}) ${start.nome}<br/>Requirements: ${requirements}`
    );

    await this.loadDepartmentsFromRequirements(requirements);

    const distances: Map<string, number> = new Map();
    const cut: Set<Candidate> = new Set();
    const candidates = new MinHeap();

    distances.set(start.codigo, 0);
    candidates.insert({ node: start, distance: 0, source: null });

    while (candidates.getMin() !== null) {
      const currentNode = candidates.pop()!;
      cut.add(currentNode);
      let requirements: (SigaaComponent | null | undefined)[] =
        currentNode.node.pre_requisitos.map((el) => {
          if (el.indexOf("&") != -1) {
            this.msg(
              `Ainda não implementada a busca em requisitos simultâneos... (${el}) :(`
            );
            return null;
          } else return this.getComponent(el);
        });

      if (requirements.length == 0) {
        console.log(currentNode);
        const p = this.formatPath(currentNode);
        this.msg(p.map((e) => e.nome));
        return p;
      }

      for (const v of requirements) {
        if (v) {
          let x: Candidate = {
            node: v,
            distance: currentNode.distance + v!.carga_horaria,
            source: currentNode,
          };
          console.log(x);
          if (
            !distances.has(x.node.codigo) ||
            distances.get(x.node.codigo)! > x.distance
          )
            distances.set(x.node.codigo, x.distance);

          candidates.insert(x);
        }
      }

      console.log(requirements);
      console.log(currentNode);
      cut.add(currentNode);
    }
    return [];
  }

  // PRIVATE AUXILIARY FUNCTIONS

  private formatPath(c: Candidate) {
    let current: Candidate | null = c;
    let path: SigaaComponent[] = [];
    while (current != null) {
      path.push(current.node);
      current = current.source;
    }
    return path;
  }

  private formatName(component: SigaaComponent) {
    return `(${component.codigo}) ${new TitleCasePipe().transform(
      component.nome
    )}`;
  }

  private getDepartamentFromCodigo(codigo: string) {
    return codigo.substring(0, 3);
  }

  private getComponent(codigo: string) {
    let dep = this.getDepartamentFromCodigo(codigo);
    return this.departments.get(dep)!.get(codigo);
  }

  // ALGORITHM
}

type Candidate = {
  node: SigaaComponent;
  distance: number;
  source: Candidate | null;
};

class MinHeap {
  private heap: Candidate[];

  constructor() {
    this.heap = [];
  }

  public getMin(): Candidate | null {
    if (this.heap.length === 0) {
      return null;
    }
    return this.heap[0];
  }
  public pop(): Candidate {
    this.swap(0, this.heap.length - 1);
    const v = this.heap.pop()!;
    this.bubbleDown(0);
    return v;
  }

  private bubbleDown(index: number): void {
    const leftChildIndex = 2 * index + 1;
    const rightChildIndex = 2 * index + 2;
    let smallestIndex = index;

    if (
      leftChildIndex < this.heap.length &&
      this.heap[leftChildIndex].distance < this.heap[smallestIndex].distance
    ) {
      smallestIndex = leftChildIndex;
    }

    if (
      rightChildIndex < this.heap.length &&
      this.heap[rightChildIndex].distance < this.heap[smallestIndex].distance
    ) {
      smallestIndex = rightChildIndex;
    }

    if (smallestIndex !== index) {
      this.swap(index, smallestIndex);
      this.bubbleDown(smallestIndex);
    }
  }

  public insert(value: Candidate): void {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  private bubbleUp(index: number): void {
    const parentIndex = Math.floor((index - 1) / 2);
    if (
      parentIndex >= 0 &&
      this.heap[parentIndex].distance > this.heap[index].distance
    ) {
      this.swap(parentIndex, index);
      this.bubbleUp(parentIndex);
    }
  }

  private swap(index1: number, index2: number): void {
    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
  }
}
