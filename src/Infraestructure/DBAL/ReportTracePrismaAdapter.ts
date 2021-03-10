import { PrismaClient, ReportTrace } from "@prisma/client";
import PromiseB from "bluebird";
import { JsonObject } from "../../Domain/Types/JsonObject";
import { TraceCreateInput } from "../../Domain/DTO/TraceCreateInput";
import { IReportTraceDAO } from "../../Domain/Interface/IReportTraceDAO";
import { TraceDTO } from "../../Domain/DTO/TraceDTO";

export class ReportTracePrismaAdapter implements IReportTraceDAO {
  private readonly _adapter: PrismaClient;

  get adapter(): PrismaClient {
    return this._adapter;
  }

  constructor(args: { adapter: PrismaClient }) {
    this._adapter = args.adapter;
  }

  create(args: { data: TraceCreateInput }): PromiseB<TraceDTO> {
    return PromiseB.try(() => {
      return this.adapter.reportTrace.create({
        data: args.data,
      });
    }).then((trace: ReportTrace) => {
      return {
        id: trace.id,
        createdAt: trace.createdAt,
        eType: trace.eType,
        eId: trace.eId,
        trace: trace.trace as JsonObject,
      };
    });
  }

  findByEntityTraceInfo(args: {
    eType: string;
    eId: string;
  }): PromiseB<TraceDTO> {
    return PromiseB.try(() => {
      return this.adapter.reportTrace.findUnique({
        rejectOnNotFound: true,
        where: {
          idxInsert: {
            eType: args.eType,
            eId: args.eId,
          },
        },
      });
    }).then((trace: ReportTrace) => {
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
