export class Logger {
  private textarea: HTMLTextAreaElement

  constructor(id: string) {
    this.textarea = document.getElementById(id) as HTMLTextAreaElement
  }

  log(message: string) {
    this.textarea.value += `${message}\n`
    this.textarea.scrollTop = this.textarea.scrollHeight
  }

  clear() {
    this.textarea.value = ''
  }
}
