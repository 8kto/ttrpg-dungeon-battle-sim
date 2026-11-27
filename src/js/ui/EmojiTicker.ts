import { el } from '../utils/dom'

// Cycles emoji frames in an element (e.g. the Run button while a simulation goes on).
// The frames are a strip scrolled by a CSS transform animation (`.emoji-ticker` in styles.scss): the browser runs it
// off the main thread, so it keeps a steady pace while the main thread is busy with the simulation's start and logs.
export class EmojiTicker {
  // listed one by one: iterating a string would split emoji with a variation selector, like ⚔️
  private static readonly BATTLE_FRAMES: string[] = [
    '🏹',
    '💥',
    '⚔️',
    '💀',
    '🗡️',
    '💣',
    '⚰️',
    '🔪',
    '🤺',
    '😵',
    '👊',
    '💢',
    '☠️',
  ]
  private static readonly INTERVAL_MS: number = 75

  private running: boolean = false
  private originalText: string = ''

  constructor(
    private readonly element: HTMLElement,
    private readonly frames: string[] = EmojiTicker.BATTLE_FRAMES,
    private readonly intervalMs: number = EmojiTicker.INTERVAL_MS,
  ) {}

  start(): void {
    if (this.running) {
      return
    }

    this.running = true
    this.originalText = this.element.textContent ?? ''

    const ticker = el('span', 'emoji-ticker')
    ticker.style.setProperty('--emoji-ticker-steps', String(this.frames.length))
    ticker.style.setProperty('--emoji-ticker-duration', `${this.frames.length * this.intervalMs}ms`)

    const strip = el('span', 'emoji-ticker__strip')
    strip.append(...this.frames.map((frame) => el('span', 'emoji-ticker__frame', frame)))
    ticker.append(strip)

    this.element.replaceChildren(ticker)
  }

  stop(): void {
    if (!this.running) {
      return
    }

    this.running = false
    this.element.textContent = this.originalText
  }
}
