import { JsonValue } from "./JsonValue";

export type JsonObject = { [Key in string]?: JsonValue };
