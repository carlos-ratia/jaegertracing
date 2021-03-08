import PromiseB from "bluebird";
import { TraceCreateInput } from "../DTO/TraceCreateInput";
import { TraceDTO } from "../DTO/TraceDTO";

export interface ITraceDAO {
  create(args: { data: TraceCreateInput }): PromiseB<TraceDTO>;
  findByEntityInfo(args: { eType: string; eId: string }): PromiseB<TraceDTO>;
}
