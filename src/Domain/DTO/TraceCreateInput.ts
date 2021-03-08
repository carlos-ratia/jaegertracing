import { JsonObject } from "../Types/JsonObject";

export type TraceCreateInput = {
  eType: string;
  eId: string;
  trace: JsonObject;
};
