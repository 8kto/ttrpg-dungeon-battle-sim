// DivLogger.ts
export class Logger {
  private container: HTMLElement
  private buffer: string[] = []
  private scheduled: boolean = false

  constructor(id: string) {
    const el = document.getElementById(id)
    if (!el) {
      throw new Error(`No element with id="${id}"`)
    }
    this.container = el
  }

  log(message: string): void {
    // split out any newlines into separate lines
    message.split('\n').forEach((line) => {
      this.buffer.push(line)
    })

    if (!this.scheduled) {
      this.scheduled = true
      requestAnimationFrame(() => this.flush())
    }
  }

  clear(): void {
    this.buffer = []
    this.container.innerHTML = ''
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
