import { JsonObject } from "../Types/JsonObject";

export type ReportTask10DTO = {
  id: string;
  reportId: string;
  createdAt: Date;
  payload: JsonObject;
};
