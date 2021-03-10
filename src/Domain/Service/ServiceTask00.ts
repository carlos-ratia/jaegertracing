import PromiseB from "bluebird";
import { ServiceTaskBase } from "./ServiceTaskBase";
import { ContainerInterface } from "../../Application/Interface/ContainerInterface";
import { KafkaMessageTask00DTO } from "../DTO/KafkaMessageTask00DTO";
import { KafkaMessage } from "kafkajs";
import { KafkaMessageTask00Mapper } from "../Mappers/KafkaMessageTask00Mapper";
import { CONTAINER_ENTRY_IDENTIFIER } from "../../Application/Dependencies";
import { ReportTask00DAO } from "../Repository/ReportTask00DAO";
import { ReportTask00DTO } from "../DTO/ReportTask00DTO";
import { ServiceTask10 } from "./ServiceTask10";

export class ServiceTask00 extends ServiceTaskBase<
  KafkaMessageTask00DTO,
  any,
  ReportTask00DTO
> {
  constructor(args: { container: ContainerInterface }) {
    super(args);
  }

  protected getMessage(args: {
    kafkaMessage: KafkaMessage;
  }): PromiseB<KafkaMessageTask00DTO> {
    return new KafkaMessageTask00Mapper().execute({
      buffer: args.kafkaMessage.value,
    });
  }

  protected getReportId(): PromiseB<string> {
    return PromiseB.try(() => {
      return this.message.after.id;
    });
  }

  protected doTask(): PromiseB<any> {
    return PromiseB.try(() => {
      return { data: "TASK00" };
    });
  }

  protected doNext(args: { data: any }): PromiseB<ReportTask00DTO> {
    return PromiseB.try(() => {
      return new ReportTask00DAO({
        adapter: this.container.get(
          CONTAINER_ENTRY_IDENTIFIER.IReportTask00DAO
        ),
      }).create({
        data: {
          payload: args,
          report: {
            connect: {
              id: this.report.id,
            },
          },
        },
      });
    });
  }

  protected getEId(): string {
    return this.report.id;
  }

  protected getEType(): string {
    return "Report";
  }

  protected getNextEntityInfo(): PromiseB<{ eId: string; eType: string }> {
    return PromiseB.try(() => {
      return {
        eId: this.getEId(),
        eType: ServiceTask10.eType,
      };
    });
  }
}
