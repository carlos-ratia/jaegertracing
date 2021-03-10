import PromiseB from "bluebird";
import { TraceCreateInput } from "../DTO/TraceCreateInput";
import { TraceDTO } from "../DTO/TraceDTO";

export interface IReportTraceDAO {
  create(args: { data: TraceCreateInput }): PromiseB<TraceDTO>;
  findByEntityTraceInfo(args: {
    eType: string;
    eId: string;
  }): PromiseB<TraceDTO>;
}
