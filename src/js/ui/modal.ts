// Opens the dialog from any of the openers; closes it with [data-close-modal] buttons, a backdrop click or Esc
export const bindModal = (dialog: HTMLDialogElement, openers: Iterable<HTMLElement>): void => {
  Array.from(openers).forEach((opener) => {
    opener.addEventListener('click', (e): void => {
      e.preventDefault()
      dialog.showModal()
    })
  })

  dialog.querySelectorAll<HTMLElement>('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', (): void => dialog.close())
  })

  // clicks on the content land on its children, only backdrop clicks target the dialog itself
  dialog.addEventListener('click', (e): void => {
    if (e.target === dialog) {
      dialog.close()
    }
  })
}
