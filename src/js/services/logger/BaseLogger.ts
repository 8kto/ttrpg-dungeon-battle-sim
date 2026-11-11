import type { ILogger } from './ILogger'
import { LogLevel } from './ILogger'

// Level filtering shared by loggers; subclasses decide where messages go
export abstract class BaseLogger implements ILogger {
  constructor(protected level: LogLevel = LogLevel.CAN_SKIP) {}

  setLevel(level: LogLevel): void {
    this.level = level
  }

  isVerbose(): boolean {
    return this.level === LogLevel.CAN_SKIP
  }

  log(message: string, level: LogLevel = LogLevel.CAN_SKIP): void {
    if (level < this.level) {
      return
    }

    this.output(message)
  }

  warn(message: string): void {
    this.log(message, LogLevel.NO_SKIP)
  }

  lineBreak(level: LogLevel = LogLevel.CAN_SKIP): void {
    this.log('\n', level)
  }

  delimiter(level: LogLevel = LogLevel.CAN_SKIP): void {
    this.log('-'.repeat(80), level)
  }

  protected abstract output(message: string): void
}
