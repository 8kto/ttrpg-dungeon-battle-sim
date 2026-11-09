import { BaseLogger } from './BaseLogger'
import { LogLevel } from './ILogger'

// Renders log lines into a DOM container
export class Logger extends BaseLogger {
  private readonly container: HTMLElement
  private buffer: string[] = []
  private scheduled: boolean = false

  constructor(id: string, level: LogLevel = LogLevel.CAN_SKIP) {
    super(level)

    const el = document.getElementById(id)
    if (!el) {
      throw new Error(`No element with id="${id}"`)
    }
    this.container = el
  }

  // appends messages already filtered elsewhere (e.g. received from the simulation worker)
  write(messages: string[]): void {
    messages.forEach((message) => this.output(message))
  }

  clear(): this {
    this.buffer = []
    this.container.innerHTML = ''

    return this
  }

  getContainer(): HTMLElement {
    return this.container
  }

  protected output(message: string): void {
    // split out any newlines into separate lines
    message.split('\n').forEach((line) => {
      this.buffer.push(line)
    })

    if (!this.scheduled) {
      this.scheduled = true
      requestAnimationFrame(() => this.flush())
    }
  }

  private flush(): void {
    const frag = document.createDocumentFragment()
    for (const line of this.buffer) {
      const p = document.createElement('p')
      p.textContent = line
      frag.appendChild(p)
    }
    this.container.appendChild(frag)
    // scroll to bottom
    this.container.scrollTop = this.container.scrollHeight

    this.buffer = []
    this.scheduled = false
  }
}
