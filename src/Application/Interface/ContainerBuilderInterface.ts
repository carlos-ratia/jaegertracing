import { ContainerInterface } from "./ContainerInterface";

export interface ContainerBuilderInterface {
  addDefinitions(
    args: {
      key: Symbol;
      value: (container: ContainerInterface) => any;
    }[]
  ): ContainerBuilderInterface;

  build(): ContainerInterface;
}
