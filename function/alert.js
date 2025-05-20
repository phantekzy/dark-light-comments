/**
 * Creates a Bootstrap alert element.
 *
 * @param {string} message - Message to display.
 * @param {string} [type='danger'] - Bootstrap alert type.
 * @returns {HTMLElement} - DOM alert element.
 */
export function alertElement(message, type = 'danger') {
  const el = document.querySelector('#alert').content.firstElementChild.cloneNode(true);
  el.classList.add(`alert-${type}`);
  el.querySelector('.js-text').innerText = message;

  el.querySelector('button').addEventListener('click', (e) => {
    e.preventDefault();
    el.remove();
    el.dispatchEvent(new CustomEvent('close'));
  });

  return el;
}

