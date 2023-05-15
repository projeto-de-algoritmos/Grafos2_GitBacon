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
  public loadingComp = false;

  public components: SigaaComponent[] = [];
  public departments: string[] = [];

  public lblComponentA = "componentSource";
  public lblDepartment = "departmentSource";
  public departmentA?: string;

  public componentsListSource: SigaaComponent[] = [];

  public showSearch = false;
  public disableComponentImput = true;

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
      departmentSource: [null, { validators: [Validators.required] }],
    });
  }

  async ngOnInit() {
    this.departments = (await this.sigaaService.getDepartments()).map((el) =>
      el.replace(".json", "")
    );

    this.loadingDpt = false;

    this.form
      .get(this.lblDepartment)
      ?.statusChanges.subscribe(async (status) => {
        if (status == "VALID") {
          this.loadingComp = true;
          let dep = this.form.get(this.lblDepartment)?.value!;
          this.componentsListSource =
            await this.sigaaService.getPromiseFromDepartment(dep);

          this.loadingComp = false;
          this.form.get(this.lblComponentA)?.enable;
        }
      });
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

  public async getComponents() {
    return await this.sigaaService.getPromiseFromDepartment(
      this.form.get(this.lblDepartment)?.value
    );
  }

  get componentSource() {
    return this.form?.get(this.lblComponentA)?.value;
  }

  public validate(variableName: string) {
    return (
      this.departmentA != undefined && this.componentsListSource.length > 0
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
}
