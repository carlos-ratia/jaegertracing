import PromiseB from "bluebird";
import { IReportTask10DAO } from "../Interface/IReportTask10DAO";
import { ReportTask10DTO } from "../DTO/ReportTask10DTO";
import { ReportTask10CreateInput } from "../DTO/ReportTask10CreateInput";

export class ReportTask10DAO {
  private readonly _adapter: IReportTask10DAO;

  get adapter(): IReportTask10DAO {
    return this._adapter;
  }

  constructor(args: { adapter: IReportTask10DAO }) {
    this._adapter = args.adapter;
  }

  create(args: { data: ReportTask10CreateInput }): PromiseB<ReportTask10DTO> {
    return this.adapter.create(args);
  }
}
