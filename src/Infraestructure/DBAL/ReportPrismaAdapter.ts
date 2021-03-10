import { PrismaClient, Report } from "@prisma/client";
import { ReportDTO } from "../../Domain/DTO/ReportDTO";
import PromiseB from "bluebird";
import { JsonObject } from "../../Domain/Types/JsonObject";
import { ReportCreateInput } from "../../Domain/DTO/ReportCreateInput";
import { IReportDAO } from "../../Domain/Interface/IReportDAO";

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
      return this.mapperReportToReportDTO({ report });
    });
  }

  findById(args: { id: string }): PromiseB<ReportDTO> {
    return PromiseB.try(() => {
      return this.adapter.report.findUnique({
        rejectOnNotFound: true,
        where: {
          id: args.id,
        },
      });
    }).then((report: Report) => {
      return this.mapperReportToReportDTO({ report });
    });
  }

  protected mapperReportToReportDTO(args: {
    report: Report;
  }): PromiseB<ReportDTO> {
    return PromiseB.try(() => {
      return {
        id: args.report.id,
        createdAt: args.report.createdAt,
        payload: args.report.payload as JsonObject,
      };
    });
  }
}
