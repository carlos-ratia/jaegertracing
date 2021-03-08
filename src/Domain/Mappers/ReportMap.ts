import { ReportDTO } from "../DTO/ReportDTO";
import PromiseB from "bluebird";
import moment from "moment";

export class ReportMap {
  constructor() {}

  public execute(args: { report: any }): PromiseB<ReportDTO> {
    return PromiseB.try(() => {
      return {
        id: args.report.id,
        createdAt: moment(args.report.createdAt).isValid()
          ? moment(args.report.createdAt).toDate()
          : new Date(),
        payload: args.report.payload,
      };
    });
  }
}
