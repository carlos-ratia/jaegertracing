import { JsonObject } from "../Types/JsonObject";

export type ReportTask10CreateInput = {
  payload: JsonObject;
  report: {
    connect: {
      id: string;
    };
  };
};
