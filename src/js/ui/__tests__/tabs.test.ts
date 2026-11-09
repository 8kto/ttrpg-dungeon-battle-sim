import { bindTabs } from '../tabs'

describe('bindTabs', () => {
  it('shows the clicked tab panel and hides the others', () => {
    document.body.innerHTML = `
      <button id="a-btn" class="active"></button><button id="b-btn"></button>
      <div id="a"></div><div id="b" class="hidden"></div>`
    const el = (id: string): HTMLElement => document.getElementById(id) as HTMLElement

    bindTabs([
      { button: el('a-btn'), panel: el('a') },
      { button: el('b-btn'), panel: el('b') },
    ])

    el('b-btn').click()
    expect(el('a').classList.contains('hidden')).toBe(true)
    expect(el('b').classList.contains('hidden')).toBe(false)
    expect(el('a-btn').classList.contains('active')).toBe(false)
    expect(el('b-btn').classList.contains('active')).toBe(true)

    el('a-btn').click()
    expect(el('a').classList.contains('hidden')).toBe(false)
    expect(el('b').classList.contains('hidden')).toBe(true)
  })
})
