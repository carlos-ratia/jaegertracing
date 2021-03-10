import { ReportCreateInput } from "../DTO/ReportCreateInput";
import PromiseB from "bluebird";
import { ReportDTO } from "../DTO/ReportDTO";

export interface IReportDAO {
  create(args: { data: ReportCreateInput }): PromiseB<ReportDTO>;
  findById(args: { id: string }): PromiseB<ReportDTO>;
}
