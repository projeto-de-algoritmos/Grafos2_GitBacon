import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable, of, Subject } from "rxjs";
import { SigaaService } from "./service/sigaa.service";
import { SigaaComponent } from "./model/sigaaComponent";
import { TitleCasePipe } from "@angular/common";
import { SearchComponent } from "./components/search/search.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  @ViewChild(SearchComponent) searchComponent!: SearchComponent;

  public loadingDpt = true;

  public components: SigaaComponent[] = [];
  public departments: string[] = [];

  public lblComponentA = "componentSource";
  public lblComponentB = "componentTarget";

  public departmentA?: string;
  public departmentB?: string;

  public componentsListSource: SigaaComponent[] = [];
  public componentsListTarget: SigaaComponent[] = [];

  // @TODO:!!!!!!!!!!!! MUDAR PARA FALSE!!!!!!!!!!!!!!!
  public showSearch = true;

  public compTeste = {
    codigo: "FGA0158",
    nome: "ORIENTAÇÃO A OBJETOS",
    carga_horaria: 60,
    eh_requisito_de: ["FGA0138", "FGA0171", "FGA0413"],
    pre_requisitos: ["CIC0004", "CIC0007"],
  } as SigaaComponent;

  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private sigaaService: SigaaService
  ) {
    this.form = this.formBuilder.group({
      componentSource: [
        this.compTeste,
        { disabled: true, validators: [Validators.required] },
      ],
      componentTarget: [
        this.compTeste,
        { disabled: true, validators: [Validators.required] },
      ],
    });
  }

  async ngOnInit() {
    this.departments = (await this.sigaaService.getDepartments()).map((el) =>
      el.replace(".json", "")
    );
    this.loadingDpt = false;
  }

  public displayFunction(component: any) {
    if (component && component.nome)
      return new TitleCasePipe().transform(component.nome);
    return "";
  }

  public async handleSelection(formControlName: string) {
    if (formControlName == this.lblComponentA) {
      if (this.departmentA) {
        this.componentsListSource =
          await this.sigaaService.getPromiseFromDepartment(this.departmentA);
        this.form.get(this.lblComponentA)?.enable;
      }
    }
  }

  get componentSource() {
    return this.form?.get(this.lblComponentA)?.value;
  }

  public validate(variableName: string) {
    if (variableName == this.lblComponentA) {
      return (
        this.departmentA != undefined && this.componentsListSource.length > 0
      );
    } else
      return (
        this.departmentB != undefined && this.componentsListTarget.length > 0
      );
  }

  public stop() {
    this.notify("Encerrando a busca, aguarde.", true);
    // this.searchComponent.stop = true;
    // this.searchComponent.messages.push("Stopping search...");
  }

  public notify(msg: string, isError = false) {
    const emoji = isError ? "⚠️" : "✅";
    const message = `${emoji} ${msg}`;
    this.snackBar.open(message, "Fechar", { duration: 2000 });
  }

  protected readonly localStorage = localStorage;
}
