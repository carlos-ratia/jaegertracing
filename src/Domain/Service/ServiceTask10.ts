import PromiseB from "bluebird";
import { ServiceTaskBase } from "./ServiceTaskBase";
import { ContainerInterface } from "../../Application/Interface/ContainerInterface";
import { ReportDTO } from "../DTO/ReportDTO";
import { KafkaMessage } from "kafkajs";
import { CONTAINER_ENTRY_IDENTIFIER } from "../../Application/Dependencies";
import { ReportTask10DTO } from "../DTO/ReportTask10DTO";
import { ReportTask10DAO } from "../Repository/ReportTask10DAO";
import { KafkaMessageTask10DTO } from "../DTO/KafkaMessageTask10DTO";
import { KafkaMessageTask10Mapper } from "../Mappers/KafkaMessageTask10Mapper";

export class ServiceTask10 extends ServiceTaskBase<
  KafkaMessageTask10DTO,
  any,
  ReportTask10DTO
> {
  constructor(args: { container: ContainerInterface }) {
    super(args);
  }

  protected getMessage(args: {
    kafkaMessage: KafkaMessage;
  }): PromiseB<KafkaMessageTask10DTO> {
    return new KafkaMessageTask10Mapper().execute({
      buffer: args.kafkaMessage.value,
    });
  }

  protected getReportDTO(): PromiseB<ReportDTO> {
    return PromiseB.try(() => {
      return this.message.after;
    });
  }

  protected doTask(): PromiseB<any> {
    return PromiseB.try(() => {
      return { data: "TASK10" };
    });
  }

  protected doNext(args: { data: any }): PromiseB<ReportTask10DTO> {
    return PromiseB.try(() => {
      return new ReportTask10DAO({
        adapter: this.container.get(
          CONTAINER_ENTRY_IDENTIFIER.IReportTask10DAO
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

  protected getNextEntityInfo(): PromiseB<{ eId: string; eType: string }> {
    return PromiseB.try(() => {
      return {
        eId: this.report.id,
        eType: "END",
      };
    });
  }
}
