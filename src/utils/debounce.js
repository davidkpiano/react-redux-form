export default function debounce(func, delay) {
  let timeout;
  let laterFunc;

  const createLaterFunc = (args) => () => {
    timeout = null;
    func.apply(null, args);
  };

  const debouncedFunc = (...args) => {
    clearTimeout(timeout);
    laterFunc = createLaterFunc(args);
    timeout = setTimeout(laterFunc, delay);
  };

  debouncedFunc.flush = () => laterFunc();

  return debouncedFunc;
}
