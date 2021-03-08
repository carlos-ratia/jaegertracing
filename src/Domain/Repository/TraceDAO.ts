import PromiseB from "bluebird";
import { ITraceDAO } from "../Interface/ITraceDAO";
import { TraceDTO } from "../DTO/TraceDTO";
import { TraceCreateInput } from "../DTO/TraceCreateInput";

export class TraceDAO implements ITraceDAO {
  private readonly _adapter: ITraceDAO;

  get adapter(): ITraceDAO {
    return this._adapter;
  }

  constructor(args: { adapter: ITraceDAO }) {
    this._adapter = args.adapter;
  }

  create(args: { data: TraceCreateInput }): PromiseB<TraceDTO> {
    return this.adapter.create(args);
  }

  findByEntityInfo(args: { eType: string; eId: string }): PromiseB<TraceDTO> {
    return this.adapter.findByEntityInfo(args);
  }
}
