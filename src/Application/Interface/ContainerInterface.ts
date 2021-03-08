export interface ContainerInterface {
  get(id: Symbol): any;
  has(id: Symbol): boolean;
}
