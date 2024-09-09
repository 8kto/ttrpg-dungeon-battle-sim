import { createElementFromHtml } from '../utils/layout'

type InputField = {
  name: string
  title: string
  placeholder?: string
  defaultValue?: string | number
  valueType?: 'string' | 'number' // Defaults to 'string'
}

type ConfirmModalProps = {
  title?: string
  message?: string
  type?: 'confirm' | 'modal' // Defaults to 'confirm'
  fields?: InputField[]
}

type PromptModalProps = {
  title?: string
  message?: string
  type: 'prompt'
  fields: InputField[]
}

type ModalProps = ConfirmModalProps | PromptModalProps
type ShowModalFn = <T = boolean | Record<string, string>>(props: ModalProps) => Promise<T>

enum ReturnValue {
  initialValue = 'initialValue',
  cancel = 'cancel',
  ok = 'ok',
}

const modalActionButtons: Record<string, string> = {
  confirm: 'Confirm',
  default: 'OK',
  modal: 'OK',
  prompt: 'OK',
}

const createInputFields = (fields: InputField[], container: HTMLElement): void => {
  fields.forEach(({ defaultValue, name, placeholder, title, valueType }) => {
    // Use the createElementFromHtml utility to create the label and input structure
    const label = createElementFromHtml<HTMLLabelElement>(`
      <label class="form-control w-full">
        <div class="label">
          <span class="label-text">${title}</span>
        </div>
        <input
          type="${valueType === 'number' ? 'number' : 'text'}"
          class="input input-bordered w-full"
          name="${name}"
          placeholder="${placeholder ?? ''}"
          required
        />
      </label>
    `)

    if (typeof defaultValue !== 'undefined') {
      const input = label.querySelector('input')!
      input.value = defaultValue.toString()
    }

    container.appendChild(label)
  })
}

const extractFormData = (form: HTMLFormElement): Record<string, string> => {
  return Object.fromEntries(new FormData(form)) as Record<string, string>
}

export const showModal: ShowModalFn = async <T = boolean | Record<string, string>>({
  fields = [],
  message,
  title,
  type = 'confirm',
}: ModalProps): Promise<T> => {
  const template = document.querySelector<HTMLTemplateElement>('#template-modal')
  if (!template) {
    throw new Error('Modal template not found')
  }

  const clone = document.importNode(template.content, true)
  const dialogElement = clone.querySelector<HTMLDialogElement>('dialog')
  const modalBodyElement = clone.querySelector<HTMLDivElement>('.modal-body')
  const titleElement = clone.querySelector('.modal-title')
  const actionButton = clone.querySelector('.modal-action-btn')
  const cancelButton = clone.querySelector('.modal-cancel-btn')

  if (!dialogElement || !modalBodyElement || !titleElement || !actionButton) {
    throw new Error('Modal layout is incomplete')
  }

  if (title) {
    titleElement.textContent = title
  }
  if (message) {
    modalBodyElement.innerHTML = `<p>${message}</p>`
  }
  if (fields?.length) {
    createInputFields(fields, modalBodyElement)
  }

  actionButton.textContent = modalActionButtons[type] || modalActionButtons.default
  dialogElement.returnValue = ReturnValue.initialValue

  document.body.appendChild(dialogElement)

  cancelButton.addEventListener('click', () => {
    dialogElement.returnValue = ReturnValue.cancel
    dialogElement.close()
  })

  const promise = new Promise<T>((resolve, reject) => {
    dialogElement.addEventListener('close', () => {
      const returnValue: ReturnValue = dialogElement.returnValue

      switch (returnValue) {
        case ReturnValue.ok:
          if (type === 'modal' || type === 'confirm') {
            resolve(true)
          } else if (type === 'prompt') {
            const form = dialogElement.querySelector('form')!
            const data = extractFormData(form)

            if (Object.values(data).some((value) => !value)) {
              resolve(false)
            } else {
              resolve(data)
            }
          }
          break
        case ReturnValue.cancel:
        case ReturnValue.initialValue:
          resolve(false)
          break
        default:
          reject(new Error(`Modal: Invalid returnValue: "${returnValue}"`))
      }
    })
  })

  dialogElement.showModal()

  return promise
}
