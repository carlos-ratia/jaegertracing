import { Container } from "./Container";
import { ContainerInterface } from "../Interface/ContainerInterface";
import { ContainerBuilderInterface } from "../Interface/ContainerBuilderInterface";

export class ContainerBuilder implements ContainerBuilderInterface {
  private readonly _container: Container;

  protected get container(): Container {
    return this._container;
  }

  constructor() {
    this._container = new Container();
  }

  addDefinitions(
    args: {
      key: Symbol;
      value: (container: ContainerInterface) => any;
    }[]
  ): ContainerBuilder {
    args.forEach((element) => {
      this.container.set({
        key: element.key,
        value: element.value(this.container),
      });
    });
    return this;
  }

  build(): ContainerInterface {
    return this.container;
  }
}
