import {Injectable, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {SigaaComponent} from "../model/sigaaComponent";
import {Observable, of, Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SigaaService {

    private departaments: string[] = [];
    private sigaaComponents: SigaaComponent[] = [];

    constructor(private httpClient: HttpClient) {
        this.getDepartments().then(
            data => this.departaments = data.files
        )
    }


    private async loadFiles() {

        let components: SigaaComponent[] = []
        // for (let filename of data!.files) {
        //     await this.httpClient.get<SigaaComponent[]>(`assets/data/${filename}`).subscribe(
        //         data => {
        //             components.push(...data)
        //             this.sigaaComponents.next(components)
        //         }
        //     )
        // }


    }

    public async getDepartments(): Promise<any> {
        return this.httpClient.get<{ files: string[] }>('assets/data/_metadata.json').toPromise();
    }


    public getComponentsFromDepartment(dep: string): Observable<SigaaComponent[]> {
        return this.httpClient.get<SigaaComponent[]>(`assets/data/${dep}.json`);

    }


}
