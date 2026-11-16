import { BaseLogger } from './BaseLogger'

// Collects messages in memory, e.g. to send them from the worker to the page in batches
export class BufferLogger extends BaseLogger {
  private messages: string[] = []

  // returns collected messages and empties the buffer
  drain(): string[] {
    const { messages } = this
    this.messages = []

    return messages
  }

  protected output(message: string): void {
    this.messages.push(message)
  }
}
