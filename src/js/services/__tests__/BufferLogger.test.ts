import { BufferLogger } from '../BufferLogger'
import { LogLevel } from '../ILogger'

describe('BufferLogger', () => {
  it('collects messages and drains them', () => {
    const logger = new BufferLogger()
    logger.log('one')
    logger.warn('two')
    logger.lineBreak()

    expect(logger.drain()).toEqual(['one', 'two', '\n'])
    expect(logger.drain()).toEqual([])
  })

  it('skips skippable messages at NO_SKIP level', () => {
    const logger = new BufferLogger(LogLevel.NO_SKIP)
    logger.log('details')
    logger.delimiter()
    logger.warn('summary')

    expect(logger.isVerbose()).toBe(false)
    expect(logger.drain()).toEqual(['summary'])
  })
})
