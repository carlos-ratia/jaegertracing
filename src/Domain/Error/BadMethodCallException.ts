export class BadMethodCallException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "BadMethodCallException";
  }
}
