import styleContents from './style.css';
import addStyle from "../../js/helpers/addStyle.js";
import '../button/button.js';

const FOCUSABLE_SELECTOR = ':where(a[href], button, textarea, input, select, details, audio, video, po-button):not([disabled])';
class Dialog extends HTMLElement {
    static observedAttributes = [
        'heading',
        'close-label',
        'cancel-label',
        'confirm-label',
    ];

    #root;

    #dialog;

    #closeButton;

    #closeEvent = new Event('close', {'bubbles': true, 'cancelable': true});

    #template = `
        <dialog part="dialog">
            <div part="header">
                <h2 part="heading"></h2>
                <button type="button" class="btn-close" part="close-button" aria-label="Close">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="12" height="12">
                      <path vector-effect="non-scaling-stroke" d="M1 11 L11 1 M1 1 L11 11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>

            <div part="content">
                <slot></slot>
            </div>

            <div part="footer">
                <po-button label="Neen" class="btn--ghost" part="cancel-button"></po-button>
                <po-button label="Submit" part="confirm-button"></po-button>
            </div>
        </dialog>
    `;

    constructor () {
        super();
        this.#root = this.attachShadow({mode: 'closed'});
        this.#root.innerHTML = this.#template;
        addStyle(this.#root, styleContents);

        this.#closeButton = this.#root.querySelector('[part="close-button"]');

        this.#dialog = this.#root.querySelector('dialog');
        this.#dialog.classList.toggle('alt-backdrop', this.#useAlternativeBackdrop());
        this.#dialog.addEventListener('keydown', this.#trapFocus);
        this.#dialog.addEventListener('close', () => {
            this.close();
        });

        this.addEventListener('close', this.#closeHandler);
        this.#root.querySelector('[part="close-button"]').addEventListener('click', this.close);
        this.#root.querySelector('[part="cancel-button"]').addEventListener('click', this.close);
    }

    attributeChangedCallback (attr, oldValue, newValue) {
        switch (attr) {
            case 'heading':
                this.#root.querySelector('[part="heading"]').innerText = newValue;
                break;
            case 'close-label':
                this.#root.querySelector('[part="close-button"]').setAttribute('aria-label', newValue);
                break;
            case 'cancel-label':
                this.#root.querySelector('[part="cancel-button"]').label = newValue;
                break;
            case 'confirm-label':
                this.#root.querySelector('[part="confirm-button"]').label = newValue;
        }
    }

    showModal = () => {
        this.#dialog.showModal();
        this.#closeButton.blur();
    };

    close = () => {
        this.dispatchEvent(this.#closeEvent);
    };

    #closeHandler = (event) => {
        if (event.defaultPrevented) {
            return;
        }
        this.#dialog.close();
    };

    #useAlternativeBackdrop = () => {
        const ua = navigator.userAgent;
        return ua.includes('X11') || ua.includes('Ubuntu') || ua.includes('Linux');
    };

    #trapFocus = (e) => {
        const focusable = [...this.#dialog.querySelectorAll(FOCUSABLE_SELECTOR)];
        const firstFocusableEl = focusable.shift();
        const lastFocusableEl = focusable.pop();
        const KEYCODE_TAB = 9;

        const isTabPressed = e.key === 'Tab' || e.keyCode === KEYCODE_TAB;

        if (!isTabPressed) {
            return;
        }

        if (e.shiftKey && e.target === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
            return;
        }

        if (e.target === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
        }
    };

    set heading (newValue) {
        this.setAttribute('heading', newValue);
    }

    get heading () {
        return this.getAttribute('heading');
    }

    set cancelLabel (newValue) {
        this.setAttribute('cancel-label', newValue);
    }

    get cancelLabel () {
        return this.getAttribute('cancel-label');
    }

    set confirmLabel (newValue) {
        this.setAttribute('confirm-label', newValue);
    }

    get confirmLabel () {
        return this.getAttribute('confirm-label');
    }

    get confirmButton () {
        return this.#root.querySelector('[part="confirm-button"]');
    }

    get cancelButton () {
        return this.#root.querySelector('[part="cancel-button"]');
    }
}

customElements.define('po-dialog', Dialog);

export default Dialog;
