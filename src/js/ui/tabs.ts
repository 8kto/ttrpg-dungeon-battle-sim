type Tab = {
  button: HTMLElement
  panel: HTMLElement
}

// Clicking a tab button shows its panel and hides the others
export const bindTabs = (tabs: Tab[]): void => {
  tabs.forEach(({ button }) => {
    button.addEventListener('click', (): void => {
      tabs.forEach((tab) => {
        const isActive = tab.button === button
        tab.panel.classList.toggle('hidden', !isActive)
        tab.button.classList.toggle('active', isActive)
      })
    })
  })
}
