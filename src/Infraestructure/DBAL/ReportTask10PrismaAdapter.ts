import { PrismaClient, ReportTask10 } from "@prisma/client";
import PromiseB from "bluebird";
import { JsonObject } from "../../Domain/Types/JsonObject";
import { ReportTask00CreateInput } from "../../Domain/DTO/ReportTask00CreateInput";
import { IReportTask10DAO } from "../../Domain/Interface/IReportTask10DAO";
import { ReportTask10DTO } from "../../Domain/DTO/ReportTask10DTO";

export class ReportTask10PrismaAdapter implements IReportTask10DAO {
  private readonly _adapter: PrismaClient;

  get adapter(): PrismaClient {
    return this._adapter;
  }

  constructor(args: { adapter: PrismaClient }) {
    this._adapter = args.adapter;
  }

  create(args: { data: ReportTask00CreateInput }): PromiseB<ReportTask10DTO> {
    return PromiseB.try(() => {
      return this.adapter.reportTask10.create({
        data: args.data,
      });
    }).then((reportTask: ReportTask10) => {
      return {
        id: reportTask.id,
        reportId: reportTask.reportId,
        createdAt: reportTask.createdAt,
        payload: reportTask.payload as JsonObject,
      };
    });
  }
}
