import { EmojiTicker } from '../EmojiTicker'

describe('EmojiTicker', () => {
  let button: HTMLButtonElement

  const frames = (): string[] =>
    Array.from(button.querySelectorAll('.emoji-ticker__frame')).map((frame) => frame.textContent ?? '')

  beforeEach(() => {
    document.body.innerHTML = '<button id="btn">Run</button>'
    button = document.getElementById('btn') as HTMLButtonElement
  })

  it('replaces the text with a strip of the frames', () => {
    new EmojiTicker(button, ['🏹', '⚔️', '💀'], 200).start()

    expect(frames()).toEqual(['🏹', '⚔️', '💀'])
    expect(button.textContent).not.toContain('Run')
  })

  it('sets the animation steps and duration from the frames and the interval', () => {
    new EmojiTicker(button, ['🏹', '⚔️', '💀'], 200).start()

    const ticker = button.querySelector('.emoji-ticker') as HTMLElement
    expect(ticker.style.getPropertyValue('--emoji-ticker-steps')).toBe('3')
    expect(ticker.style.getPropertyValue('--emoji-ticker-duration')).toBe('600ms')
  })

  it('restores the original text on stop', () => {
    const ticker = new EmojiTicker(button, ['🏹', '⚔️'], 200)

    ticker.start()
    ticker.stop()
    expect(button.textContent).toBe('Run')
    expect(button.querySelector('.emoji-ticker')).toBeNull()
  })

  it('ignores a repeated start and keeps the original text', () => {
    const ticker = new EmojiTicker(button, ['🏹', '⚔️'], 200)

    ticker.start()
    ticker.start()
    expect(button.querySelectorAll('.emoji-ticker')).toHaveLength(1)

    ticker.stop()
    expect(button.textContent).toBe('Run')
  })

  it('does nothing on stop when not started', () => {
    new EmojiTicker(button).stop()
    expect(button.textContent).toBe('Run')
  })

  it('uses the battle frames by default, keeping multi-code-point emoji whole', () => {
    new EmojiTicker(button).start()

    expect(frames()).toHaveLength(13)
    expect(frames().slice(0, 3)).toEqual(['🏹', '💥', '⚔️'])
  })
})
