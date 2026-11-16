import { BaseLogger } from './BaseLogger'
import { LogLevel } from './ILogger'

// Discards everything; isVerbose() is false, so callers don't even build messages
export class NullLogger extends BaseLogger {
  constructor() {
    super(LogLevel.NO_SKIP)
  }

  protected output(): void {}
}
