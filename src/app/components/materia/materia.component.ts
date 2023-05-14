import {Component, Input} from '@angular/core';
import {SigaaComponent} from "../../model/sigaaComponent";

@Component({
    selector: 'app-materia',
    templateUrl: './materia.component.html',
    styleUrls: ['./materia.component.scss']
})
export class MateriaComponent {
    @Input() public component?: SigaaComponent;


    public parseArray(array: string[]){
        return array.reduce((currentValue, component) => `${currentValue}<br/>${component}`)
    }

}
