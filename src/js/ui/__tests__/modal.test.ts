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

  it('closes the dialog on a backdrop click only', () => {
    ;(document.getElementById('content') as HTMLElement).click()
    expect(dialog.close).not.toHaveBeenCalled()

    dialog.click()
    expect(dialog.close).toHaveBeenCalledTimes(1)
  })
})
