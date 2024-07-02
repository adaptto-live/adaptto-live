import { Modal } from 'bootstrap'

/**
 * Show Bootstrap modal with given ID.
 * Throws error if no HTML element with the given ID was found.
 * @param modalId HTML element ID of modal dialog
 */
export default function showModal(modalId : string) : void {
  showModalInternal(modalId, false)
}

/**
 * Show Bootstrap modal with given ID.
 * @param modalId HTML element ID of modal dialog
 * @return true if HTML element was found
 */
export function showModalIfExist(modalId : string) : boolean {
  return showModalInternal(modalId, true)
}

function showModalInternal(modalId : string, ignoreError? : boolean) : boolean {
  const modalElement = document.getElementById(modalId)
  if (modalElement) {
    if (!modalElement.classList.contains('show')) {
      new Modal(modalElement).show()
    }
    return true
  }
  else if (ignoreError) {
    return false
  }
  else {
    throw new Error(`Modal '#${modalId}' not found.`)
  }
}
