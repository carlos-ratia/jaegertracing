import PromiseB from "bluebird";
import moment from "moment";
import { ReportTask00DTO } from "../DTO/ReportTask00DTO";

export class ReportTask00Mapper {
  constructor() {}

  public execute(args: { report: any }): PromiseB<ReportTask00DTO> {
    return PromiseB.try(() => {
      return {
        id: args.report.id,
        reportId: args.report.reportId,
        createdAt: moment(args.report.createdAt).isValid()
          ? moment(args.report.createdAt).toDate()
          : new Date(),
        payload: args.report.payload,
      };
    });
  }
}
