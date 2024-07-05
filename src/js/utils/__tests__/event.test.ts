import { dispatchEvent, subscribe } from '../event'

describe('event utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(document, 'dispatchEvent')
  })

  afterEach(() => {
    ;(document.dispatchEvent as jest.Mock).mockRestore()
  })

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

  describe('subscribe', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should handle custom event with specific details', () => {
      const mockEventHandler = jest.fn()
      const eventName = 'RenderInventory'
      const eventDetail = { inventoryId: '123', inventoryName: 'Main Inventory' }

      subscribe(eventName, mockEventHandler as unknown as (e: CustomEvent) => void)

      // Create a custom event to dispatch
      const event = new CustomEvent(eventName, { detail: eventDetail })
      document.dispatchEvent(event)

      // Ensure the event handler was called with the correct details
      expect(mockEventHandler).toHaveBeenCalledTimes(1)
      expect(mockEventHandler).toHaveBeenCalledWith(expect.objectContaining({ detail: eventDetail }))
    })
  })
})
