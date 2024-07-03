import { dispatchEvent } from '../event'

// Mock the document's dispatchEvent method
beforeEach(() => {
  jest.spyOn(document, 'dispatchEvent')
})

afterEach(() => {
  ;(document.dispatchEvent as jest.Mock).mockRestore()
})

describe('event utils', () => {
  describe('dispatchEvent', () => {
    it('should dispatch a custom event with the given name', () => {
      const eventName = 'testEvent'
      const payload = { key: 'value' }

      dispatchEvent(eventName, payload)

      expect(document.dispatchEvent).toHaveBeenCalledTimes(1)
      expect(document.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent))

      const event = (document.dispatchEvent as jest.Mock).mock.calls[0][0] as CustomEvent
      expect(event.type).toBe(eventName)
      expect(event.detail).toEqual(payload)
    })

    it('should dispatch a custom event with an empty payload if none is provided', () => {
      const eventName = 'testEventWithoutPayload'

      dispatchEvent(eventName)

      expect(document.dispatchEvent).toHaveBeenCalledTimes(1)
      expect(document.dispatchEvent).toHaveBeenCalledWith(expect.any(CustomEvent))

      const event = (document.dispatchEvent as jest.Mock).mock.calls[0][0] as CustomEvent
      expect(event.type).toBe(eventName)
      expect(event.detail).toEqual({})
    })
  })
})
