import { getRandomArrayItem } from 'ttrpg-lib-dice'

export class NameProvider<T = string[][]> {
  constructor(private chunks: T[]) {}

  getName(suffix: string = ''): string {
    if (!Array.isArray(this.chunks) || !Array.isArray(this.chunks[0])) {
      throw new Error('Dictionary must be an array of string arrays')
    }

    const depth = this.chunks[0].length
    let name = ''
    for (let i = 0; i < depth; i++) {
      const row = getRandomArrayItem(this.chunks as string[][])
      name += row[i]
    }

    return suffix ? `${name} ${suffix}` : name
  }
}
