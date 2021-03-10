import PromiseB from "bluebird";
import _ from "lodash";
import { JsonObject } from "../Types/JsonObject";
import { KafkaMessageSource } from "../DTO/KafkaMessageSource";
import { KafkaMessageTask10DTO } from "../DTO/KafkaMessageTask10DTO";
import { ReportTask00DTO } from "../DTO/ReportTask00DTO";
import { ReportTask00Mapper } from "./ReportTask00Mapper";

export class KafkaMessageTask10Mapper {
  constructor() {}

  public execute(args: {
    buffer: Buffer | null;
  }): PromiseB<KafkaMessageTask10DTO> {
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
        const action1: PromiseB<ReportTask00DTO | null> = this.parseReportPayload(
          payload?.before
        );
        const action2: PromiseB<ReportTask00DTO> = this.parseReportPayload(
          payload?.after
        ).then((report: ReportTask00DTO | null) => {
          if (_.isNull(report)) {
            throw new Error();
          }
          return report;
        });
        return PromiseB.all([action1, action2]).then((r) => {
          const dto: KafkaMessageTask10DTO = {
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
      .then((message: KafkaMessageTask10DTO) => {
        return message;
      });
  }

  protected parseReportPayload(report: any): PromiseB<ReportTask00DTO | null> {
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
      .then((report: any) => {
        return new ReportTask00Mapper().execute({ report });
      })
      .catch((_) => {
        return null;
      });
  }
}
