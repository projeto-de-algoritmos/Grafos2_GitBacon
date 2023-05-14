import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BfsSearchComponent } from "./components/bfs-search/bfs-search.component";
import { Observable, of, Subject } from "rxjs";
import { SigaaService } from "./service/sigaa.service";
import { SigaaComponent } from "./model/sigaaComponent";
import { TitleCasePipe } from "@angular/common";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  @ViewChild(BfsSearchComponent) bfsSearchComponent!: BfsSearchComponent;

  public loadingDpt = true;

  public components: SigaaComponent[] = [];
  public departments: string[] = [];

  public lblComponentA = "componentSource";
  public lblComponentB = "componentTarget";

  public departmentA?: string;
  public departmentB?: string;

  public componentsListSource: SigaaComponent[] = [];
  public componentsListTarget: SigaaComponent[] = [];

  public showSearch = false;

  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private sigaaService: SigaaService
  ) {
    this.form = this.formBuilder.group({
      componentSource: [
        null,
        { disabled: true, validators: [Validators.required] },
      ],
      componentTarget: [
        null,
        { disabled: true, validators: [Validators.required] },
      ],
    });
  }

  ngOnInit(): void {
    this.sigaaService.getDepartments().then((data: { files: string[] }) => {
      this.departments = data.files.map((file) => file.replace(".json", ""));
      this.loadingDpt = false;
    });
  }

  public getComponents(
    department?: string
  ): Promise<SigaaComponent[] | undefined> | undefined {
    if (department)
      return this.sigaaService
        .getComponentsFromDepartment(department!)
        .toPromise();
    else return undefined;
  }

  public displayFunction(component: any) {
    if (component && component.nome)
      return new TitleCasePipe().transform(component.nome);
    return "";
  }

  public handleSelection(formControlName: string) {
    if (formControlName == this.lblComponentA) {
      if (this.departmentA) {
        this.sigaaService
          .getComponentsFromDepartment(this.departmentA)
          .subscribe((data) => {
            this.componentsListSource = data;
            this.form.get(this.lblComponentA)?.enable;
          });
      }
    } else if (formControlName == this.lblComponentB) {
      if (this.departmentB) {
        this.sigaaService
          .getComponentsFromDepartment(this.departmentB)
          .subscribe((data) => {
            this.componentsListTarget = data;
            this.form.get(this.lblComponentB)?.enable;
          });
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
    this.bfsSearchComponent.stop = true;
    this.bfsSearchComponent.messages.push("Stopping search...");
  }

  public notify(msg: string, isError = false) {
    const emoji = isError ? "⚠️" : "✅";
    const message = `${emoji} ${msg}`;
    this.snackBar.open(message, "Fechar", { duration: 2000 });
  }

  protected readonly localStorage = localStorage;
}
