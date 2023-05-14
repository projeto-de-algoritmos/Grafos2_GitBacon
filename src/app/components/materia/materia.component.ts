import { Component, Input } from "@angular/core";
import { SigaaComponent } from "../../model/sigaaComponent";

@Component({
  selector: "app-materia",
  templateUrl: "./materia.component.html",
  styleUrls: ["./materia.component.scss"],
})
export class MateriaComponent {
  @Input() public component?: SigaaComponent;

  @Input() public isSmall: boolean = false;
  @Input() public showArrow: boolean = false;

  public parseArray(array: string[]) {
    return array.reduce(
      (currentValue, component) => `${currentValue}<br/>${component}`
    );
  }
}
