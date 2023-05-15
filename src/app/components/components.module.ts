import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { InfoComponentComponent } from "./info-component/info-component.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatChipsModule } from "@angular/material/chips";
import { MatButtonModule } from "@angular/material/button";
import { MateriaComponent } from "./materia/materia.component";
import { MatTableModule } from "@angular/material/table";
import { SearchComponent } from "./search/search.component";

@NgModule({
  declarations: [InfoComponentComponent, MateriaComponent, SearchComponent],
  exports: [InfoComponentComponent, MateriaComponent, SearchComponent],
  imports: [CommonModule, MatExpansionModule],
})
export class ComponentsModule {}
