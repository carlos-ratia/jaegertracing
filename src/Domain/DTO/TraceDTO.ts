import { JsonObject } from "../Types/JsonObject";

export type TraceDTO = {
  id: string;
  createdAt: Date;
  eType: string;
  eId: string;
  trace: JsonObject;
};
