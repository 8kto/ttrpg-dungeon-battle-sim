import { assert } from '../assert'

describe('assert', () => {
  // eslint-disable-next-line no-undefined
  it.each([false, null, undefined])('should throw for missing value or failed condition [%j]', (input) => {
    expect(() => assert(input, 'Var is falsy')).toThrowError('Var is falsy')
  })

  // eslint-disable-next-line no-undefined
  it.each([false, null, undefined, 0, '', NaN])('should throw for falsy values comparison [%j]', (input) => {
    // @ts-ignore
    expect(() => assert(input > 0, 'Var is not greater than 0')).toThrowError('Var is not greater than 0')
  })

  it.each([{}, [], 0, '', NaN, 1, true, 'false', '0', Symbol('X'), new Set()])(
    'should not throw for defined value [%j]',
    (input) => {
      expect(() => assert(input, 'Var is falsy')).not.toThrow()
    },
  )
})
