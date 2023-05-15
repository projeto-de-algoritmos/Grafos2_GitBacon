import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { SigaaComponent } from "../../model/sigaaComponent";

@Component({
  selector: "app-materia",
  templateUrl: "./materia.component.html",
  styleUrls: ["./materia.component.scss"],
})
export class MateriaComponent implements OnChanges {
  @Input() public component?: SigaaComponent;

  get parsedRequirements() {
    return this.component?.pre_requisitos?.reduce(
      (currentValue, component) => `${currentValue}<br/>${component}`
    );
  }

  get parsedPostRequirements() {
    return this.component?.eh_requisito_de?.reduce(
      (currentValue, component) => `${currentValue}<br/>${component}`
    );
  }

  ngOnChanges(changes: SimpleChanges): void {}
}
