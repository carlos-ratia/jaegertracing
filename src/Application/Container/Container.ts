import { ContainerInterface } from "../Interface/ContainerInterface";
import { NotFoundContainerException } from "../Error/NotFoundContainerException";

export class Container implements ContainerInterface {
  private readonly _map: Map<Symbol, any>;

  get map(): Map<Symbol, any> {
    return this._map;
  }

  constructor() {
    this._map = new Map<Symbol, any>();
  }

  get(id: Symbol): any {
    if (this.has(id)) {
      return this.map.get(id);
    }
    throw new NotFoundContainerException(id);
  }

  set(args: { key: Symbol; value: any }): true {
    this.map.set(args.key, args.value);
    return true;
  }

  has(id: Symbol): boolean {
    return this.map.has(id);
  }
}
