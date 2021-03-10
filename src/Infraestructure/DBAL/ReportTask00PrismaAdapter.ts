import { PrismaClient, ReportTask00 } from "@prisma/client";
import PromiseB from "bluebird";
import { JsonObject } from "../../Domain/Types/JsonObject";
import { IReportTask00DAO } from "../../Domain/Interface/IReportTask00DAO";
import { ReportTask00CreateInput } from "../../Domain/DTO/ReportTask00CreateInput";
import { ReportTask00DTO } from "../../Domain/DTO/ReportTask00DTO";

export class ReportTask00PrismaAdapter implements IReportTask00DAO {
  private readonly _adapter: PrismaClient;

  get adapter(): PrismaClient {
    return this._adapter;
  }

  constructor(args: { adapter: PrismaClient }) {
    this._adapter = args.adapter;
  }

  create(args: { data: ReportTask00CreateInput }): PromiseB<ReportTask00DTO> {
    return PromiseB.try(() => {
      return this.adapter.reportTask00.create({
        data: args.data,
      });
    }).then((reportTask: ReportTask00) => {
      return {
        id: reportTask.id,
        reportId: reportTask.reportId,
        createdAt: reportTask.createdAt,
        payload: reportTask.payload as JsonObject,
      };
    });
  }
}
