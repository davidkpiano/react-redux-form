export default function debounce(func, delay) {
  let timeout;
  let laterFunc;

  const createLaterFunc = (args) => () => {
    timeout = null;
    func.apply(null, args);

    // Only run the deferred function once
    laterFunc = undefined;
  };

  const debouncedFunc = (...args) => {
    clearTimeout(timeout);
    laterFunc = createLaterFunc(args);
    timeout = setTimeout(laterFunc, delay);
  };

  debouncedFunc.flush = () => {
    clearTimeout(timeout);
    if (laterFunc) laterFunc();
  };

  debouncedFunc.cancel = () => {
    clearTimeout(timeout);
    laterFunc = undefined;
  };

  return debouncedFunc;
}
