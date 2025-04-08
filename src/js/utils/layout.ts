/**
 * @param {string} htmlString Should enclose the layout with one element (div, span etc.)
 * @returns {ChildNode}
 */
export const createElementFromHtml = <T extends HTMLElement = HTMLElement>(htmlString: string): T => {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()

  return div.firstChild as T
}

export const scrollToElement = (element: HTMLElement): void => {
  if (element instanceof HTMLElement) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    })
  } else {
    console.error('Invalid element passed to scrollToElement function.')
  }
}

export const getTitleFromId = (id: string): string => {
  const res = id.replace(/(?<!\s)([A-Z])/g, ' $1').trim()

  return res.slice(0, 1).toLocaleUpperCase() + res.slice(1).toLocaleLowerCase()
}

export const getElementById = <T extends HTMLElement>(id: string): T | never => {
  const res = document.getElementById(id)
  if (!res) {
    throw new Error(`DOM Element with id ${id} not found`)
  }

  return res as T
}
