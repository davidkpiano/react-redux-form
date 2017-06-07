// Adapted from https://github.com/jonschlinkert/is-plain-object
export function isObjectLike(val) {
  return val != null && typeof val === 'object';
}

function isObject(val) {
  return isObjectLike(val) && Array.isArray(val) === false;
}

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

export default function isPlainObject(o) {
  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  const ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}
