import { createElementFromHtml, scrollToElement } from '../layout'

describe('layout utils', () => {
  describe('createElementFromHtml', () => {
    it('should create an element from a valid HTML string', () => {
      const htmlString = '<div>Hello World</div>'
      const element = createElementFromHtml(htmlString)

      expect(element).toBeInstanceOf(HTMLElement)
      expect(element?.nodeName).toBe('DIV')
      expect(element?.textContent).toBe('Hello World')
    })

    it('should return null for an empty string', () => {
      const htmlString = ''
      const element = createElementFromHtml(htmlString)

      expect(element).toBeNull()
    })

    it('should create an element with nested elements from a valid HTML string', () => {
      const htmlString = '<div><span>Nested</span></div>'
      const element = createElementFromHtml(htmlString)

      expect(element).toBeInstanceOf(HTMLElement)
      expect(element?.nodeName).toBe('DIV')
      expect(element?.firstChild?.nodeName).toBe('SPAN')
      expect(element?.firstChild?.textContent).toBe('Nested')
    })
  })

  describe('scrollToElement', () => {
    beforeEach(() => {
      // Mock the scrollIntoView method
      Element.prototype.scrollIntoView = jest.fn()
    })

    afterEach(() => {
      // Restore the original scrollIntoView method
      ;(Element.prototype.scrollIntoView as jest.Mock).mockRestore()
    })

    it('should call scrollIntoView on a valid HTMLElement', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      scrollToElement(element)

      expect(element.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      })

      document.body.removeChild(element)
    })

    it('should log an error for an invalid element', () => {
      console.error = jest.fn()

      const invalidElement = null
      // @ts-ignore
      scrollToElement(invalidElement)

      expect(console.error).toHaveBeenCalledWith('Invalid element passed to scrollToElement function.')

      // @ts-ignore
      console.error.mockRestore()
    })
  })
})
