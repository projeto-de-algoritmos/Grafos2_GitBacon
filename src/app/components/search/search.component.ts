import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SigaaComponent } from "src/app/model/sigaaComponent";
import { SigaaService } from "src/app/service/sigaa.service";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.scss"],
})
export class SearchComponent implements OnChanges {
  @Input() public componentA!: SigaaComponent | undefined;
  @Input() public componentB!: SigaaComponent | undefined;

  @Input() maxLevel: number = 6;

  // @TODO: MUDAR PARA FALSE
  public showResults: boolean = true;

  public path?: SigaaComponent[];
  public messages: string[] = [];
  public stop: boolean = false;

  public distance?: number = undefined;

  private visitedDepartments = new Set();

  private graph = new Map<string, SigaaComponent>();

  constructor(private snackBar: MatSnackBar, private service: SigaaService) {}

  public getLastMessages(qtd?: number): string[] {
    if (qtd) return this.formatArray(this.messages, qtd);
    return this.messages;
  }

  private formatArray(array: any[], qtd = 7): any[] {
    if (array.length > qtd) {
      const start = array.length - qtd + 1;
      return [array[0], array[1], "...", ...array.slice(start)];
    }
    return array;
  }

  msg(...data: any[]) {
    this.messages.push(`<p>${data.toString()}</p>`);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.start();
  }

  private getComponentDepartment(component: SigaaComponent) {
    return component.codigo.substring(0, 3);
  }

  private getComponentCodigo(codigo: string) {
    return codigo.substring(0, 3);
  }

  private loadDpt(component: SigaaComponent) {
    let codA = this.getComponentDepartment(component);
    if (codA in this.visitedDepartments) {
      this.service.getComponentsFromDepartment(codA).subscribe((data) => {
        for (let c of data) {
          this.graph.set(c.codigo!, c);
        }
        this.visitedDepartments.add(codA);
        console.log(this.visitedDepartments);
      });
    }
  }

  start() {
    if (this.componentA) this.loadDpt(this.componentA);
    if (this.componentB) this.loadDpt(this.componentB);

    this.getPreRequisitos(this.componentA!);
    // this.dijkstra().then((path) => {
    //   this.path = path;
    // });
  }

  public notify(msg: string, isError = false) {
    const emoji = isError ? "⚠️" : "✅";
    const message = `${emoji} ${msg}`;
    this.snackBar.open(message, "Fechar", { duration: 2000 });
  }

  private handleError(e: HttpErrorResponse, inputValue: string) {
    if (e.status == 404)
      this.notify(`Component ${inputValue} não encontrado.`, true);
    else
      this.notify(
        `Erro ao buscar a matéria ${inputValue}. Descrição: ${e.message}`,
        true
      );
  }

  private getPreRequisitos(component: SigaaComponent): SigaaComponent[] {
    for (let m of component.pre_requisitos!) {
      let dpt = this.getComponentCodigo(m);
      console.log(this.graph);
      console.log(this.graph.get(m));

      console.log(dpt);
    }
    return [];
  }

  async old_alg(): Promise<SigaaComponent[]> {
    if (!this.componentA || !this.componentB) return [];
    try {
      // Variables used in messages formatting
      let qtdVisitedComponents: number = 0;
      let visitedComponents: SigaaComponent[] = [];

      type no = { component: SigaaComponent; path: SigaaComponent[] };

      // Variables
      let startNode: no = {
        component: this.componentA,
        path: [this.componentA],
      };
      let queue = [startNode];
      let visited = new Set();
      let level = 0;
      let targetUser = null;
      let currentNeighbor = undefined;

      // Functions
      const isTarget = (currentNode?: no) => {
        return currentNode ? currentNode.component == this.componentB : false;
      };

      const visit = (user?: no) => {
        if (!visited.has(user)) visitedComponents.push(user!.component);
        qtdVisitedComponents++;
        this.msg(`Visiting component: ${
          user?.component.codigo
        } | Current level: L${level < 0 ? 0 : level} <br/>
                            Visited SIGAA ${qtdVisitedComponents} component(s) until now: 
                            [${this.formatArray(visitedComponents, 3)}]`);
        visited.add(user);
      };

      // Algorithm
      if (isTarget(startNode)) {
        this.msg(`Found path between 
                                    ${this.componentA.codigo} and ${this.componentB.codigo}<br/>
                                    [${startNode}]`);
        this.msg("Rendering results...");
        return [startNode.component];
      }

      while (queue.length > 0 && level <= this.maxLevel && !this.stop) {
        let currentUser = queue.shift()!;
        visit(currentUser);
        if (this.stop) {
          this.messages.push("Stopped search!");
          return [];
        }
        let neighbors: any[] = [];
        let page = 1;
        let response;
        // while (page <= this.maxFollowersToVisitPerl) {
        //   response = await this.service
        //     .getFollowing(currentUser.component, page++, this.providedToken)
        //     .toPromise()
        //     .catch((error) => this.handleError(error, currentUser.component));
        //   console.log(response);
        //   neighbors.push(...response!);
        //   if (response!.length < 100) break;
        //   if (response!.length == 0) break;
        // }

        for (currentNeighbor of neighbors!.map((viz: any) => ({
          component: viz.component,
          path: [viz.component],
        }))!) {
          if (this.stop) {
            this.messages.push("Stopped search!");
            return [];
          }
          currentNeighbor.path = [
            ...currentUser!.path,
            ...currentNeighbor.path,
          ];
          level = currentNeighbor.path.length - 1;
          if (
            !visited.has(currentNeighbor) &&
            !(queue.indexOf(currentNeighbor) != -1)
          ) {
            if (isTarget(currentNeighbor)) {
              targetUser = currentNeighbor;
              break;
            }
            queue.push(currentNeighbor);
          }
        }
        if (isTarget(currentNeighbor)) break;
      }
      if (this.stop) {
        this.messages.push("Stopped search!");
        return [];
      }
      if (level >= this.maxLevel || targetUser == null) {
        this.msg(`No path was found between 
                                    ${this.componentA} and ${this.componentB} 
                                   within ${this.maxLevel} degrees. :( `);
        return [];
      } else {
        this.msg(`Found path between 
                                    ${this.componentA} and ${
          this.componentB
        }<br/>
                                    ${targetUser.path.join(" ➜ ")}`);
        this.msg("Rendering results...");
        this.distance = level;
        this.showResults = true;
        return targetUser.path;
      }
    } catch (e) {
      this.notify("Ocorreu um erro ao realizar a busca.", true);
      return [];
    }
  }

  async dijkstra(origin: SigaaComponent, target: SigaaComponent) {
    let candidatos = new MinHeap<SigaaComponent>(
      (a: SigaaComponent, b: SigaaComponent) => {
        return a.carga_horaria! > b.carga_horaria! ? 1 : -1;
      }
    );

    let mancha = new Map<string, SigaaComponent>();
    mancha.set(origin.codigo, origin);
    console.log(mancha);
  }
}

class MinHeap<T> {
  private heap: T[];
  private compareFn: (a: T, b: T) => number;

  constructor(compareFn: (a: T, b: T) => number) {
    this.heap = [];
    this.compareFn = compareFn;
  }

  private getLeftChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 1;
  }

  private getRightChildIndex(parentIndex: number): number {
    return 2 * parentIndex + 2;
  }

  private getParentIndex(childIndex: number): number {
    return Math.floor((childIndex - 1) / 2);
  }

  private hasLeftChild(index: number): boolean {
    return this.getLeftChildIndex(index) < this.heap.length;
  }

  private hasRightChild(index: number): boolean {
    return this.getRightChildIndex(index) < this.heap.length;
  }

  private hasParent(index: number): boolean {
    return this.getParentIndex(index) >= 0;
  }

  private leftChild(index: number): T {
    return this.heap[this.getLeftChildIndex(index)];
  }

  private rightChild(index: number): T {
    return this.heap[this.getRightChildIndex(index)];
  }

  private parent(index: number): T {
    return this.heap[this.getParentIndex(index)];
  }

  private swap(index1: number, index2: number): void {
    [this.heap[index1], this.heap[index2]] = [
      this.heap[index2],
      this.heap[index1],
    ];
  }

  private heapifyUp(): void {
    let index = this.heap.length - 1;
    while (
      this.hasParent(index) &&
      this.compareFn(this.heap[index], this.parent(index)) < 0
    ) {
      const parentIndex = this.getParentIndex(index);
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private heapifyDown(): void {
    let index = 0;
    while (this.hasLeftChild(index)) {
      let smallerChildIndex = this.getLeftChildIndex(index);
      if (
        this.hasRightChild(index) &&
        this.compareFn(this.rightChild(index), this.leftChild(index)) < 0
      ) {
        smallerChildIndex = this.getRightChildIndex(index);
      }

      if (this.compareFn(this.heap[index], this.heap[smallerChildIndex]) < 0) {
        break;
      } else {
        this.swap(index, smallerChildIndex);
      }

      index = smallerChildIndex;
    }
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public peek(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.heap[0];
  }

  public add(item: T): void {
    this.heap.push(item);
    this.heapifyUp();
  }

  public poll(): T | null {
    if (this.isEmpty()) {
      return null;
    }

    const item = this.heap[0];
    this.heap[0] = this.heap.pop()!;

    this.heapifyDown();
    return item;
  }

  public toArray(): T[] {
    return [...this.heap];
  }
}
