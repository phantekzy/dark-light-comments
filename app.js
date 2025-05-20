import { fetchJSON } from './function/api.js';
import { alertElement } from './function/alert.js';

/**
 * Class to handle infinite scrolling and dynamic content loading.
 */
class InfinitePagination {
  #endpoint;
  #template;
  #target;
  #elements;
  #observer;
  #loading = false;
  #page = 1;
  #loader;

  /**
   * @param {HTMLElement} element - The element that triggers loading.
   */
  constructor(element) {
    this.#loader = element;
    this.#endpoint = element.dataset.endpoint;
    this.#template = document.querySelector(element.dataset.template);
    this.#target = document.querySelector(element.dataset.target);
    this.#elements = JSON.parse(element.dataset.elements);

    this.#observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          this.#loadMore();
        }
      }
    });

    this.#observer.observe(element);
  }

  /**
   * Load more comments when scrolled to bottom.
   */
  async #loadMore() {
    if (this.#loading) return;
    this.#loading = true;

    try {
      const url = new URL(this.#endpoint);
      url.searchParams.set('_page', this.#page);
      const comments = await fetchJSON(url.toString());

      if (comments.length === 0) {
        this.#observer.disconnect();
        this.#loader.remove();
        return;
      }

      for (const comment of comments) {
        const commentElement = this.#template.content.cloneNode(true);
        for (const [key, selector] of Object.entries(this.#elements)) {
          commentElement.querySelector(selector).innerText = comment[key];
        }
        this.#target.append(commentElement);
      }

      this.#page++;
      this.#loading = false;
    } catch (e) {
      this.#loader.style.display = 'none';
      const error = alertElement('Impossible de charger le contenu');
      error.addEventListener('close', () => {
        this.#loader.style.removeProperty('display');
        this.#loading = false;
      });
      this.#target.append(error);
    }
  }
}

/**
 * Handles form submission with AJAX and inserts result in DOM.
 */
class FetchForm {
  #endpoint;
  #template;
  #target;
  #elements;

  /**
   * @param {HTMLFormElement} form 
   */
  constructor(form) {
    this.#endpoint = form.dataset.endpoint;
    this.#template = document.querySelector(form.dataset.template);
    this.#target = document.querySelector(form.dataset.target);
    this.#elements = JSON.parse(form.dataset.elements);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.#submitForm(form);
    });
  }

  /**
   * Submit form and insert result in page.
   * @param {HTMLFormElement} form 
   */
  async #submitForm(form) {
    const button = form.querySelector('button');
    button.setAttribute('disabled', '');

    try {
      const data = new FormData(form);
      const comment = await fetchJSON(this.#endpoint, {
        method: 'POST',
        json: Object.fromEntries(data),
      });

      const commentElement = this.#template.content.cloneNode(true);
      for (const [key, selector] of Object.entries(this.#elements)) {
        commentElement.querySelector(selector).innerText = comment[key];
      }

      this.#target.prepend(commentElement);
      form.reset();
      button.removeAttribute('disabled');

      form.insertAdjacentElement('beforebegin', alertElement('Commentaire envoyé avec succès', 'success'));
    } catch (e) {
      const errorElement = alertElement('Erreur serveur');
      form.insertAdjacentElement('beforebegin', errorElement);
      errorElement.addEventListener('close', () => {
        button.removeAttribute('disabled');
      });
    }
  }
}

// Initialize components
document.querySelectorAll('.js-infinite-pagination').forEach(el => new InfinitePagination(el));
document.querySelectorAll('.js-form-fetch').forEach(form => new FetchForm(form));

