/**
 * @jest-environment jsdom
 */
import { Logger } from '../Logger'

describe('Logger', () => {
  let textarea: HTMLTextAreaElement
  let logger: Logger
  let rafSpy: jest.SpiedFunction<typeof requestAnimationFrame>

  beforeEach(() => {
    // Set up a fake textarea in the DOM
    document.body.innerHTML = `<textarea id="log"></textarea>`
    textarea = document.getElementById('log') as HTMLTextAreaElement

    // Spy on requestAnimationFrame to invoke the callback immediately
    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)

      return 0
    })

    logger = new Logger('log')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('logs', () => {
    logger.log('First')
    logger.log('Second')

    expect(textarea.value).toBe('First\nSecond\n')
    expect(textarea.scrollTop).toBe(textarea.scrollHeight)
  })

  it('allows subsequent logs to schedule new frame after flush', () => {
    logger.log('One')
    expect(rafSpy).toHaveBeenCalledTimes(1)
    expect(textarea.value).toBe('One\n')

    // Next log should schedule again
    logger.log('Two')
    expect(rafSpy).toHaveBeenCalledTimes(2)
    expect(textarea.value).toBe('One\nTwo\n')
  })

  it('clear() empties both buffer and textarea', () => {
    logger.log('Hello')
    // flush
    expect(textarea.value).toBe('Hello\n')

    logger.clear()
    expect(textarea.value).toBe('')
    // buffer was also cleared, so no further output
    logger.log('World')
    expect(textarea.value).toBe('World\n')
  })
})
