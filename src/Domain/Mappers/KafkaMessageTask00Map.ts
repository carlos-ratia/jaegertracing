import { Report } from "@prisma/client";
import { KafkaMessageTask00DTO } from "../DTO/KafkaMessageTask00DTO";
import { ReportDTO } from "../DTO/ReportDTO";
import { ReportMap } from "./ReportMap";
import PromiseB from "bluebird";
import _ from "lodash";
import { JsonObject } from "../Types/JsonObject";
import { KafkaMessageSource } from "../DTO/KafkaMessageSource";

export class KafkaMessageTask00Map {
  constructor() {}

  public execute(args: {
    buffer: Buffer | null;
  }): PromiseB<KafkaMessageTask00DTO> {
    return PromiseB.try(() => {
      if (_.isNull(args.buffer)) {
        throw new Error("<buffer> cannot be null"); //TODO tipear error
      }
      return args.buffer;
    })
      .then((buffer: Buffer) => {
        return JSON.parse(buffer.toString("utf8"));
      })
      .then((message: JsonObject) => {
        const payload: JsonObject | undefined | null =
          message.payload === undefined
            ? message.payload
            : (message.payload as JsonObject);
        const action1: PromiseB<ReportDTO | null> = this.parseReportPayload(
          payload?.before
        );
        const action2: PromiseB<ReportDTO> = this.parseReportPayload(
          payload?.after
        ).then((report: ReportDTO | null) => {
          if (_.isNull(report)) {
            throw new Error();
          }
          return report;
        });
        return PromiseB.all([action1, action2]).then((r) => {
          const dto: KafkaMessageTask00DTO = {
            before: r[0],
            after: r[1],
            source: {} as KafkaMessageSource,
            op: "c",
            ts_ms: 1,
            transaction: "",
          };
          return dto;
        });
      })
      .then((message: KafkaMessageTask00DTO) => {
        return message;
      });
  }

  protected parseReportPayload(report: any): PromiseB<ReportDTO | null> {
    return PromiseB.try(() => {
      if (_.isNull(report)) {
        throw new Error("<report> is null, returning null");
      }
      return report;
    })
      .then((report: any) => {
        report.payload = JSON.parse(report.payload);
        return report;
      })
      .then((report: Report) => {
        return new ReportMap().execute({ report });
      })
      .catch((_) => {
        return null;
      });
  }
}
