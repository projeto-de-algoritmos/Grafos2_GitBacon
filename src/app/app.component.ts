import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {BfsSearchComponent} from './components/bfs-search/bfs-search.component';
import {Subject} from 'rxjs';
import {SigaaService} from "./service/sigaa.service";
import {SigaaComponent} from "./model/sigaaComponent";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    @ViewChild(BfsSearchComponent) bfsSearchComponent!: BfsSearchComponent;

    public components: SigaaComponent[] = [];
    public githubTokenInfo = 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token';

    public usuarioA?: string;
    public usuarioB?: string;

    public usersValid: Subject<boolean> = new Subject<boolean>();

    private validyStatus: { userA?: boolean, userB?: boolean } = {}

    public lblUserA = 'usuarioA'
    public lblUserB = 'usuarioB'

    public showSettings = false;
    public showSearch = false;

    public formBusca: FormGroup = this.formBuilder.group(
        {
            usuarioA: [null],
            usuarioB: [null],
            maxLevel: [4],
            token: ['']
        }
    );

    constructor(private formBuilder: FormBuilder,
                private snackBar: MatSnackBar,
                private sigaaService: SigaaService
    ) {
        this.usersValid.next(false);

    }


    ngOnInit(): void {
        this.usersValid.subscribe(
            next => {
                if (next === true)
                    this.showSearch = true;
            }
        )
        this.sigaaService.getComponents().subscribe(
            components => this.components = components
        )
    }

    get providedToken() {
        return this.formBusca.get('token')?.value;
    }

    private handleError(e: HttpErrorResponse, inputValue: string) {
        if (e.status == 404)
            this.notify(`Usuário ${inputValue} não encontrado no GitHub.`, true)
        else if (e.status == 403)
            this.notify('Limite de acessos à API Rest atingido. Aguarde uma hora para tentar novamente ou forneça um token, clicando no ícone ⚙️.', true)
        else
            this.notify(`Erro ao buscar usuário ${inputValue}. Descrição: ${e.message}`, true)
    }

    public onInputFocusOut(formControlName: string) {
        const inputValue = this.formBusca.get(formControlName)?.value
        if (inputValue) {
            if (formControlName == this.lblUserA) {

            }
        }
    }

    public stop() {
        this.notify('Encerrando a busca, aguarde.', true)
        this.bfsSearchComponent.stop = true;
        this.bfsSearchComponent.messages.push('Stopping search...')
    }

    public reset() {
        this.stop();

        this.formBusca.get(this.lblUserA)?.setValue('');
        this.formBusca.get(this.lblUserB)?.setValue('');
        this.formBusca.get('maxLevel')?.setValue(4);

        this.usuarioA = undefined;
        this.usuarioB = undefined;
        this.showSearch = false;

        this.validyStatus = {};
        this.usersValid.next(false);
    }


    get token() {
        return this.formBusca.get('token')?.value ? this.formBusca.get('token')!.value! : null;
    }

    get userOrigin() {
        return this.formBusca.get(this.lblUserA)!.value!
    }

    get userTarget() {
        return this.formBusca.get(this.lblUserB)!.value!
    }

    get maxLevel() {
        return this.formBusca.get('maxLevel')!.value!
    }

    public swap() {
        let temp = this.formBusca.get(this.lblUserA)?.value
        this.formBusca.get(this.lblUserA)?.setValue(this.formBusca.get(this.lblUserB)?.value)
        this.formBusca.get(this.lblUserB)?.setValue(temp)
        this.onInputFocusOut(this.lblUserA)
        this.onInputFocusOut(this.lblUserB)
    }


    public notify(msg: string, isError = false) {
        const emoji = isError ? '⚠️' : '✅';
        const message = `${emoji} ${msg}`
        this.snackBar.open(message, 'Fechar', {duration: 2000});
    }
}


