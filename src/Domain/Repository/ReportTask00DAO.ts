import PromiseB from "bluebird";
import { IReportTask00DAO } from "../Interface/IReportTask00DAO";
import { ReportTask00DTO } from "../DTO/ReportTask00DTO";
import { ReportTask00CreateInput } from "../DTO/ReportTask00CreateInput";

export class ReportTask00DAO {
  private readonly _adapter: IReportTask00DAO;

  get adapter(): IReportTask00DAO {
    return this._adapter;
  }

  constructor(args: { adapter: IReportTask00DAO }) {
    this._adapter = args.adapter;
  }

  create(args: { data: ReportTask00CreateInput }): PromiseB<ReportTask00DTO> {
    return this.adapter.create(args);
  }
}
