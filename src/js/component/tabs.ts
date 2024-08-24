const bindTabControls = (): void => {
  document.querySelectorAll('.tabs-content-columns a').forEach((tab) => {
    tab.addEventListener('click', function (e: Event) {
      e.preventDefault()
      const targetId = this.getAttribute('href')

      // Hide all sections
      document.querySelectorAll('.page-content-column').forEach((section) => {
        section.classList.add('hidden')
        section.classList.remove('block')
      })

      // Remove active class from all tabs
      document.querySelectorAll('.tabs-content-columns a').forEach((tab) => {
        tab.classList.remove('tab-active')
      })

      // Show the target section and set the clicked tab as active
      document.querySelector(targetId).classList.remove('hidden')
      document.querySelector(targetId).classList.add('block')
      this.classList.add('tab-active')
    })
  })
}

const cleanup = (): void => {
  document.querySelectorAll('.page-content-column').forEach((element) => {
    element.classList.remove('hidden')
  })
}

const bindResize = (): void => {
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      if (entry.contentRect.width >= 768) {
        cleanup()
      }
    }
  })

  resizeObserver.observe(document.documentElement)
}

export const initTabs = (): void => {
  bindTabControls()
  bindResize()
}
