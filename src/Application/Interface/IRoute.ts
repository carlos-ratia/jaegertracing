import { IRouteMiddleware } from "./IRouteMiddleware";
import { IAction } from "./IAction";

export const RouteMethodsType = {
  GET: Symbol.for("GET"),
  POST: Symbol.for("POST"),
  PUT: Symbol.for("PUT"),
  DELETE: Symbol.for("DELETE"),
};

export declare type RouteMethodType = typeof RouteMethodsType[keyof typeof RouteMethodsType];

export interface IRoute {
  method: RouteMethodType;
  pattern: string;
  action: IAction;
  middleware?: IRouteMiddleware[];
}
