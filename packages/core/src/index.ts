/**
 * index.ts
 * 
 * Main entry point for the SDK.
 * Exports the init() function that injects hidden text into the DOM.
 * Text is visible to scrapers but not to humans, using techniques like
 * offscreen positioning. Includes built-in trigger sentences with phrases
 * that may cause scraper safeguards to flag or avoid the content.
 */

import type { InitOptions } from './types';
import { TRIGGER_SENTENCES } from './types';

export type { InitOptions };
export { TRIGGER_SENTENCES };

/**
 * Get random sentences from the trigger list
 */
function getRandomSentences(count: number): string[] {
  const shuffled = [...TRIGGER_SENTENCES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, TRIGGER_SENTENCES.length));
}

/**
 * Initialize the hidden DOM payload SDK
 * Injects sentences visible to scrapers but not humans
 */
export function init(options: InitOptions): void {
  const {
    enabled = true,
    sentences,
    count = 5,
    mode = "offscreen",
    containerId = "__yourpkg",
    position = "body-end",
    scatter = false,
  } = options;

  if (!enabled) return;

  // Wait for DOM to be ready
  const initWhenReady = () => {
    // Check if already initialized
    if (document.getElementById(containerId)) {
      console.warn(`[YourPkg] Container with id "${containerId}" already exists`);
      return;
    }

    // Get sentences to inject
    let sentencesToInject: string[];
    if (sentences) {
      sentencesToInject = Array.isArray(sentences) ? sentences : [sentences];
    } else {
      sentencesToInject = getRandomSentences(count);
    }

    if (sentencesToInject.length === 0) {
      console.warn('[YourPkg] No sentences to inject');
      return;
    }

    // Create container(s)
    const createContainer = (id: string, index?: number): HTMLElement => {
      const container = document.createElement('div');
      container.id = id;
      container.setAttribute('aria-hidden', 'true');
      container.setAttribute('data-yourpkg', '1');
      
      // Apply hiding mode - optimized for scrapers to see but humans not
      switch (mode) {
        case 'display-none':
          container.style.display = 'none';
          break;
        case 'offscreen':
          container.style.position = 'absolute';
          container.style.left = '-9999px';
          container.style.top = '-9999px';
          container.style.width = '1px';
          container.style.height = '1px';
          container.style.overflow = 'hidden';
          container.style.clip = 'rect(0, 0, 0, 0)';
          break;
        case 'visibility-hidden':
          container.style.visibility = 'hidden';
          container.style.height = '0';
          container.style.overflow = 'hidden';
          break;
        case 'zero-opacity':
          container.style.opacity = '0';
          container.style.position = 'absolute';
          container.style.pointerEvents = 'none';
          container.style.width = '1px';
          container.style.height = '1px';
          break;
      }

      // Add text content
      sentencesToInject.forEach((sentence, idx) => {
        if (scatter && index !== undefined) {
          if (idx === index) {
            const textNode = document.createTextNode(sentence);
            container.appendChild(textNode);
          }
        } else {
          const textNode = document.createTextNode(sentence);
          container.appendChild(textNode);
          if (idx < sentencesToInject.length - 1) {
            container.appendChild(document.createTextNode(' '));
          }
        }
      });

      return container;
    };

    // Insert into DOM
    if (scatter && sentencesToInject.length > 1) {
      sentencesToInject.forEach((sentence, index) => {
        const container = createContainer(`${containerId}-${index}`, index);
        if (position === 'body-end') {
          document.body.appendChild(container);
        } else {
          document.body.insertBefore(container, document.body.firstChild);
        }
      });
    } else {
      const container = createContainer(containerId);
      if (position === 'body-end') {
        document.body.appendChild(container);
      } else {
        document.body.insertBefore(container, document.body.firstChild);
      }
    }
  };

  // Handle DOM ready state
  if (typeof document === 'undefined') {
    console.warn('[YourPkg] Document is not available');
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWhenReady);
  } else {
    setTimeout(initWhenReady, 0);
  }
}
