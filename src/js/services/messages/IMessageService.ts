import type { MessageArgs, MessageKey } from './types'

export interface IMessageService {
  // the template of the key with the params interpolated
  t<K extends MessageKey>(key: K, ...args: MessageArgs<K>): string
}
