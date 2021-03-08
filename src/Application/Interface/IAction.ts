import { NextFunction, Request, Response } from "express";
import PromiseB from "bluebird";

export interface IAction {
  call(req: Request, res: Response, next: NextFunction): PromiseB<void>;
}
