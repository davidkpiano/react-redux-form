/* eslint-disable */

const _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
  ? (obj) => typeof obj
  : (obj) => obj && typeof Symbol === "function" && obj.constructor === Symbol
    ? "symbol"
    : typeof obj;

const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y) {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return x !== 0 || 1 / x === 1 / y;
  } else {
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
  }
}

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 */
function shallowEqual(objA, objB, options = {}) {
  if (is(objA, objB)) {
    return true;
  }

  if ((typeof objA === 'undefined' ? 'undefined' : _typeof(objA)) !== 'object' || objA === null || (typeof objB === 'undefined' ? 'undefined' : _typeof(objB)) !== 'object' || objB === null) {
    return false;
  }

  if(objA instanceof Date && objB instanceof Date) {
    return objA === objB;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  const {
    omitKeys,
    deepKeys,
  } = options;

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    // if key is an omitted key, skip comparison
    if (omitKeys && omitKeys.length && ~omitKeys.indexOf(keysA[i])) continue;


    if (deepKeys && deepKeys.length && ~deepKeys.indexOf(keysA[i])) {
      const result = shallowEqual(objA[keysA[i]], objB[keysA[i]]);

      if (!result) return false;
    } else if (!hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}

export default shallowEqual;
