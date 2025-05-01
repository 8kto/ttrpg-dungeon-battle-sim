export class Logger {
  private textarea: HTMLTextAreaElement
  private buffer: string[] = []
  private scheduled: boolean = false

  constructor(id: string) {
    this.textarea = document.getElementById(id) as HTMLTextAreaElement
  }

  log(message: string): void {
    this.buffer.push(`${message}\n`)
    if (!this.scheduled) {
      this.scheduled = true
      requestAnimationFrame(() => this.flush())
    }
  }

  clear(): void {
    this.buffer = []
    this.textarea.value = ''
  }

  private flush(): void {
    // Bulk-append everything in one DOM write
    this.textarea.value += this.buffer.join('')
    this.textarea.scrollTop = this.textarea.scrollHeight
    this.buffer = []
    this.scheduled = false
  }
}
