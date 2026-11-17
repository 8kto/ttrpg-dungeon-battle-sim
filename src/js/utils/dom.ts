// Stateless DOM helpers; the lookups assume the markup is there and don't check for null

export const byId = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T

export const query = <T extends HTMLElement>(root: ParentNode, selector: string): T => root.querySelector(selector) as T

export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string = '',
  text: string = '',
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag)
  node.className = className
  node.textContent = text

  return node
}

// a click that doesn't follow a link or submit a form
export const onClick = (target: HTMLElement, handler: () => void): void => {
  target.addEventListener('click', (e): void => {
    e.preventDefault()
    handler()
  })
}

export const button = (className: string, text: string, handler: () => void): HTMLButtonElement => {
  const node = el('button', className, text)
  node.type = 'button'
  onClick(node, handler)

  return node
}
