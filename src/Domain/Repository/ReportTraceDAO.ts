import PromiseB from "bluebird";
import { IReportTraceDAO } from "../Interface/IReportTraceDAO";
import { TraceDTO } from "../DTO/TraceDTO";
import { TraceCreateInput } from "../DTO/TraceCreateInput";

export class ReportTraceDAO implements IReportTraceDAO {
  private readonly _adapter: IReportTraceDAO;

  get adapter(): IReportTraceDAO {
    return this._adapter;
  }

  constructor(args: { adapter: IReportTraceDAO }) {
    this._adapter = args.adapter;
  }

  create(args: { data: TraceCreateInput }): PromiseB<TraceDTO> {
    return this.adapter.create(args);
  }

  findByEntityTraceInfo(args: { eType: string; eId: string }): PromiseB<TraceDTO> {
    return this.adapter.findByEntityTraceInfo(args);
  }
}
