const modalActionButtons = {
  confirm: 'Confirm',
  default: 'OK',
  modal: 'OK',
  prompt: 'OK',
}

type ConfirmModalProps = {
  title: string
  message: string
  type?: 'confirm' | 'modal' // Defaults to 'confirm'
  fields?: { name: string; title: string; placeholder?: string }[]
}

type PromptModalProps = {
  title: string
  message: string
  type: 'prompt'
  fields: { name: string; title: string; placeholder?: string }[]
}

type ModalProps = ConfirmModalProps | PromptModalProps

type ShowModal = (props: ModalProps) => Promise<boolean | Record<string, string>>

export const showModal: ShowModal = async ({ fields, message, title, type = 'confirm' }): Promise<boolean> => {
  const template = document.querySelector<HTMLTemplateElement>('#template-modal')
  if (!template) {
    throw new Error('Modal template not found')
  }

  const clone = document.importNode(template.content, true)!
  const dialogElement = clone.querySelector('dialog')!
  const modalBodyElement = clone.querySelector('.modal-body')!

  clone.querySelector('.modal-title')!.textContent = title
  clone.querySelector('.modal-action-btn')!.textContent = modalActionButtons[type] || modalActionButtons.default
  modalBodyElement.innerHTML = `<p>${message}</p>`

  if (fields?.length) {
    fields.forEach((item) => {
      const input = document.createElement('input')
      input.type = 'text'
      input.className = 'input input-bordered w-full'
      input.name = item.name
      input.placeholder = item.placeholder || item.title
      modalBodyElement.appendChild(input)
    })
  }

  document.body.appendChild(dialogElement)
  if (!dialogElement) {
    throw new Error('Dialog element not found in the template')
  }

  dialogElement.returnValue = 'initialValue'

  let resolve: CallableFunction = () => null
  let reject: CallableFunction = () => null
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })

  dialogElement.addEventListener('close', () => {
    const returnValue = dialogElement.returnValue
    if (returnValue === 'ok') {
      if (type === 'modal' || type === 'confirm') {
        resolve(true)
      }
      if (type === 'prompt') {
        const form = dialogElement.querySelector('form')!
        const data = Object.fromEntries(new FormData(form))

        if (Object.values(data).some((v) => !v)) {
          resolve(false)
        }

        resolve(data)
      }
    }

    if (returnValue === 'cancel') {
      resolve(false)
    }

    reject(new Error('Modal: Invalid logic'))
  })

  dialogElement.showModal()

  return promise as Promise<boolean>
}
