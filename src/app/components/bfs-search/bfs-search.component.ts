import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SigaaComponent } from "../../model/sigaaComponent";

type no = { login: string; path: any[] };

@Component({
  selector: "app-bfs-search",
  templateUrl: "./bfs-search.component.html",
  styleUrls: ["./bfs-search.component.scss"],
})
export class BfsSearchComponent implements OnChanges {
  @Input() public userOrigin?: string;
  @Input() public userTarget?: string;

  @Input() public componentA!: SigaaComponent | undefined;
  @Input() public componentB!: SigaaComponent | undefined;
  @Input() maxLevel: number = 6;
  @Input() maxFollowersToVisitPerUser: number = 10;
  @Input() providedToken: string = "";
  public showResults: boolean = false;
  public path?: string[];
  public messages: string[] = [];
  public stop: boolean = false;

  public kevinBaconNumber?: number = undefined;

  constructor(private snackBar: MatSnackBar) {}

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

  start() {
    this.bfs().then((path) => {
      this.path = path;
    });
  }

  public notify(msg: string, isError = false) {
    const emoji = isError ? "⚠️" : "✅";
    const message = `${emoji} ${msg}`;
    this.snackBar.open(message, "Fechar", { duration: 2000 });
  }

  private handleError(e: HttpErrorResponse, inputValue: string) {
    if (e.status == 404)
      this.notify(`Usuário ${inputValue} não encontrado no GitHub.`, true);
    else if (e.status == 403)
      this.notify(
        "Limite de acessos à API Rest atingido. Aguarde uma hora para tentar novamente ou forneça um token, clicando no ícone ⚙️.",
        true
      );
    else
      this.notify(
        `Erro ao buscar seguidores do usuário ${inputValue}. Descrição: ${e.message}`,
        true
      );
  }

  async bfs(): Promise<string[]> {
    return [];
  }
}
