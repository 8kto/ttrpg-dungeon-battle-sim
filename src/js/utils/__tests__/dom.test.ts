import { button, byId, el, onClick, query } from '../dom'

describe('el', () => {
  it('creates an element with a class and text', () => {
    const node = el('span', 'chip chip--tag', 'claws')
    expect(node.tagName).toBe('SPAN')
    expect(node.className).toBe('chip chip--tag')
    expect(node.textContent).toBe('claws')
  })

  it('creates an empty element by default', () => {
    const node = el('div')
    expect(node.className).toBe('')
    expect(node.textContent).toBe('')
  })
})

describe('button', () => {
  it('creates a non-submitting button with a click handler', () => {
    document.body.innerHTML = '<form></form>'
    const onClick = jest.fn()
    const node = button('add', '+ Add', onClick)
    document.querySelector('form')?.appendChild(node)

    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    node.dispatchEvent(click)

    expect(node.type).toBe('button')
    expect(node.textContent).toBe('+ Add')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(click.defaultPrevented).toBe(true)
  })
})

describe('lookups', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"><input class="field" /></div>'
  })

  it('find an element by id', () => {
    expect(byId('root').id).toBe('root')
  })

  it('find an element by selector inside a root', () => {
    expect(query<HTMLInputElement>(byId('root'), '.field').tagName).toBe('INPUT')
  })
})

describe('onClick', () => {
  it('calls the handler and prevents the default action', () => {
    document.body.innerHTML = '<a href="#top">link</a>'
    const link = document.querySelector('a') as HTMLElement
    const handler = jest.fn()
    onClick(link, handler)

    const click = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(click)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(click.defaultPrevented).toBe(true)
  })
})
