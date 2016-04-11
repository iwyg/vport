import {window, document} from 'global';

const {CustomEvent} = window;

const createLoop = (eventName, element) => {
  let frame;
  const loop = () => {
    frame = requestAnimationFrame(loop);
    element.dispatchEvent(new CustomEvent(eventName + 'loop'));
  };

  const loopStart = () => {
    loop();
  };

  const loopStop = () => {
    cancelAnimationFrame(frame);
  };

  element.addEventListener(eventName + 'start', loopStart, false);
  element.addEventListener(eventName + 'end', loopStop, false);

  return () => {
    element.removeEventListener(eventName + 'start', loopStart, false);
    element.removeEventListener(eventName + 'end', loopStop, false);
  }

};

const factory = (eventName) => {
  let tiggers = {
  };

  if (['scroll', 'resize', 'orientationchange'].indexOf(eventName) < 0) {
    throw new Error();
  }

  let element = eventName === 'scroll' ? document : window;

  return (function () {
    let timer;
    let started = false;
    return () => {
      element.addEventListener(eventName, (e) => {
        clearTimeout(timer);

        if (!started) {
          element.dispatchEvent(new CustomEvent(eventName + 'start', {detail: e}));
          started = true;
        }

        timer = setTimeout(() => {
          started = false;
          element.dispatchEvent(new CustomEvent(eventName + 'end', {detail: e}));
        }, 250);
      });

      return createLoop(eventName, element);
    }
  }());
};

export default factory;
