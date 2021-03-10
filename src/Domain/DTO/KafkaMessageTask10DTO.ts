import { KafkaMessageBase } from "./KafkaMessageBase";
import { ReportTask00DTO } from "./ReportTask00DTO";

export type KafkaMessageTask10DTO = {
  before: ReportTask00DTO | null;
  after: ReportTask00DTO;
} & KafkaMessageBase;
