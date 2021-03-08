import { PrismaClient, Trace } from "@prisma/client";
import PromiseB from "bluebird";
import { JsonObject } from "../../Domain/Types/JsonObject";
import { TraceCreateInput } from "../../Domain/DTO/TraceCreateInput";
import { ITraceDAO } from "../../Domain/Interface/ITraceDAO";
import { TraceDTO } from "../../Domain/DTO/TraceDTO";

export class TracePrismaAdapter implements ITraceDAO {
  private readonly _adapter: PrismaClient;

  get adapter(): PrismaClient {
    return this._adapter;
  }

  constructor(args: { adapter: PrismaClient }) {
    this._adapter = args.adapter;
  }

  create(args: { data: TraceCreateInput }): PromiseB<TraceDTO> {
    return PromiseB.try(() => {
      return this.adapter.trace.create({
        data: args.data,
      });
    }).then((trace: Trace) => {
      return {
        id: trace.id,
        createdAt: trace.createdAt,
        eType: trace.eType,
        eId: trace.eId,
        trace: trace.trace as JsonObject,
      };
    });
  }

  findByEntityInfo(args: { eType: string; eId: string }): PromiseB<TraceDTO> {
    return PromiseB.try(() => {
      return this.adapter.trace.findUnique({
        rejectOnNotFound: true,
        where: {
          idxInsert: {
            eType: args.eType,
            eId: args.eId,
          },
        },
      });
    }).then((trace: Trace) => {
      return {
        id: trace.id,
        createdAt: trace.createdAt,
        eType: trace.eType,
        eId: trace.eId,
        trace: trace.trace as JsonObject,
      };
    });
  }
}
