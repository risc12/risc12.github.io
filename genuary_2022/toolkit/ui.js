const appendChild = (element, child) => {
  if (typeof child === "undefined") return;

  if (!(child instanceof HTMLElement)) {
    if (typeof child === "object") {
      child = document.createTextNode(JSON.stringify(child));
    } else {
      child = document.createTextNode(child);
    }
  }

  element.appendChild(child);
};

const el = (tag, attributes = {}, children = []) => {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([k, v]) => element.setAttribute(k, v));

  if (Array.isArray(children)) {
    children.forEach((child) => appendChild(element, child));
  } else {
    appendChild(element, children);
  }

  return element;
};


export default class UI {
  static init(isOpen = false, containerSelector = '#ui') {
    return new UI(isOpen || window.location.search.includes('editor'), document.querySelector(containerSelector));
  }

  constructor(isOpen, containerElement) {
    this.container = containerElement;
    this.container.classList.add('ui');

    this.callbacks = {};

    if (isOpen) {
      this.open();
    }

    window.ui = this;

    this.addButton('Close', () => this.close());
  }

  open() {
    this.container.classList.add('open');
  }

  close() {
    this.container.classList.remove('open');
  }

  setValue(name, value) {
    const elements = this.container.querySelectorAll(`[name="${name}"]`);

    elements.forEach((e) => {
      e.value = value;
    });
  }

  getValue(name) {
    const element = this.container.querySelector(`[name="${name}"]`);

    if (element) {
      let valueToEmit = element.value;

      if (valueToEmit === '') valueToEmit = element.attributes.defaultValue;

      if (element.dataset.type === 'number') valueToEmit = parseInt(valueToEmit);
      if (element.dataset.type === 'float') {
        valueToEmit = this.container.querySelector(`[name="${name}"][type="number"]`).value
      }


      return valueToEmit;
    }
  }

  onChange(callback, name = 'input') {
    if (!(name in this.callbacks)) this.callbacks[name] = [];

    this.callbacks[name].push(callback);
  }

  emitChange(name) {
    if (!(name in this.callbacks)) return;

    this.callbacks[name].forEach((callback) => {
      callback();
    });
  }

  addTitle(title) {
    const element = el('h1', {}, title);

    this.container.appendChild(element);
  }

  addInput(name, type, defaultValue, rest) {
    const element = el('div', { "class": `control ${type}` }, [
      el('label', {}, `${name}: `),
      el('input', {
        type,
        "data-type": type === 'range' ? "float": type,
        name,
        defaultValue,
        value: defaultValue,
        ...rest
      }),
      type === 'range' ? el('input', {
        type: 'number', "data-type": "float", name, defaultValue, value: defaultValue, 'class': 'range-value', ...rest
      }) : undefined
    ]);

    element.addEventListener('input', () => {
      this.emitChange('input')

      if (type === 'range') {
        element.querySelector('input[type="number"]').value = element.querySelector('input[type="range"]').value;
      }
    });

    this.container.appendChild(element);
  }

  addButton(name, callback) {
    const element = el('button', {
      name,
      "class": "button"
    }, name);

    element.addEventListener('click', () => {
      callback();
    });

    this.container.appendChild(element);
  }

  resetableInputs(setup) {
    setup.forEach(([name, type, value, ...props]) => {
      this.addInput(name, type, value(), ...props);
    });

    this.addButton('Reset', () => {
      setup
        .forEach(([name, _type, value]) => {
          this.setValue(name, value());
        });
    });
  }
}
