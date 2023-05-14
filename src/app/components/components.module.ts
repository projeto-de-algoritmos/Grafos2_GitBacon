import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTooltipModule} from "@angular/material/tooltip";
import {InfoComponentComponent} from './info-component/info-component.component';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatIconModule} from "@angular/material/icon";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {MatCardModule} from "@angular/material/card";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {BfsSearchComponent} from "./bfs-search/bfs-search.component";
import {MatChipsModule} from "@angular/material/chips";
import {MatButtonModule} from "@angular/material/button";
import {MateriaComponent} from './materia/materia.component';
import {AvatarComponent} from "./avatar/avatar.component";
import {MatTableModule} from "@angular/material/table";


@NgModule({
    declarations: [InfoComponentComponent, BfsSearchComponent, MateriaComponent, AvatarComponent],
    exports: [
        InfoComponentComponent,
        BfsSearchComponent,
        MateriaComponent,
        AvatarComponent
    ],
    imports: [
        CommonModule,
        MatTooltipModule,
        MatExpansionModule,
        MatIconModule,
        MatSnackBarModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatButtonModule,
        MatTableModule,

    ]
})
export class ComponentsModule {
}
