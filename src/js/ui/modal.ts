import { onClick } from '../utils/dom'

// Opens the dialog from any of the openers; closes it with [data-close-modal] buttons, a backdrop click or Esc
export const bindModal = (dialog: HTMLDialogElement, openers: Iterable<HTMLElement>): void => {
  Array.from(openers).forEach((opener) => {
    onClick(opener, () => dialog.showModal())
  })

  dialog.querySelectorAll<HTMLElement>('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', (): void => dialog.close())
  })

  // clicks on the content land on its children, only backdrop clicks target the dialog itself; so does a drag, e.g.
  // a text selection, from the content to the backdrop, which must not close the dialog: the press counts too
  let pressedOnBackdrop = false
  dialog.addEventListener('mousedown', (e): void => {
    pressedOnBackdrop = e.target === dialog
  })
  dialog.addEventListener('click', (e): void => {
    if (pressedOnBackdrop && e.target === dialog) {
      dialog.close()
    }
    pressedOnBackdrop = false
  })
}
