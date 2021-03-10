import PromiseB from "bluebird";
import { ReportTask10DTO } from "../DTO/ReportTask10DTO";
import { ReportTask10CreateInput } from "../DTO/ReportTask10CreateInput";

export interface IReportTask10DAO {
  create(args: { data: ReportTask10CreateInput }): PromiseB<ReportTask10DTO>;
}
