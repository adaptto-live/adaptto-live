/**
 * Copies a hidden HTML element to clipboard.
 * Element is expected to be hidden via bootstrap 'd-none' class.
 * @param element Hidden HTML element
 */
export default function copyElementToClipboard(element : Element) : void {
  element.classList.remove('d-none')
  // create a Range object
  const range = document.createRange()
  // set the Node to select the "range"
  range.selectNode(element)
  // add the Range to the set of window selections
  window.getSelection()?.addRange(range)
  // execute 'copy', can't 'cut' in this case
  document.execCommand('copy')
  element.classList.add('d-none')
}
