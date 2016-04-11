import {document, window} from 'global';
import {isFunc, isObject, isDefined} from './lib/assert';
import factory from './loop';
import debounce from 'lodash.debounce';
import {requestAnimationFrame, cancelAnimationFrame} from './lib/polyfill';
import {EVENT_VIEWPORT, EVENT_VIEWPORT_ENTER, EVENT_VIEWPORT_LEAVE,
  EVENT_VIEWPORT_SCROLL_START, EVENT_VIEWPORT_SCROLL_STOP, EVENT_VIEWPORT_SCROLL
} from './events';

const {CustomEvent, Element} = window;

const offsetElement = isDefined(document.documentElement) ? document.documentElement : document.body;

const getViewPort = (el = window) => {
  let {innerWidth, innerHeight, pageXOffset, pageYOffset} = el;
  return {
    width: innerWidth,
    height: innerHeight,
    offsetX: pageXOffset,
    offsetY: pageYOffset,
    scrollsY: offsetElement.scrollHeight > innerHeight,
    scrollsX: offsetElement.scrollWidth > innerWidth,
    scrolling: false
  };
};

//const loop = (function () {
//  let currentFrame;
//  const _loop = () => {
//    currentFrame = requestAnimationFrame(() => {
//      updateViewPort();
//      document.dispatchEvent(new CustomEvent(EVENT_VIEWPORT_SCROLL));
//      _loop()
//    });
//  };
//
//  return {
//    start() {
//      _loop();
//    },
//    stop() {
//      cancelAnimationFrame(currentFrame);
//    }
//  };
//}());

const viewPortDirection = () => {
    return {
      down:  false,
      up:    false,
      left:  false,
      right: false,
      still: true
    };
};

const updateViewPort = (function (element = window) {
  let viewport = getViewPort(element);
  let scrolls = false;

  const isdiff = (function () {
    let keys = Object.keys(viewport);
    return (a, b) => {
      return keys.filter((key) => {
        return a[key] === b[key];
      }).length > 0;
    };
  }());

  return (forceUpdate  = false) => {
    let n = getViewPort(element);

    if (!forceUpdate && !isdiff(viewport, n)) {
      return;
    }

    let d = n.direction = viewPortDirection();

    n.speed = {
      y: 100 * Math.max(0, Math.abs(viewport.offsetY - n.offsetY)) / 100,
      x: 100 * Math.max(0, Math.abs(viewport.offsetX - n.offsetX)) / 100
    }

    n.scrolling = n.speed.y > 0 || n.speed.x > 0;

    if (n.offsetY > viewport.offsetY) {
      d.down  = true;
      d.still = false;
    } else if (n.offsetY < viewport.offsetY) {
      d.up    = true;
      d.still = false;
    }

    if (n.offsetX > viewport.offsetX) {
      d.left  = true;
      d.still = false;
    } else if (n.offsetX < viewport.offsetX) {
      d.right = true;
      d.still = false;
    }

    viewport = n;
    element.dispatchEvent(new CustomEvent(EVENT_VIEWPORT, {detail: n}));
  };
}());

const syntesizeEvent = () => {
  let vp = Object.assign({}, getViewPort(), {direction: viewPortDirection(), speed: {y: 0, x: 0}});
  return new CustomEvent(EVENT_VIEWPORT, {detail: vp});
};

const _updateViewPort = debounce(updateViewPort, 250);

/**
 * Test if a number is within a given range.
 *
 * @param {number} a
 * @param {number} b
 * @param {number} range
 * @returns {boolean}
 */
const inRange = (a, b, range = 20) => {
  return a === b || (a < b && (a + range) > b);
};

/**
 * Test if a element enters viewport
 *
 * @param {ViewPortElement} el view port element
 * @param {Object} viewPort viewport
 * @returns {boolean}
 */
const entersViewPort = (el, viewPort) => {
  if (el.inViewport) {
    return false;
  }

  return inViewport(el, viewPort);
};

/**
 * Test if a element leaves viewport
 *
 * @param {ViewPortElement} el view port element
 * @param {Object} viewPort viewport
 * @returns {boolean}
 */
const leavesViewPort = (el, viewPort) => {
  if (!el.inViewport) {
    return false;
  }

  return !inViewport(el, viewPort);
};

/**
 * Test if a element is inViewport
 *
 * @param {ViewPortElement} el view port element
 * @param {Object} viewPort viewport
 * @returns {boolean}
 */
const inViewport = (el, viewPort) => {
  return viewPort.scrollsY && (el.props.top < viewPort.offsetY + viewPort.height &&
    el.props.top > viewPort.offsetY - viewPort.height) ||
    viewPort.scrollsX && (el.props.left < viewPort.offsetX + viewPort.width &&
    (el.props.left > viewPort.offsetX - viewPort.width));
}

const getSensitivity = (viewPort) => {
  return {
    sy: Math.max(1, viewPort.speed.y / 10) * 20,
    sx: Math.max(1, viewPort.speed.x / 10) * 20
  };
}

const inFullViewport = (el, viewPort) => {
  let {sy, sx} = getSensitivity(viewPort);

  return !el.inFullViewport && (inRange(el.props.top + (el.props.height / 2), viewPort.offsetY + (viewPort.height / 2), sy))
    || viewPort.offsetX > 0 && (inRange(el.props.left + (el.props.width / 2), viewPort.offsetX + (viewPort.width / 2), sx))
}

/**
 * Updates element satus `inViewport`
 *
 * @param {CustomEvent} event a viewport event.
 * @param {ViewPortElement} el view port element
 * @returns {void}
 */
const updateElement = (event, element) => {
  if (entersViewPort(element, event.detail)) {
    element.enter(event);
    return;
  }

  if (leavesViewPort(element, event.detail)) {
    element.leave(event);
    return;
  }

  if (inFullViewport(element, event.detail)) {
    element.inFullViewport = true;
    element.el.dispatchEvent(new CustomEvent(EVENT_VIEWPORT, event || syntesizeEvent()));
  }
};

function updateViewPortElement(viewPort) {
  let {top, left, height, width} = this.el.getBoundingClientRect();
  this.props = {top: viewPort.offsetY + top, left: viewPort.offsetX + left, height, width};
  this.sensitivity = {
    y: 10,
    x: 10
  };
}

function update(event) {
  this.viewPort = event.detail;
  this.elements.forEach(el => updateElement(event, el));
};

export default class ViewPort {
  constructor() {
    this.elements = [];
    this.viewPort = {};

    this._update = update.bind(this);
    this.updateElements = this.updateElements.bind(this);

    window.addEventListener(EVENT_VIEWPORT, this._update);
    window.addEventListener('resize', this.updateElements)

    updateViewPort(true);
  }

  updateElements(event) {
    this.elements.forEach((el) => {
      el.update(this.viewPort, event);
    });
  }

  registerElements(elements, onEnter, onLeave) {
    Array.prototype.slice.call(elements, 0)
      .forEach(el => this.registerElement(el, onEnter, onLeave));
  }

  removeElements(elements, onEnter, onLeave) {
    Array.prototype.slice.call(elements, 0)
      .forEach(el => this.removeElement(el, handler));
  }

  registerElement(element, onEnter, onLeave) {
    let index = this.elements.length;
    let el = new ViewPortElement(element, function (n) {
      this.elements.splice(n, 1);

      if (isFunc(onEnter)) {
        element.removeEventListener(EVENT_VIEWPORT_ENTER, onEnter);
      }

      if (isFunc(onLeave)) {
        element.removeEventListener(EVENT_VIEWPORT_LEAVE, onLeave);
      }
    }.bind(this, index));

    if (isFunc(onEnter)) {
      element.addEventListener(EVENT_VIEWPORT_ENTER, onEnter);
    }

    if (isFunc(onLeave)) {
      element.addEventListener(EVENT_VIEWPORT_LEAVE, onLeave);
    }

    this.elements.push(el);

    this.viewPort = this.viewPort || syntesizeEvent().detail;
    el.update(this.viewPort);
  }

  removeElement(element) {
    let res = this.elements.reduce((a, b) => {
      return a && a.el === element ? a : (b && b.el === element ? b : null);
    });

    if (res !== null && res.el === element) {
      res.tearDown();
    }
  }

  tearDown() {
    this.elements.forEach(element => element.tearDown());
  }
};

class ViewPortElement {
  constructor(element, remove) {

    if (!(element instanceof Element)) {
      throw new Error('element must be instance of Element.');
    }

    this.el = element;
    this.inViewport = false;
    this.inFullViewport = false;
    this.remove = remove;
    this.props = {};
    this.sensitivity = {};
  }

  update(viewPort, event) {

    updateViewPortElement.call(this, viewPort, event);

    let e = isObject(event) ? event : viewPort;

    if (!this.inViewport && inViewport(this, viewPort)) {
      this.enter(e);
      this.el.dispatchEvent(new CustomEvent(EVENT_VIEWPORT, {detail: e}));
    } else if (this.inViewport && !inViewport(this, viewPort)) {
      this.leave(e);
    }
  }

  enter(event) {
    this.inViewport = true;
    requestAnimationFrame(() => {
      this.el.dispatchEvent(new CustomEvent(EVENT_VIEWPORT_ENTER, {detail: {viewportEvent: event}}));
    });
  }

  leave(event) {
    this.inViewport = false;
    this.inFullViewport = false;
    requestAnimationFrame(() => {
      this.el.dispatchEvent(new CustomEvent(EVENT_VIEWPORT_LEAVE, {detail: {viewportEvent: event}}));
    });
  }

  tearDown() {
    if (isFunc(this.remove)) {
      this.remove.call(null);
    }

    window.removeEventListener(EVENT_VIEWPORT, this._update);
    window.removeEventListener('resize', this.updateElements)
  }
}

export const watch = (function () {

  let started = false;

  return {

    start() {
      if (started) {
        return false;
      }

      const cancelScroll = factory('scroll');
      const cancelResize = factory('resize');

      started = true;
      window.addEventListener('scrollloop', updateViewPort);
      window.addEventListener('resizeloop', _updateViewPort);

      return () => {
        started = false;
        window.removeEventListener('scrollloop', updateViewPort);
        window.removeEventListener('resizeloop', _updateViewPort);
        cancelScroll();
        cancelResize();
      };
    }
  };
}());
