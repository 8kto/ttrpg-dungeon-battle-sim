/**
 * Dispatches a custom event with an optional payload.
 */
export const dispatchEvent = (name: string, payload: object = {}): void => {
  document.dispatchEvent(new CustomEvent(name, { detail: payload }))
}

export const subscribe = (eventName: string, eventHandler: (e: CustomEvent) => void): void => {
  document.addEventListener(eventName, eventHandler as EventListener)
}
