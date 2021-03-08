export class NotFoundContainerException extends Error {
  constructor(id: Symbol) {
    super(
      `Error type NotFoundContainerException -> Not found id ${id.toString()}`
    );
    this.name = "NotFoundContainerException";
  }
}
