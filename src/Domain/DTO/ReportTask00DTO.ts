import { JsonObject } from "../Types/JsonObject";

export type ReportTask00DTO = {
  id: string;
  reportId: string;
  createdAt: Date;
  payload: JsonObject;
};
