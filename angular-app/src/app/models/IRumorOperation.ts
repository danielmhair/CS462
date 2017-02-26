import {Rumor} from "./Rumor";

export interface IRumorOperation extends Function {
  (categories: Rumor[] | any): Rumor[];
}
