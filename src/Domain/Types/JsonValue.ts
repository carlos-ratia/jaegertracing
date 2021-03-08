import { JsonObject } from "./JsonObject";
import { JsonArray } from "./JsonArray";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;
