export const renderErrorMessage = (errorMessage: string): void => {
  const pageContentElement = document.querySelector('.page-content')
  const errorMsgElement = document.createElement('div')

  errorMsgElement.className = 'border rounded px-4 py-2 border-red-400 bg-red-100 m-auto my-10'
  errorMsgElement.textContent = errorMessage
  pageContentElement.classList.add('text-center')
  pageContentElement.innerHTML = ''
  pageContentElement.appendChild(errorMsgElement)
}
