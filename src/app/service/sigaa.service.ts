import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SigaaComponent} from "../model/sigaaComponent";
import {Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SigaaService {

    private departaments: string[] = [];
    private sigaaComponents: Subject<SigaaComponent[]> = new Subject<SigaaComponent[]>();

    constructor(private httpClient: HttpClient) {
    }

    private async getFilenames() {
        return await this.httpClient.get<{ files: string[] }>('assets/data/_metadata.json').toPromise();

    }

    private async loadFiles() {
        await this.getFilenames().then(
            async data => {
                let components: SigaaComponent[] = []
                for (let filename of data!.files) {
                    await this.httpClient.get<SigaaComponent[]>(`assets/data/${filename}`).subscribe(
                        data => {
                            components.push(...data)
                            this.sigaaComponents.next(components)
                        }
                    )
                }

            }
        )


    }

    public getComponents(): Subject<SigaaComponent[]> {
        this.loadFiles().then();
        return this.sigaaComponents;

    }


}
