import PromiseB from "bluebird";
import { ReportDTO } from "../DTO/ReportDTO";
import { ReportCreateInput } from "../DTO/ReportCreateInput";

export interface IReportDAO {
  create(args: { data: ReportCreateInput }): PromiseB<ReportDTO>;
}

export class ReportDAO {
  private readonly _adapter: IReportDAO;

  get adapter(): IReportDAO {
    return this._adapter;
  }

  constructor(args: { adapter: IReportDAO }) {
    this._adapter = args.adapter;
  }

  create(args: { data: ReportCreateInput }): PromiseB<ReportDTO> {
    return this.adapter.create(args);
  }
}
