/**
 * Utility functions for form handling
 */

/**
 * Handles Enter key press to move to next input field instead of submitting form
 * @param e - Keyboard event
 * @param currentIndex - Current field index
 * @param totalFields - Total number of fields
 */
export const handleEnterKeyNavigation = (
  e: React.KeyboardEvent<HTMLInputElement>,
  currentIndex: number,
  totalFields: number
) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    
    // Find all focusable input elements in the form
    const form = e.currentTarget.closest('form')
    if (!form) return
    
    const focusableElements = form.querySelectorAll(
      'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
    ) as NodeListOf<HTMLElement>
    
    const elementsArray = Array.from(focusableElements)
    const currentElementIndex = elementsArray.indexOf(e.currentTarget)
    
    if (currentElementIndex !== -1) {
      const nextIndex = currentElementIndex + 1
      
      // If we're not at the last field, move to next field
      if (nextIndex < elementsArray.length) {
        const nextElement = elementsArray[nextIndex]
        nextElement.focus()
      }
      // If we're at the last field, don't do anything (let user manually submit)
    }
  }
}

/**
 * Simple Enter key handler that prevents form submission
 * @param e - Keyboard event
 */
export const preventEnterSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
    e.preventDefault()
  }
}
