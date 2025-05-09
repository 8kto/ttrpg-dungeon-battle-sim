/**
 * @jest-environment jsdom
 */
import { Logger, LogLevel } from '../Logger'

describe('Logger', () => {
  let container: HTMLElement
  let logger: Logger
  let rafSpy: jest.SpyInstance<number, [FrameRequestCallback]>

  beforeEach(() => {
    // set up DOM
    document.body.innerHTML = `<div id="log-container"></div>`
    container = document.getElementById('log-container')!

    // fake requestAnimationFrame to call immediately
    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)

      return 0
    })

    logger = new Logger('log-container')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('throws if container id not found', () => {
    expect(() => new Logger('nope')).toThrowError(/No element with id="nope"/)
  })

  it('logs INFO messages by default', () => {
    logger.log('hello')
    // one RAF scheduled
    expect(rafSpy).toHaveBeenCalledTimes(1)
    // flush happened immediately
    const ps = container.querySelectorAll('p')
    expect(ps).toHaveLength(1)
    expect(ps[0].textContent).toBe('hello')
  })

  it('buffers multi-line messages into separate <p> elements', () => {
    logger.log('line1\nline2\nline3')
    const ps = container.querySelectorAll('p')
    expect(ps).toHaveLength(3)
    expect(Array.from(ps).map((p) => p.textContent)).toEqual(['line1', 'line2', 'line3'])
  })

  it('warn() logs at WARNING level', () => {
    logger.warn('watch out')
    expect(container.querySelector('p')!.textContent).toBe('watch out')
  })

  it('respects log level: suppresses INFO below threshold', () => {
    logger.setLevel(LogLevel.WARNING)
    logger.log('info 1', LogLevel.INFO)
    logger.log('info 2', LogLevel.INFO)
    // nothing logged
    expect(container.querySelectorAll('p')).toHaveLength(0)

    logger.warn('a warning')
    expect(container.querySelectorAll('p')).toHaveLength(1)
    expect(container.querySelector('p')!.textContent).toBe('a warning')
  })

  it('clear() empties container and buffer', () => {
    logger.log('foo')
    expect(container.querySelectorAll('p')).toHaveLength(1)
    const returned = logger.clear()
    expect(returned).toBe(logger)
    expect(container.querySelectorAll('p')).toHaveLength(0)

    // after clear, further logs still work
    logger.log('bar')
    expect(container.querySelectorAll('p')).toHaveLength(1)
    expect(container.querySelector('p')!.textContent).toBe('bar')
  })
})
