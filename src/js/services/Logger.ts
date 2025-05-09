export enum LogLevel {
  INFO,
  WARNING,
}

export class Logger {
  private container: HTMLElement
  private buffer: string[] = []
  private scheduled: boolean = false

  constructor(
    id: string,
    private level: LogLevel = LogLevel.INFO,
  ) {
    const el = document.getElementById(id)
    if (!el) {
      throw new Error(`No element with id="${id}"`)
    }
    this.container = el
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  log(message: string, level: LogLevel = LogLevel.INFO): void {
    if (level < this.level) {
      return
    }

    // split out any newlines into separate lines
    message.split('\n').forEach((line) => {
      this.buffer.push(line)
    })

    if (!this.scheduled) {
      this.scheduled = true
      requestAnimationFrame(() => this.flush())
    }
  }

  warn(message: string): void {
    this.log(message, LogLevel.WARNING)
  }

  clear(): this {
    this.buffer = []
    this.container.innerHTML = ''

    return this
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
