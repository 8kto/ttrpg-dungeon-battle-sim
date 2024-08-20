const bindTabControls = (): void => {
  document.querySelectorAll('.tabs a').forEach((tab) => {
    tab.addEventListener('click', function (e: Event) {
      e.preventDefault()
      const targetId = this.getAttribute('href')

      // Hide all sections
      document.querySelectorAll('.page-content-column').forEach((section) => {
        section.classList.add('hidden')
        section.classList.remove('block')
      })

      // Remove active class from all tabs
      document.querySelectorAll('.tabs a').forEach((tab) => {
        tab.classList.remove('tab-active')
      })

      // Show the target section and set the clicked tab as active
      document.querySelector(targetId).classList.remove('hidden')
      document.querySelector(targetId).classList.add('block')
      this.classList.add('tab-active')
    })
  })
}

export const initTabs = (): void => {
  bindTabControls()
}
