import { NextFunction, Request, Response } from "express";

export interface IAction {
  call(req: Request, res: Response, next: NextFunction): Promise<void>;
}
