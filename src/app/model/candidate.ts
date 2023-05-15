import { SigaaComponent } from "./sigaaComponent";

export type Candidate = {
  node: SigaaComponent;
  distance: number;
  source: Candidate | null;
};
