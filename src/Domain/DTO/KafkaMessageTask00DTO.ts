import { ReportDTO } from "./ReportDTO";
import { KafkaMessageBase } from "./KafkaMessageBase";

export type KafkaMessageTask00DTO = {
  before: ReportDTO | null;
  after: ReportDTO;
} & KafkaMessageBase;
