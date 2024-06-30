/**
 * Dispatches a custom event with an optional payload.
 */
export const dispatchEvent = (name: string, payload: object = {}): void => {
  document.dispatchEvent(new CustomEvent(name, { detail: payload }))
}
