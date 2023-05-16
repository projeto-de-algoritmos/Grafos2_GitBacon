import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SigaaComponent } from "../model/sigaaComponent";

@Injectable({
  providedIn: "root",
})
export class SigaaService {
  private baseUrl =
    "https://raw.githubusercontent.com/projeto-de-algoritmos/Grafos2_SIGAARush/master/src/assets/data";
  constructor(private httpClient: HttpClient) {}

  public async getDepartments(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get<{ files: string[] }>(this.getUrl("_metadata"))
        .subscribe((data) => resolve(data.files));
    });
  }

  private getUrl(dep: string) {
    return `${this.baseUrl}/${dep}.json`;
  }

  public getPromiseFromDepartment(dep: string): Promise<SigaaComponent[]> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get<SigaaComponent[]>(this.getUrl(dep))
        .subscribe((data) => resolve(data));
    });
  }
}
