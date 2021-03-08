import { IReportDAO } from "../../Domain/Repository/ReportDAO";
import { PrismaClient, Report } from "@prisma/client";
import { ReportDTO } from "../../Domain/DTO/ReportDTO";
import PromiseB from "bluebird";
import { JsonObject } from "../../Domain/Types/JsonObject";
import { ReportCreateInput } from "../../Domain/DTO/ReportCreateInput";

export class ReportPrismaAdapter implements IReportDAO {
  private readonly _adapter: PrismaClient;

  get adapter(): PrismaClient {
    return this._adapter;
  }

  constructor(args: { adapter: PrismaClient }) {
    this._adapter = args.adapter;
  }

  create(args: { data: ReportCreateInput }): PromiseB<ReportDTO> {
    return PromiseB.try(() => {
      return this.adapter.report.create({
        data: args.data,
      });
    }).then((report: Report) => {
      return {
        id: report.id,
        createdAt: report.createdAt,
        payload: report.payload as JsonObject,
      };
    });
  }
}
