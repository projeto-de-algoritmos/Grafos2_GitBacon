import { TitleCasePipe } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { Candidate } from "src/app/model/candidate";
import { MinHeap } from "src/app/model/minHeap";
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
  public path: SigaaComponent[] = [];

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

    const distances: Map<string, number> = new Map();
    const cut: Set<Candidate> = new Set();
    const candidates = new MinHeap();

    distances.set(start.codigo, 0);
    candidates.insert({ node: start, distance: 0, source: null });

    while (candidates.getMin() !== null) {
      const currentNode = candidates.pop()!;
      cut.add(currentNode);
      await this.loadDepartmentsFromRequirements(
        currentNode.node.pre_requisitos
      );
      let requirements: (SigaaComponent | null | undefined)[] =
        currentNode.node.pre_requisitos.map((el) => {
          if (el.indexOf("&") != -1) {
            this.msg(
              `Search for simultaneous requirements aren't implemented yet. (${el}) :(`
            );
            return null;
          } else return this.getComponent(el);
        });

      if (requirements.length == 0) {
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
}
