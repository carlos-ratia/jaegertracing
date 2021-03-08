export type KafkaMessageSource = {
  version: string;
  connector: string;
  name: string;
  ts_ms: number;
  snapshot: string;
  db: string;
  table: string;
  server_id: number;
  gtid: null;
  file: string;
  pos: number;
  row: number;
  thread: number;
  query: string | null;
};
