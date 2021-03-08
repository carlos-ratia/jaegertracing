import { KafkaMessageSource } from "./KafkaMessageSource";

export type KafkaMessageBase = {
  op: "c" | "u" | "d";
  source: KafkaMessageSource;
  ts_ms: number;
  transaction: string | null;
};
