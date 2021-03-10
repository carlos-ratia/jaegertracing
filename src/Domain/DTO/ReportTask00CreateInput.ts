import { JsonObject } from "../Types/JsonObject";

export type ReportTask00CreateInput = {
  payload: JsonObject;
  report: {
    connect: {
      id: string;
    };
  };
};
