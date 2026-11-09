export enum LogLevel {
  CAN_SKIP,
  NO_SKIP,
}

// Simulation code depends on this interface only, so it doesn't need the DOM
export interface ILogger {
  log(message: string, level?: LogLevel): void
  warn(message: string): void
  lineBreak(level?: LogLevel): void
  delimiter(level?: LogLevel): void
}
