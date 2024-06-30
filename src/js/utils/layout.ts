/**
 * @param {string} htmlString Should enclose the layout with one element (div, span etc.)
 * @returns {ChildNode}
 */
export const createElementFromHtml = <T = HTMLElement>(htmlString: string): T => {
  const div = document.createElement('div') as T
  div.innerHTML = htmlString.trim()

  return div.firstChild
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
