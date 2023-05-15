import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { SigaaComponent } from "../model/sigaaComponent";

@Injectable({
  providedIn: "root",
})
export class SigaaService {
  constructor(private httpClient: HttpClient) {}

  public async getDepartments(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get<{ files: string[] }>(this.getUrl("_metadata"))
        .subscribe((data) => resolve(data.files));
    });
  }

  private getUrl(dep: string) {
    return `assets/data/${dep}.json`;
  }

  public getPromiseFromDepartment(dep: string): Promise<SigaaComponent[]> {
    return new Promise((resolve, reject) => {
      this.httpClient
        .get<SigaaComponent[]>(this.getUrl(dep))
        .subscribe((data) => resolve(data));
    });
  }
}
