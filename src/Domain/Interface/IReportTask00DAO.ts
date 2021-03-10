import PromiseB from "bluebird";
import { ReportTask00CreateInput } from "../DTO/ReportTask00CreateInput";
import { ReportTask00DTO } from "../DTO/ReportTask00DTO";

export interface IReportTask00DAO {
  create(args: { data: ReportTask00CreateInput }): PromiseB<ReportTask00DTO>;
}
