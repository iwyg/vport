export const typeOf = (thing, type) => {
  return typeof thing === type;
};

export const isFunc = (thing) => {
  return typeOf(thing, 'function');
};

export const isString = (thing) => {
  return typeOf(thing, 'string');
};

export const isObject = (thing) => {
  return null !== thing && typeOf(thing, 'object');
};

export const isArray = (thing) => {
  return typeOf(thing, 'array');
};

export const isNumber = (thing) => {
  return isNaN(thing) === false && typeOf(thing, 'number');
};

export const stringable = (thing) => {
  return isFunc(thing.toString);
};

export const isDefined = (thing) => {
  return !typeOf(thing, 'undefined');
}

export default {
  typeOf,
  isFunc,
  isArray,
  isObject,
  isNumber,
  stringable,
  isDefined
};
