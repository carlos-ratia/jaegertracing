import PromiseB from "bluebird";
import { ReportDTO } from "../DTO/ReportDTO";
import { ReportCreateInput } from "../DTO/ReportCreateInput";
import { IReportDAO } from "../Interface/IReportDAO";

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
