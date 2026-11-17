// Spins the logo on hover and lets the spin finish even if the cursor leaves early
export const bindLogoSpin = (logo: HTMLElement): void => {
  logo.addEventListener('mouseenter', (): void => logo.classList.add('spinning'))
  logo.addEventListener('animationend', (e): void => {
    if (e.animationName === 'rotate360-spin') {
      logo.classList.remove('spinning')
    }
  })
}
