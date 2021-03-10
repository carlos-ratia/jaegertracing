export class ErrorNoTracing extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "ErrorNoTracing";
  }
}
