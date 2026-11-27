import { bindModal } from '../modal'

describe('bindModal', () => {
  let dialog: HTMLDialogElement

  beforeEach(() => {
    document.body.innerHTML = `
      <button class="opener"></button><button class="opener"></button>
      <dialog id="dlg"><div id="content"><button id="close" data-close-modal></button></div></dialog>`
    dialog = document.getElementById('dlg') as HTMLDialogElement
    // jsdom does not implement the dialog API
    dialog.showModal = jest.fn(() => dialog.setAttribute('open', ''))
    dialog.close = jest.fn(() => dialog.removeAttribute('open'))

    bindModal(dialog, document.querySelectorAll<HTMLElement>('.opener'))
  })

  it('opens the dialog from every opener', () => {
    document.querySelectorAll<HTMLElement>('.opener').forEach((opener) => opener.click())

    expect(dialog.showModal).toHaveBeenCalledTimes(2)
  })

  it('closes the dialog with a close button', () => {
    ;(document.getElementById('close') as HTMLElement).click()

    expect(dialog.close).toHaveBeenCalledTimes(1)
  })

  // a click on an element after the mouse button was pressed on another one
  const press = (pressed: HTMLElement, released: HTMLElement): void => {
    pressed.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    released.click()
  }

  it('closes the dialog on a backdrop click only', () => {
    const content = document.getElementById('content') as HTMLElement
    press(content, content)
    expect(dialog.close).not.toHaveBeenCalled()

    press(dialog, dialog)
    expect(dialog.close).toHaveBeenCalledTimes(1)
  })

  it('stays open after a drag from the content to the backdrop', () => {
    press(document.getElementById('content') as HTMLElement, dialog)
    expect(dialog.close).not.toHaveBeenCalled()
  })

  it('stays open after a drag from the backdrop to the content', () => {
    press(dialog, document.getElementById('content') as HTMLElement)
    press(document.getElementById('content') as HTMLElement, dialog)
    expect(dialog.close).not.toHaveBeenCalled()
  })
})
